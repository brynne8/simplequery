var document = null;
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
    setDocumemt: function(doc) {
        document = doc;
    },
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
Manipulation module
--------------------------------------------------------------*/
function getFragment(obj) {
    var fragment = document.createDocumentFragment();
    fragment.append(...$(obj).nodes);
    return fragment;
}
$.fn.extend({
    append: function(content) {
        if (typeof content === 'string') {
            return this.each(function(i, el) {
                el.insertAdjacentHTML('beforeend', content);
            });
        } else {
            var fragment = getFragment($(content));
            return this.each(function(i, el) {
                el.appendChild(fragment.cloneNode(true));
            });
        }
    },
    prepend: function(content) {
        if (typeof content === 'string') {
            return this.each(function(i, el) {
                el.insertAdjacentHTML('afterbegin', content);
            });
        } else {
            var fragment = getFragment($(content));
            return this.each(function(i, el) {
                if (el.firstChild) {
                    el.insertBefore(fragment.cloneNode(true), el.firstChild);
                } else {
                    el.appendChild(fragment.cloneNode(true));
                }
            });
        }
    },
    after: function(content) {
        if (typeof content === 'string') {
            return this.each(function(i, el) {
                el.insertAdjacentHTML('afterend', content);
            });
        } else {
            var fragment = getFragment($(content));
            return this.each(function(i, el) {
                el.after(fragment.cloneNode(true));
            });
        }
    },
    before: function(content) {
        if (typeof content === 'string') {
            return this.each(function(i, el) {
                el.insertAdjacentHTML('beforebegin', content);
            });
        } else {
            var fragment = getFragment($(content));
            return this.each(function(i, el) {
                el.before(fragment.cloneNode(true));
            });
        }
    },
    appendTo: function(target) {
        var fragment = getFragment(this);
        $(target).each(function(i, el) {
            el.appendChild(fragment.cloneNode(true));
        });
        return this;
    },
    prependTo: function(target) {
        var fragment = getFragment(this);
        $(target).each(function(i, el) {
            if (el.firstChild) {
                el.insertBefore(fragment.cloneNode(true), el.firstChild);
            } else {
                el.appendChild(fragment.cloneNode(true));
            }
        });
        return this;
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
        if (typeof selector === 'function') {
            this.nodes = this.nodes.filter(selector);
            return this;
        }
        return selector$($.map(this.nodes, function(el) {
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
    },
    next: function(selector) {
        return this.map(function () {
            return this.nextElementSibling;
        }).filter(selector);
    },
    prev: function(selector) {
        return this.map(function () {
            return this.previousElementSibling;
        }).filter(selector);
    }
});
/*--------------------------------------------------------------
Utils module
requires browser features:
--------------------------------------------------------------*/
$.extend($, {
    isEmptyObject: function(obj) {
        var name;
        for (name in obj) { return false; }
        return true;
    },
    isNumeric: function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    },
    contains: function(container, el) {
        var contains = false,
            parent = el.parentNode;
        while (parent && parent.nodeType === 1) {
            if (parent === container) {
                contains = true;
                break;
            }
            parent = parent.parentNode;
        }
        return contains;
    },
    param: function(obj) {
        var serialized = $.isArray(obj);
        return $.map(obj, function(item, key) {
            return encodeURIComponent(serialized ? item.name : key) + '=' + encodeURIComponent(serialized ? item.value : item);
        }).join('&');
    },
    parseJSON: function(data) {
        return JSON.parse(data);
    }
});
$.fn.extend({
    serializeArray: function() {
        return $.map(this[this.is('form') ? 'find' : 'filter']('input, textarea, select').nodes, function(el) {
            if (el.disabled) {
                return null;
            } if (el.type === 'radio' || el.type === 'checkbox') {
                return el.checked ? {name: el.name, value: el.value} : null;
            } else if (el.type === 'select-multiple') {
                return {name: el.name, value: $.map(el.options, function(option) {
                    return option.selected ? option.value : undefined;
                })};
            } else {
                return {name: el.name, value: el.value};
            }
        });
    },
    serialize: function() {
        return $.param(this.serializeArray());
    }
});
/*--------------------------------------------------------------
Classes module
requires browser features: 'classList' in el
--------------------------------------------------------------*/
function classHandlerProxy(className, callback) {
    var classNames = $.trim(className).split(' ');
    return this.each(function(i, el) {
        $.each(classNames, function(i, singleClass) {
            callback(el, singleClass);
        });
    });
}
$.fn.extend({
    addClass: function(className) {
        return classHandlerProxy.call(this, className, function(el, singleClass) {
            el.classList.add(singleClass);
        });
    },
    removeClass: function(className) {
        return classHandlerProxy.call(this, className, function(el, singleClass) {
            el.classList.remove(singleClass);
        });
    },
    hasClass: function(className) {
        return this.nodes[0].classList.contains(className);
    },
    toggleClass: function(className, condition) {
        return classHandlerProxy.call(this, className, function(el, singleClass) {
            if (typeof condition !== 'undefined') {
                el.classList[condition ? 'add' : 'remove'](singleClass);
            } else {
                el.classList.toggle(singleClass);
            }
        });
    }
});
/*--------------------------------------------------------------
Attributes module
--------------------------------------------------------------*/
$.fn.extend({
    attr: function(name, value) {
        return typeof value !== 'undefined' ? this.each(function() {
            this.setAttribute(name, value);
        }) : this.get(0).getAttribute(name);
    },
    removeAttr: function(name) {
        return this.each(function() {
            this.removeAttribute(name);
        });
    },
    val: function(value) {
        if (typeof value === 'undefined') {
            return this.get(0).value;
        }
        this.get(0).value = value;
        return this;
    }
});

export { $ }
