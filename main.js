/*--------------------------------------------------------------
Core module
requires browser features:
'querySelectorAll' in el
'isArray' in Array
el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector
--------------------------------------------------------------*/
function $(selector) {
    return selector instanceof $ ? selector : this instanceof $ ? this.init(selector) : new $(selector);
}
var api = {
    init: function(selector) {
        var nodes = [];
        if ($.isArray(selector)) {
            nodes = selector;
        } else if (typeof selector === 'string') {
            selector = $.trim(selector);
            nodes = selector[0] === '<' ? $.parseHtml(selector) : $.queryNodes(selector);
        } else {
            nodes = [selector];
        }
        this.nodes = nodes;
        this.length = nodes.length;
    },
    each: function(callback) {
        for (var i = 0; i < this.length; i++) {
            if (callback.call(this.nodes[i], i, this.nodes[i]) === false) {
                break;
            }
        }
        return this;
    },
    map: function(callback) {
        return new $($.map(this.nodes, function(el, i) {
            return callback.call(el, i, el);
        }));
    },
    eq: function(index) {
        return new $(this.get(index) || []);
    },
    get: function(index) {
        return typeof index !== 'undefined' ? this.nodes[index] : this.nodes;
    },
    is: function(selector) {
        return selector instanceof $ ? this.nodes[0] === selector.nodes[0] : $.matches(this.nodes[0], selector);
    },
    extend: function(plugins) {
        $.extend(api, plugins);
    }
};
var utils = {
    isArray: Array.isArray,
    each: function(collection, callback) {
        if ($.isArray(collection)) {
            for (var i = 0; i < collection.length; i++) {
                if (callback(i, collection[i]) === false) { break; }
            }
        } else {
            for (var key in collection) {
                if (callback(key, collection[key]) === false) { break; }
            }
        }
    },
    extend: function(out) {
        out === true && (out = {});
        for (var i = 1; i < arguments.length; i++) {
            for (var key in arguments[i]) {
                arguments[i].hasOwnProperty(key) && (out[key] = arguments[i][key]);
            }
        }
        return out;
    },
    parseHtml: function(html) {
        var div = document.createElement('div');
        div.innerHTML = html;
        return $.slice(div.childNodes);
    },
    queryNodes: function(selector, context) {
        context = context || document;
        return context.querySelectorAll ? $.slice(context.querySelectorAll(selector)) : [];
    },
    matches: function(el, selector) {
        return (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector).call(el, selector);
    },
    trim: function(string) {
        return string.trim();
    },
    map: function(collection, callback) {
        var temp = [],
            iterator = function(value, key) {
                var result = callback(value, key);
                typeof result !== 'undefined' && result !== null && temp.push(result);
            };
        if ($.isArray(collection)) {
            for (var i = 0; i < collection.length; i++) {
                iterator(collection[i], i);
            }
        } else {
            for (var key in collection) {
                iterator(collection[key], key);
            }
        }
        return temp;
    },
    slice: function(obj, start, end) {
        return Array.prototype.slice.call(obj, start, end);
    }
};
$.prototype = $.fn = api;
utils.extend($, utils);
/*--------------------------------------------------------------
Deferred module
--------------------------------------------------------------*/
function Deferred() {
    this.currentState = 'pending';
    this.onDone = [];
    this.onFail = [];
}
function settle(method, args) {
    var settleViaResolve = method === 'resolve';
    if (this.currentState === 'pending') {
        this.currentState = settleViaResolve ? 'resolved' : 'rejected';
        this[settleViaResolve ? 'doneWith' : 'failedWith'] = args;
        $.each(this[settleViaResolve ? 'onDone' : 'onFail'], function(i, callback) {
            callback.apply(this, args);
        });
    }
    return this;
}
Deferred.prototype = {
    state: function() {
        return this.currentState;
    },
    then: function(done, fail) {
        done && this.done(done);
        fail && this.fail(fail);
        return this;
    },
    always: function(callback) {
        return this.then(callback, callback);
    },
    done: function(callback) {
        this.doneWith ? callback.apply(this, this.doneWith) : this.onDone.push(callback);
        return this;
    },
    fail: function(callback) {
        this.failedWith ? callback.apply(this, this.failedWith) : this.onFail.push(callback);
        return this;
    },
    resolve: function() {
        return settle.call(this, 'resolve', $.slice(arguments));
    },
    reject: function() {
        return settle.call(this, 'reject', $.slice(arguments));
    }
};
$.extend($, {
    Deferred: function() {
        return new Deferred();
    },
    when: function() {
        var deferreds = $.slice(arguments);
        var whenDeferred = $.Deferred();
        var checkDeferreds = function() {
            var resolvedArgs = [];
            var rejectedArgs;
            $.each(deferreds, function(i, deferred) {
                if (deferred instanceof Deferred) {
                    if (deferred.state() === 'resolved') {
                        resolvedArgs.push(deferred.doneWith);
                    } else if (deferred.state() === 'rejected') {
                        rejectedArgs = deferred.failedWith;
                        return false;
                    }
                } else {
                    resolvedArgs.push([deferred]);
                }
            });
            if (rejectedArgs) {
                settle.call(whenDeferred, 'reject', rejectedArgs);
            }
            if (resolvedArgs.length === deferreds.length) {
                resolvedArgs = deferreds.length === 1 ? resolvedArgs[0] : $.map(resolvedArgs, function(args) {
                    return args.length === 1 ? args[0] : args;
                });
                settle.call(whenDeferred, 'resolve', resolvedArgs);
            }
        };
        $.each(deferreds, function(i, deferred) {
            deferred instanceof Deferred && deferred.always(checkDeferreds);
        });
        checkDeferreds();
        return whenDeferred;
    }
});
/*--------------------------------------------------------------
Manipulation module
--------------------------------------------------------------*/
$.fn.extend({
    append: function(obj) {
        return this.each(function(i, el) {
            $(obj).each(function(i, objEl) {
                el.appendChild(objEl);
            });
        });
    },
    prepend: function(obj) {
        return this.each(function(i, el) {
            $(obj).each(function(i, objEl) {
                el.insertBefore(objEl, el.firstChild);
            });
        });
    },
    appendTo: function(obj) {
        return this.each(function(i, el) {
            $(obj).each(function(i, objEl) {
                objEl.appendChild(el);
            });
        });
    },
    prependTo: function(obj) {
        return this.each(function(i, el) {
            $(obj).each(function(i, objEl) {
                objEl.insertBefore(el, objEl.firstChild);
            });
        });
    },
    remove: function() {
        return this.each(function() {
            this.parentNode && this.parentNode.removeChild(this);
        });
    },
    detach: function() {
        return this.remove();
    },
    html: function(content) {
        return typeof content !== 'undefined' ? this.each(function() {
            if (typeof content === 'string' && $.trim(content).indexOf('<') !== 0) {
                this.innerHTML = content;
            } else {
                $(this).empty().append(content);
            }
        }) : this.get(0).innerHTML;
    },
    text: function(content) {
        return content ? this.each(function() {
            this.textContent = content;
        }) : this.get(0).textContent;
    },
    empty: function() {
        return this.each(function() {
            this.innerHTML = '';
        });
    },
    replaceWith: function(obj) {
        return this.each(function() {
            this.parentNode.replaceChild($(obj).get(0), this);
        });
    },
    css: function(rule, value) {
        return typeof value !== 'undefined' ? this.each(function() {
            this.style[rule] = value;
        }) : getComputedStyle(this.get(0))[rule];
    },
    hide: function() {
        this.each(function() {
            this.style.display = 'none';
        });
    },
    show: function() {
        this.each(function() {
            this.style.display = 'block';
        });
    }
});
/*--------------------------------------------------------------
Traversing module
requires browser features:
--------------------------------------------------------------*/
$.fn.extend({
    find: function(selector) {
        var nodes = [];
        this.each(function() {
            nodes = Array.prototype.concat(nodes, $.queryNodes(selector, this));
        });
        return new $(nodes);
    },
    parent: function() {
        return $($.map(this.nodes, function(el) {
            return el.parentNode;
        }));
    },
    children: function(selector) {
        var nodes = [];
        this.each(function() {
            nodes = Array.prototype.concat(nodes, $.slice(this.children));
        });
        return selector ? new $(nodes).filter(selector) : new $(nodes);
    },
    closest: function(selector) {
        return $($.map(this.nodes, function(el) {
            var foundNode;
            while (el.nodeType === 1) {
                if ($.matches(el, selector)) {
                    foundNode = el;
                    break;
                } else {
                    el = el.parentNode;
                }
            }
            return foundNode;
        }));
    },
    filter: function(selector) {
        return $($.map(this.nodes, function(el) {
            return $.matches(el, selector) ? el : null;
        }));
    },
    index: function(node) {
        var index = node ? -1 : 0;
        var el = this.get(0);
        if (node) {
            node instanceof $ && (node = node.get(0));
            this.each(function(i, el) {
                el === node && (index = i);
            });
        } else {
            while ((el = el.previousElementSibling)) {
                index++;
            }
        }
        return index;
    },
    first: function() {
        return this.eq(0);
    },
    last: function() {
        return this.eq(this.length - 1);
    }
});
/*--------------------------------------------------------------
Events module
requires browser features: 'addEventListener' in el, 'removeEventListener' in el
--------------------------------------------------------------*/
$.fn.extend({
    ready: function (handler) {
        document.addEventListener("DOMContentLoaded", function() {
            handler();
        });
    },
    on: function(eventType, selector, handler) {
        var eventHandler = handler || selector,
            $collection = handler ? this.find(selector) : this;
        $collection.each(function(i, el) {
            el.addEventListener(eventType.split('.')[0], eventHandler, false);
        });
        return this;
    },
    off: function(eventType, selector, handler) {
        var eventHandler = handler || selector,
            $collection = handler ? this.find(selector) : this;
        $collection.each(function(i, el) {
            el.removeEventListener(eventType.split('.')[0], eventHandler, false);
        });
        return this;
    },
    click: function (handler) {
        this.each(function(i, el) {
            el.addEventListener('click', handler, false);
        })
    }
});