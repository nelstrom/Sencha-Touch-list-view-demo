/*
    Copyright(c) 2010 Sencha Inc.
    licensing@sencha.com
    http://www.sencha.com/touchlicense
*/

if (typeof Ext === "undefined") {
    Ext = {};
}


Ext.apply = function(object, config, defaults) {
    
    if (defaults) {
        Ext.apply(object, defaults);
    }
    if (object && config && typeof config == 'object') {
        for (var key in config) {
            object[key] = config[key];
        }
    }
    return object;
};

Ext.apply(Ext, {
    platformVersion: '0.2',
    platformVersionDetail: {
        major: 0,
        minor: 2,
        patch: 0
    },
    userAgent: navigator.userAgent.toLowerCase(),
    cache: {},
    idSeed: 1000,
    BLANK_IMAGE_URL : 'data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
    isStrict: document.compatMode == "CSS1Compat",

    windowId: 'ext-window',
    documentId: 'ext-document',

    
    emptyFn : function() {},

    
    isSecure : /^https/i.test(window.location.protocol),

    
    isReady : false,

    
    enableGarbageCollector : true,

    
    enableListenerCollection : true,

    
    applyIf : function(object, config) {
        var property, undefined;

        if (object) {
            for (property in config) {
                if (object[property] === undefined) {
                    object[property] = config[property];
                }
            }
        }

        return object;
    },

    
    repaint : function() {
        var mask = Ext.getBody().createChild({
            cls: 'x-mask x-mask-transparent'
        });
        setTimeout(function() {
            mask.remove();
        }, 0);
    },

    
    id : function(el, prefix) {
        el = Ext.getDom(el) || {};
        if (el === document) {
            el.id = this.documentId;
        }
        else if (el === window) {
            el.id = this.windowId;
        }
        el.id = el.id || ((prefix || 'ext-gen') + (++Ext.idSeed));
        return el.id;
    },

    
    extend : function() {
        
        var inlineOverrides = function(o){
            for (var m in o) {
                if (!o.hasOwnProperty(m)) {
                    continue;
                }
                this[m] = o[m];
            }
        };

        var objectConstructor = Object.prototype.constructor;

        return function(subclass, superclass, overrides){
            
            if (Ext.isObject(superclass)) {
                overrides = superclass;
                superclass = subclass;
                subclass = overrides.constructor != objectConstructor
                    ? overrides.constructor
                    : function(){ superclass.apply(this, arguments); };
            }

            if (!superclass) {
                throw "Attempting to extend from a class which has not been loaded on the page.";
            }

            
            var F = function(){},
                subclassProto,
                superclassProto = superclass.prototype;

            F.prototype = superclassProto;
            subclassProto = subclass.prototype = new F();
            subclassProto.constructor = subclass;
            subclass.superclass = superclassProto;

            if(superclassProto.constructor == objectConstructor){
                superclassProto.constructor = superclass;
            }

            subclass.override = function(overrides){
                Ext.override(subclass, overrides);
            };

            subclassProto.superclass = subclassProto.supr = (function(){
                return superclassProto;
            });

            subclassProto.override = inlineOverrides;
            subclassProto.proto = subclassProto;

            subclass.override(overrides);
            subclass.extend = function(o) {
                return Ext.extend(subclass, o);
            };

            return subclass;
        };
    }(),

    
    override : function(origclass, overrides) {
        Ext.apply(origclass.prototype, overrides);
    },

    
    namespace : function() {
        var ln = arguments.length,
            i, value, split, x, xln, parts, object;

        for (i = 0; i < ln; i++) {
            value = arguments[i];
            parts = value.split(".");
            if (window.Ext) {
                object = window[parts[0]] = Object(window[parts[0]]);
            } else {
                object = arguments.callee.caller.arguments[0];
            }
            for (x = 1, xln = parts.length; x < xln; x++) {
                object = object[parts[x]] = Object(object[parts[x]]);
            }
        }
        return object;
    },

    
    urlEncode : function(o, pre) {
        var empty,
            buf = [],
            e = encodeURIComponent;

        Ext.iterate(o, function(key, item){
            empty = Ext.isEmpty(item);
            Ext.each(empty ? key : item, function(val){
                buf.push('&', e(key), '=', (!Ext.isEmpty(val) && (val != key || !empty)) ? (Ext.isDate(val) ? Ext.encode(val).replace(/"/g, '') : e(val)) : '');
            });
        });

        if(!pre){
            buf.shift();
            pre = '';
        }

        return pre + buf.join('');
    },

    
    urlDecode : function(string, overwrite) {
        if (Ext.isEmpty(string)) {
            return {};
        }

        var obj = {},
            pairs = string.split('&'),
            d = decodeURIComponent,
            name,
            value;

        Ext.each(pairs, function(pair) {
            pair = pair.split('=');
            name = d(pair[0]);
            value = d(pair[1]);
            obj[name] = overwrite || !obj[name] ? value : [].concat(obj[name]).concat(value);
        });

        return obj;
    },

    
    htmlEncode : function(value) {
        return Ext.util.Format.htmlEncode(value);
    },

    
    htmlDecode : function(value) {
         return Ext.util.Format.htmlDecode(value);
    },

    
    urlAppend : function(url, s) {
        if (!Ext.isEmpty(s)) {
            return url + (url.indexOf('?') === -1 ? '?' : '&') + s;
        }
        return url;
    },

    
     toArray : function(array, start, end) {
        return Array.prototype.slice.call(array, start || 0, end || array.length);
     },

     
     each : function(array, fn, scope) {
         if (Ext.isEmpty(array, true)) {
             return 0;
         }
         if (!Ext.isIterable(array) || Ext.isPrimitive(array)) {
             array = [array];
         }
         for (var i = 0, len = array.length; i < len; i++) {
             if (fn.call(scope || array[i], array[i], i, array) === false) {
                 return i;
             }
         }
         return true;
     },

     
     iterate : function(obj, fn, scope) {
         if (Ext.isEmpty(obj)) {
             return;
         }
         if (Ext.isIterable(obj)) {
             Ext.each(obj, fn, scope);
             return;
         }
         else if (Ext.isObject(obj)) {
             for (var prop in obj) {
                 if (obj.hasOwnProperty(prop)) {
                     if (fn.call(scope || obj, prop, obj[prop], obj) === false) {
                         return;
                     }
                 }
             }
         }
     },

    
    pluck : function(arr, prop) {
        var ret = [];
        Ext.each(arr, function(v) {
            ret.push(v[prop]);
        });
        return ret;
    },

    
    getBody : function() {
        return Ext.get(document.body || false);
    },

    
    getHead : function() {
        var head;

        return function() {
            if (head == undefined) {
                head = Ext.get(DOC.getElementsByTagName("head")[0]);
            }

            return head;
        };
    }(),

    
    getDoc : function() {
        return Ext.get(document);
    },

    
    getCmp : function(id) {
        return Ext.ComponentMgr.get(id);
    },

    
    getOrientation: function() {
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    },

    isIterable : function(v) {
        if (!v) {
            return false;
        }
        
        if (Ext.isArray(v) || v.callee) {
            return true;
        }
        
        if (/NodeList|HTMLCollection/.test(Object.prototype.toString.call(v))) {
            return true;
        }

        
        
        return ((typeof v.nextNode != 'undefined' || v.item) && Ext.isNumber(v.length)) || false;
    },

    
    num : function(v, defaultValue) {
        v = Number(Ext.isEmpty(v) || Ext.isArray(v) || typeof v == 'boolean' || (typeof v == 'string' && Ext.util.Format.trim(v).length == 0) ? NaN : v);
        return isNaN(v) ? defaultValue : v;
    },

    
    isEmpty : function(value, allowBlank) {
        var isNull       = value == null,
            emptyArray   = (Ext.isArray(value) && !value.length),
            blankAllowed = !allowBlank ? value === '' : false;

        return isNull || emptyArray || blankAllowed;
    },

    
    isArray : function(v) {
        return Object.prototype.toString.apply(v) === '[object Array]';
    },

    
    isDate : function(v) {
        return Object.prototype.toString.apply(v) === '[object Date]';
    },

    
    isObject : function(v) {
        return !!v && Object.prototype.toString.call(v) === '[object Object]';
    },

    
    isPrimitive : function(v) {
        return Ext.isString(v) || Ext.isNumber(v) || Ext.isBoolean(v);
    },

    
    isFunction : function(v) {
        return Object.prototype.toString.apply(v) === '[object Function]';
    },

    
    isNumber : function(v) {
        return Object.prototype.toString.apply(v) === '[object Number]' && isFinite(v);
    },

    
    isString : function(v) {
        return typeof v === 'string';
        
        
    },

    
    isBoolean : function(v) {
        return Object.prototype.toString.apply(v) === '[object Boolean]';
    },

    
    isElement : function(v) {
        return v ? !!v.tagName : false;
    },

    
    isDefined : function(v){
        return typeof v !== 'undefined';
    },

    
    destroy : function() {
        var ln = arguments.length,
            i, arg;

        for (i = 0; i < ln; i++) {
            arg = arguments[i];
            if (arg) {
                if (Ext.isArray(arg)) {
                    this.destroy.apply(this, arg);
                }
                else if (Ext.isFunction(arg.destroy)) {
                    arg.destroy();
                }
                else if (arg.dom) {
                    arg.remove();
                }
            }
        }
    }
});


Ext.SSL_SECURE_URL = Ext.isSecure && 'about:blank';

Ext.ns = Ext.namespace;

Ext.ns(
    'Ext.util',
    'Ext.data',
    'Ext.list',
    'Ext.form',
    'Ext.menu',
    'Ext.state',
    'Ext.layout',
    'Ext.app',
    'Ext.ux',
    'Ext.plugins',
    'Ext.direct',
    'Ext.lib',
    'Ext.gesture'
);



Ext.util.Observable = Ext.extend(Object, {
    
    
    isObservable: true,

    constructor: function(config) {
        var me = this;

        Ext.apply(me, config);
        if (me.listeners) {
            me.on(me.listeners);
            delete me.listeners;
        }
        me.events = me.events || {};
        
        if (this.bubbleEvents) {
            this.enableBubble(this.bubbleEvents);
        }
    },

    
    eventOptionsRe : /^(?:scope|delay|buffer|single|stopEvent|preventDefault|stopPropagation|normalized|args|delegate|element|vertical|horizontal)$/,

    
    addManagedListener : function(item, ename, fn, scope, options) {
        var managedListeners = this.managedListeners = this.managedListeners || [],
            me = this,
            config;
        
        if (Ext.isObject(ename)) {
            options = ename;
            for (ename in options) {
                if (!options.hasOwnProperty(ename)) {
                    continue;
                }
                config = options[ename];
                if (!me.eventOptionsRe.test(ename)) {
                    me.addManagedListener(item, ename, config.fn || config, config.scope || options.scope, config.fn ? config : options);
                }
            }
        }
        else {
            managedListeners.push({
                item: item,
                ename: ename,
                fn: fn,
                scope: scope,
                options: options
            });
    
            item.on(ename, fn, scope, options);
        }
    },
    
    
     removeManagedListener : function(item, ename, fn, scope) {
        var me = this,
            o,
            config,
            managedListeners,
            managedListener,
            length,
            i;
            
        if (Ext.isObject(ename)) {
            o = ename;
            for (ename in o) {
                if (!o.hasOwnProperty(ename)) {
                    continue;
                }
                config = o[ename];
                if (!me.eventOptionsRe.test(ename)) {
                    me.removeManagedListener(item, ename, config.fn || config, config.scope || o.scope);
                }
            }
        }

        managedListeners = this.managedListeners ? this.managedListeners.slice() : [];
        length = managedListeners.length;
            
        for (i = 0; i < length; i++) {
            managedListener = managedListeners[i];
            if (managedListener.item === item && managedListener.ename === ename && (!fn || managedListener.fn === fn) && (!scope || managedListener.scope === scope)) {
                this.managedListeners.remove(managedListener);
                item.un(managedListener.ename, managedListener.fn, managedListener.scope);
            }
        }
    },
    
    
    fireEvent: function() {
        var me = this,
            a = Ext.toArray(arguments),
            ename = a[0].toLowerCase(),
            ret = true,
            ev = me.events[ename],
            queue = me.eventQueue,
            parent;

        if (me.eventsSuspended === true) {
            if (queue) {
                queue.push(a);
            }
            return false;
        }
        else if (ev && Ext.isObject(ev) && ev.bubble) {
            if (ev.fire.apply(ev, a.slice(1)) === false) {
                return false;
            }
            parent = me.getBubbleTarget && me.getBubbleTarget();
            if (parent && parent.isObservable) {
                if (!parent.events[ename] || !Ext.isObject(parent.events[ename]) || !parent.events[ename].bubble) {
                    parent.enableBubble(ename);
                }
                return parent.fireEvent.apply(parent, a);
            }
        }
        else if (ev && Ext.isObject(ev)) {
            a.shift();
            ret = ev.fire.apply(ev, a);
        }
        return ret;
    },

    
    addListener: function(ename, fn, scope, o) {
        var me = this,
            config,
            ev;

        if (Ext.isObject(ename)) {
            o = ename;
            for (ename in o) {
                if (!o.hasOwnProperty(ename)) {
                    continue;
                }
                config = o[ename];
                if (!me.eventOptionsRe.test(ename)) {
                    me.addListener(ename, config.fn || config, config.scope || o.scope, config.fn ? config : o);
                }
            }
        }
        else {
            ename = ename.toLowerCase();
            me.events[ename] = me.events[ename] || true;
            ev = me.events[ename] || true;
            if (Ext.isBoolean(ev)) {
                me.events[ename] = ev = new Ext.util.Event(me, ename);
            }
            ev.addListener(fn, scope, Ext.isObject(o) ? o: {});
        }
    },

    
    removeListener: function(ename, fn, scope) {
        var me = this,
            config,
            ev;

        if (Ext.isObject(ename)) {
            var o = ename;
            for (ename in o) {
                if (!o.hasOwnProperty(ename)) {
                    continue;
                }
                config = o[ename];
                if (!me.eventOptionsRe.test(ename)) {
                    me.removeListener(ename, config.fn || config, config.scope || o.scope);
                }
            }
        }
        else {
            ename = ename.toLowerCase();
            ev = me.events[ename];
            if (ev.isEvent) {
                ev.removeListener(fn, scope);
            }
        }
    },

    
    purgeListeners: function() {
        var events = this.events,
            ev,
            key;

        for (key in events) {
            if (!events.hasOwnProperty(key)) {
                continue;
            }
            ev = events[key];
            if (ev.isEvent) {
                ev.clearListeners();
            }
        }
        
        this.purgeManagedListeners();
    },

    
    purgeManagedListeners : function() {
        var managedListeners = this.managedListeners || [],
            ln = managedListeners.length,
            i, managedListener;

        for (i = 0; i < ln; i++) {
            managedListener = managedListeners[i];
            managedListener.item.un(managedListener.ename, managedListener.fn, managedListener.scope);
        }

        this.managedListener = [];
    },
    
    
    addEvents: function(o) {
        var me = this;
            me.events = me.events || {};
        if (Ext.isString(o)) {
            var a = arguments,
            i = a.length;
            while (i--) {
                me.events[a[i]] = me.events[a[i]] || true;
            }
        } else {
            Ext.applyIf(me.events, o);
        }
    },

    
    hasListener: function(ename) {
        var e = this.events[ename];
        return e.isEvent === true && e.listeners.length > 0;
    },

    
    suspendEvents: function(queueSuspended) {
        this.eventsSuspended = true;
        if (queueSuspended && !this.eventQueue) {
            this.eventQueue = [];
        }
    },

    
    resumeEvents: function() {
        var me = this,
            queued = me.eventQueue || [];

        me.eventsSuspended = false;
        delete me.eventQueue;

        Ext.each(queued,
        function(e) {
            me.fireEvent.apply(me, e);
        });
    },

    
    relayEvents : function(origin, events, prefix) {
        prefix = prefix || '';
        var me = this,
            len = events.length,
            i, ename;
            
        function createHandler(ename){
            return function(){
                return me.fireEvent.apply(me, [prefix + ename].concat(Array.prototype.slice.call(arguments, 0, -1)));
            };
        }
        
        for(i = 0, len = events.length; i < len; i++){
            ename = events[i].substr(prefix.length);
            me.events[ename] = me.events[ename] || true;
            origin.on(ename, createHandler(ename), me);
        }
    },
    
    
    enableBubble: function(events) {
        var me = this;
        if (!Ext.isEmpty(events)) {
            events = Ext.isArray(events) ? events: Ext.toArray(arguments);
            Ext.each(events,
            function(ename) {
                ename = ename.toLowerCase();
                var ce = me.events[ename] || true;
                if (Ext.isBoolean(ce)) {
                    ce = new Ext.util.Event(me, ename);
                    me.events[ename] = ce;
                }
                ce.bubble = true;
            });
        }
    }
});

Ext.override(Ext.util.Observable, {
    
    on: Ext.util.Observable.prototype.addListener,
    
    un: Ext.util.Observable.prototype.removeListener,
    
    mon: Ext.util.Observable.prototype.addManagedListener,
    mun: Ext.util.Observable.prototype.removeManagedListener
});


Ext.util.Observable.releaseCapture = function(o) {
    o.fireEvent = Ext.util.Observable.prototype.fireEvent;
};


Ext.util.Observable.capture = function(o, fn, scope) {
    o.fireEvent = Ext.createInterceptor(o.fireEvent, fn, scope);
};


Ext.util.Observable.observe = function(cls, listeners) {
    if (cls) {
        if (!cls.isObservable) {
            Ext.applyIf(cls, new Ext.util.Observable());
            Ext.util.Observable.capture(cls.prototype, cls.fireEvent, cls);
        }
        if (typeof listeners == 'object') {
            cls.on(listeners);
        }
        return cls;
    }
};


Ext.util.Observable.observeClass = Ext.util.Observable.observe;

Ext.util.Event = Ext.extend(Object, (function() {
    function createBuffered(handler, listener, o, scope) {
        listener.task = new Ext.util.DelayedTask();
        return function() {
            listener.task.delay(o.buffer, handler, scope, Ext.toArray(arguments));
        };
    };

    function createDelayed(handler, listener, o, scope) {
        return function() {
            var task = new Ext.util.DelayedTask();
            if (!listener.tasks) {
                listener.tasks = [];
            }
            listener.tasks.push(task);
            task.delay(o.delay || 10, handler, scope, Ext.toArray(arguments));
        };
    };

    function createSingle(handler, listener, o, scope) {
        return function() {
            listener.ev.removeListener(listener.fn, scope);
            return handler.apply(scope, arguments);
        };
    };

    return {
        isEvent: true,

        constructor: function(observable, name) {
            this.name = name;
            this.observable = observable;
            this.listeners = [];
        },

        addListener: function(fn, scope, options) {
            var me = this,
                listener;
                scope = scope || me.observable;

            if (!me.isListening(fn, scope)) {
                listener = me.createListener(fn, scope, options);
                if (me.firing) {
                    
                    me.listeners = me.listeners.slice(0);
                }
                me.listeners.push(listener);
            }
        },

        createListener: function(fn, scope, o) {
            o = o || {};
            scope = scope || this.observable;

            var listener = {
                    fn: fn,
                    scope: scope,
                    o: o,
                    ev: this
                },
                handler = fn;

            if (o.delay) {
                handler = createDelayed(handler, listener, o, scope);
            }
            if (o.buffer) {
                handler = createBuffered(handler, listener, o, scope);
            }
            if (o.single) {
                handler = createSingle(handler, listener, o, scope);
            }

            listener.fireFn = handler;
            return listener;
        },

        findListener: function(fn, scope) {
            var listeners = this.listeners,
            i = listeners.length,
            listener,
            s;

            while (i--) {
                listener = listeners[i];
                if (listener) {
                    s = listener.scope;
                    if (listener.fn == fn && (s == scope || s == this.observable)) {
                        return i;
                    }
                }
            }

            return - 1;
        },

        isListening: function(fn, scope) {
            return this.findListener(fn, scope) !== -1;
        },

        removeListener: function(fn, scope) {
            var me = this,
                index,
                listener,
                k;

            if ((index = me.findListener(fn, scope)) != -1) {
                listener = me.listeners[index];

                if (me.firing) {
                    me.listeners = me.listeners.slice(0);
                }

                
                if (listener.task) {
                    listener.task.cancel();
                    delete listener.task;
                }

                
                k = listener.tasks && listener.tasks.length;
                if (k) {
                    while (k--) {
                        listener.tasks[k].cancel();
                    }
                    delete listener.tasks;
                }

                
                me.listeners.splice(index, 1);
                return true;
            }

            return false;
        },

        
        clearListeners: function() {
            var listeners = this.listeners,
                i = listeners.length;

            while (i--) {
                this.removeListener(listeners[i].fn, listeners[i].scope);
            }
        },

        fire: function() {
            var me = this,
                listeners = me.listeners,
                count = listeners.length,
                i,
                args,
                listener;

            if (count > 0) {
                me.firing = true;
                for (i = 0; i < count; i++) {
                    listener = listeners[i];
                    args = arguments.length ? Array.prototype.slice.call(arguments, 0) : [];
                    if (listener.o) {
                        args.push(listener.o);
                    }
                    if (listener && listener.fireFn.apply(listener.scope || me.observable, args) === false) {
                        return (me.firing = false);
                    }
                }
            }
            me.firing = false;
            return true;
        }
    };
})());


Ext.util.Stateful = Ext.extend(Ext.util.Observable, {
    
    
    editing : false,
    
    
    dirty : false,
    
    
    persistanceProperty: 'data',
    
    constructor: function(config) {
        Ext.applyIf(this, {
            data: {}
        });        
        
        
        this.modified = {};
        
        this[this.persistanceProperty] = {};
        
        Ext.util.Stateful.superclass.constructor.call(this, config);
    },
    
    
    get: function(field) {
        return this[this.persistanceProperty][field];
    },
    
    
    set: function(fieldName, value) {
        var fields = this.fields,
            field, key;
        
        if (arguments.length == 1 && Ext.isObject(fieldName)) {
            for (key in fieldName) {
                if (!fieldName.hasOwnProperty(key)) {
                    continue;
                }
                this.set(key, fieldName[key]);
            }
        } else {
            if (fields) {
                field = fields.get(fieldName);
                
                if (field && field.convert) {
                    value = field.convert(value, this);
                }
            }
            
            this[this.persistanceProperty][fieldName] = value;

            this.dirty = true;

            if (!this.editing) {
                this.afterEdit();
            }
        }
    },
    
    
    getChanges : function(){
        var modified = this.modified,
            changes  = {},
            field;
            
        for (field in modified) {
            if (modified.hasOwnProperty(field)){
                changes[field] = this[this.persistanceProperty][field];
            }
        }
        
        return changes;
    },
    
    
    isModified : function(fieldName) {
        return !!(this.modified && this.modified.hasOwnProperty(fieldName));
    },
    
    
    markDirty : function() {
        this.dirty = true;
        
        if (!this.modified) {
            this.modified = {};
        }
        
        this.fields.each(function(field) {
            this.modified[field.name] = this[this.persistanceProperty][field.name];
        }, this);
    },
    
    
    reject : function(silent) {
        var modified = this.modified,
            field;
            
        for (field in modified) {
            if (!modified.hasOwnProperty(field)) {
                continue;
            }
            if (typeof modified[field] != "function") {
                this[this.persistanceProperty][field] = modified[field];
            }
        }
        
        this.dirty = false;
        this.editing = false;
        delete this.modified;
        
        if (silent !== true) {
            this.afterReject();
        }
    },
    
    
    commit : function(silent) {
        this.dirty = false;
        this.editing = false;
        
        delete this.modified;
        
        if (silent !== true) {
            this.afterCommit();
        }
    },
    
    
    copy : function(newId) {
        return new this.constructor(Ext.apply({}, this[this.persistanceProperty]), newId || this.internalId);
    }
});

Ext.util.MixedCollection = function(allowFunctions, keyFn) {
    this.items = [];
    this.map = {};
    this.keys = [];
    this.length = 0;
    this.addEvents(
        
        'clear',
        
        'add',
        
        'replace',
        
        'remove',
        'sort'
    );
    this.allowFunctions = allowFunctions === true;
    if (keyFn) {
        this.getKey = keyFn;
    }
    Ext.util.MixedCollection.superclass.constructor.call(this);
};

Ext.extend(Ext.util.MixedCollection, Ext.util.Observable, {

    
    allowFunctions : false,

    
    add : function(key, o){
        if(arguments.length == 1){
            o = arguments[0];
            key = this.getKey(o);
        }
        if(typeof key != 'undefined' && key !== null){
            var old = this.map[key];
            if(typeof old != 'undefined'){
                return this.replace(key, o);
            }
            this.map[key] = o;
        }
        this.length++;
        this.items.push(o);
        this.keys.push(key);
        this.fireEvent('add', this.length-1, o, key);
        return o;
    },

    
    getKey : function(o){
         return o.id;
    },

    
    replace : function(key, o){
        if(arguments.length == 1){
            o = arguments[0];
            key = this.getKey(o);
        }
        var old = this.map[key];
        if(typeof key == 'undefined' || key === null || typeof old == 'undefined'){
             return this.add(key, o);
        }
        var index = this.indexOfKey(key);
        this.items[index] = o;
        this.map[key] = o;
        this.fireEvent('replace', key, old, o);
        return o;
    },

    
    addAll : function(objs){
        if(arguments.length > 1 || Ext.isArray(objs)){
            var args = arguments.length > 1 ? arguments : objs;
            for(var i = 0, len = args.length; i < len; i++){
                this.add(args[i]);
            }
        }else{
            for(var key in objs){
                if (!objs.hasOwnProperty(key)) {
                    continue;
                }
                if(this.allowFunctions || typeof objs[key] != 'function'){
                    this.add(key, objs[key]);
                }
            }
        }
    },

    
    each : function(fn, scope){
        var items = [].concat(this.items); 
        for(var i = 0, len = items.length; i < len; i++){
            if(fn.call(scope || items[i], items[i], i, len) === false){
                break;
            }
        }
    },

    
    eachKey : function(fn, scope){
        for(var i = 0, len = this.keys.length; i < len; i++){
            fn.call(scope || window, this.keys[i], this.items[i], i, len);
        }
    },

    
    find : function(fn, scope){
        for(var i = 0, len = this.items.length; i < len; i++){
            if(fn.call(scope || window, this.items[i], this.keys[i])){
                return this.items[i];
            }
        }
        return null;
    },

    
    insert : function(index, key, o){
        if(arguments.length == 2){
            o = arguments[1];
            key = this.getKey(o);
        }
        if(this.containsKey(key)){
            this.suspendEvents();
            this.removeKey(key);
            this.resumeEvents();
        }
        if(index >= this.length){
            return this.add(key, o);
        }
        this.length++;
        this.items.splice(index, 0, o);
        if(typeof key != 'undefined' && key !== null){
            this.map[key] = o;
        }
        this.keys.splice(index, 0, key);
        this.fireEvent('add', index, o, key);
        return o;
    },

    
    remove : function(o){
        return this.removeAt(this.indexOf(o));
    },

    
    removeAt : function(index){
        if(index < this.length && index >= 0){
            this.length--;
            var o = this.items[index];
            this.items.splice(index, 1);
            var key = this.keys[index];
            if(typeof key != 'undefined'){
                delete this.map[key];
            }
            this.keys.splice(index, 1);
            this.fireEvent('remove', o, key);
            return o;
        }
        return false;
    },

    
    removeKey : function(key){
        return this.removeAt(this.indexOfKey(key));
    },

    
    getCount : function(){
        return this.length;
    },

    
    indexOf : function(o){
        return this.items.indexOf(o);
    },

    
    indexOfKey : function(key){
        return this.keys.indexOf(key);
    },

    
    item : function(key){
        var mk = this.map[key],
            item = mk !== undefined ? mk : (typeof key == 'number') ? this.items[key] : undefined;
        return typeof item != 'function' || this.allowFunctions ? item : null; 
    },

    
    itemAt : function(index){
        return this.items[index];
    },

    
    key : function(key){
        return this.map[key];
    },

    
    contains : function(o){
        return this.indexOf(o) != -1;
    },

    
    containsKey : function(key){
        return typeof this.map[key] != 'undefined';
    },

    
    clear : function(){
        this.length = 0;
        this.items = [];
        this.keys = [];
        this.map = {};
        this.fireEvent('clear');
    },

    
    first : function() {
        return this.items[0];
    },

    
    last : function() {
        return this.items[this.length-1];
    },

    
    _sort : function(property, dir, fn){
        var i, len,
            dsc   = String(dir).toUpperCase() == 'DESC' ? -1 : 1,

            
            c     = [],
            keys  = this.keys,
            items = this.items;

        
        fn = fn || function(a, b) {
            return a - b;
        };

        
        for(i = 0, len = items.length; i < len; i++){
            c[c.length] = {
                key  : keys[i],
                value: items[i],
                index: i
            };
        }

        
        c.sort(function(a, b){
            var v = fn(a[property], b[property]) * dsc;
            if(v === 0){
                v = (a.index < b.index ? -1 : 1);
            }
            return v;
        });

        
        for(i = 0, len = c.length; i < len; i++){
            items[i] = c[i].value;
            keys[i]  = c[i].key;
        }

        this.fireEvent('sort', this);
    },

    
    sort : function(property, direction) {
        
        var sorters = property;
        
        
        if (Ext.isString(property)) {
            sorters = [new Ext.util.Sorter({
                property : property,
                direction: direction || "ASC"
            })];
        } else if (property instanceof Ext.util.Sorter) {
            sorters = [property];
        } else if (Ext.isObject(property)) {
            sorters = [new Ext.util.Sorter(property)];
        }
        
        var length = sorters.length;
        
        if (length == 0) {
            return;
        }
                
        
        var sorterFn = function(r1, r2) {
            var result = sorters[0].sort(r1, r2),
                length = sorters.length,
                i;
            
                
                for (i = 1; i < length; i++) {
                    result = result || sorters[i].sort.call(this, r1, r2);
                }                
           
            return result;
        };
        
        this.sortBy(sorterFn);
    },
    
    
    sortBy: function(sorterFn) {
        var items  = this.items,
            keys   = this.keys,
            length = items.length,
            temp   = [],
            i;
        
        
        for (i = 0; i < length; i++) {
            temp[i] = {
                key  : keys[i],
                value: items[i],
                index: i
            };
        }
        
        temp.sort(function(a, b) {
            var v = sorterFn(a.value, b.value);
            if (v === 0) {
                v = (a.index < b.index ? -1 : 1);
            }
            
            return v;
        });
        
        
        for (i = 0; i < length; i++) {
            items[i] = temp[i].value;
            keys[i]  = temp[i].key;
        }
        
        this.fireEvent('sort', this);
    },

    
    reorder: function(mapping) {
        this.suspendEvents();

        var items = this.items,
            index = 0,
            length = items.length,
            order = [],
            remaining = [],
            oldIndex;

        
        for (oldIndex in mapping) {
            order[mapping[oldIndex]] = items[oldIndex];
        }

        for (index = 0; index < length; index++) {
            if (mapping[index] == undefined) {
                remaining.push(items[index]);
            }
        }

        for (index = 0; index < length; index++) {
            if (order[index] == undefined) {
                order[index] = remaining.shift();
            }
        }

        this.clear();
        this.addAll(order);

        this.resumeEvents();
        this.fireEvent('sort', this);
    },

    
    keySort : function(dir, fn){
        this._sort('key', dir, fn || function(a, b){
            var v1 = String(a).toUpperCase(), v2 = String(b).toUpperCase();
            return v1 > v2 ? 1 : (v1 < v2 ? -1 : 0);
        });
    },

    
    getRange : function(start, end){
        var items = this.items;
        if(items.length < 1){
            return [];
        }
        start = start || 0;
        end = Math.min(typeof end == 'undefined' ? this.length-1 : end, this.length-1);
        var i, r = [];
        if(start <= end){
            for(i = start; i <= end; i++) {
                r[r.length] = items[i];
            }
        }else{
            for(i = start; i >= end; i--) {
                r[r.length] = items[i];
            }
        }
        return r;
    },

    
    filter : function(property, value, anyMatch, caseSensitive) {
        var filters = [];
        
        
        if (Ext.isString(property)) {
            filters.push(new Ext.util.Filter({
                property     : property,
                value        : value,
                anyMatch     : anyMatch,
                caseSensitive: caseSensitive
            }));
        } else if (Ext.isArray(property) || property instanceof Ext.util.Filter) {
            filters = filters.concat(property);
        }
        
        
        
        var filterFn = function(record) {
            var isMatch = true,
                length = filters.length,
                i;

            for (i = 0; i < length; i++) {
                var filter = filters[i],
                    fn     = filter.filter,
                    scope  = filter.scope;

                isMatch = isMatch && fn.call(scope, record);
            }

            return isMatch;
        };
        
        return this.filterBy(filterFn);
    },

    
    filterBy : function(fn, scope) {
        var newMC  = new Ext.util.MixedCollection(),
            keys   = this.keys, 
            items  = this.items,
            length = items.length,
            i;
            
        newMC.getKey = this.getKey;
        
        for (i = 0; i < length; i++) {
            if (fn.call(scope||this, items[i], keys[i])) {
                newMC.add(keys[i], items[i]);
            }
        }
        
        return newMC;
    },

    
    findIndex : function(property, value, start, anyMatch, caseSensitive){
        if(Ext.isEmpty(value, false)){
            return -1;
        }
        value = this.createValueMatcher(value, anyMatch, caseSensitive);
        return this.findIndexBy(function(o){
            return o && value.test(o[property]);
        }, null, start);
    },

    
    findIndexBy : function(fn, scope, start){
        var k = this.keys, it = this.items;
        for(var i = (start||0), len = it.length; i < len; i++){
            if(fn.call(scope||this, it[i], k[i])){
                return i;
            }
        }
        return -1;
    },

    
    createValueMatcher : function(value, anyMatch, caseSensitive, exactMatch) {
        if (!value.exec) { 
            var er = Ext.util.Format.escapeRegex;
            value = String(value);

            if (anyMatch === true) {
                value = er(value);
            } else {
                value = '^' + er(value);
                if (exactMatch === true) {
                    value += '$';
                }
            }
            value = new RegExp(value, caseSensitive ? '' : 'i');
         }
         return value;
    },

    
    clone : function(){
        var r = new Ext.util.MixedCollection();
        var k = this.keys, it = this.items;
        for(var i = 0, len = it.length; i < len; i++){
            r.add(k[i], it[i]);
        }
        r.getKey = this.getKey;
        return r;
    }
});

Ext.util.MixedCollection.prototype.get = Ext.util.MixedCollection.prototype.item;


Ext.AbstractManager = Ext.extend(Object, {
    typeName: 'type',

    constructor: function(config) {
        Ext.apply(this, config || {});

        
        this.all = new Ext.util.MixedCollection();

        this.types = {};
    },

    
    get : function(id) {
        return this.all.get(id);
    },

    
    register: function(item) {
        this.all.add(item);
    },

    
    unregister: function(item) {
        this.all.remove(item);
    },

    
    registerType : function(type, cls) {
        this.types[type] = cls;
        cls[this.typeName] = type;
    },

    
    isRegistered : function(type){
        return this.types[type] !== undefined;
    },

    
    create: function(config, defaultType) {
        var type        = config[this.typeName] || config.type || defaultType,
            Constructor = this.types[type];

        if (Constructor == undefined) {
            throw new Error(Ext.util.Format.format("The '{0}' type has not been registered with this manager", type));
        }

        return new Constructor(config);
    },

    
    onAvailable : function(id, fn, scope){
        var all = this.all;

        all.on("add", function(index, o){
            if (o.id == id) {
                fn.call(scope || o, o);
                all.un("add", fn, scope);
            }
        });
    }
});


Ext.util.DelayedTask = function(fn, scope, args) {
    var me = this,
        id,
        call = function() {
            clearInterval(id);
            id = null;
            fn.apply(scope, args || []);
        };

    
    this.delay = function(delay, newFn, newScope, newArgs) {
        me.cancel();
        fn = newFn || fn;
        scope = newScope || scope;
        args = newArgs || args;
        id = setInterval(call, delay);
    };

    
    this.cancel = function(){
        if (id) {
            clearInterval(id);
            id = null;
        }
    };
};

Ext.util.GeoLocation = Ext.extend(Ext.util.Observable, {
    
    hasGeoLocation: false,

    
    autoUpdate: true,

    
    
    latitude: null,
    
    longitude: null,
    
    accuracy: null,
    
    altitude: null,
    
    altitudeAccuracy: null,
    
    heading: null,
    
    speed: null,
    
    timestamp: null,

    
    
    enableHighAccuracy: false,
    
    timeout: Infinity,
    
    maximumAge: 0,
    
    setMaximumAge: function(maximumAge) {
        this.maximumAge = maximumAge;
        this.setAutoUpdate(this.autoUpdate);
    },
    
    setTimeout: function(timeout) {
        this.timeout = timeout;
        this.setAutoUpdate(this.autoUpdate);
    },
    
    setEnableHighAccuracy: function(enableHighAccuracy) {
        this.enableHighAccuracy = enableHighAccuracy;
        this.setAutoUpdate(this.autoUpdate);
    },

    
    factory : null,
    
    watchOperation : null,

    constructor : function(config) {
        Ext.apply(this, config);

        this.coords = this; //@deprecated


        if (typeof navigator != 'undefined' && typeof navigator.geolocation != 'undefined'){
            this.factory = navigator.geolocation;
        }
        else if(typeof google != 'undefined' && typeof google.gears != 'undefined'){
            try{
                this.factory = google.gears.factory.create('beta.geolocation');
            }
            catch(e){}            
        }
        
        this.hasGeoLocation = this.factory !== null;

        this.addEvents(
            
            'update',
            
            'locationerror',
            
            'locationupdate'
        );

        Ext.util.GeoLocation.superclass.constructor.call(this);

        if(this.autoUpdate){
            var me = this;
            setTimeout(function(){
                me.setAutoUpdate(me.autoUpdate);
            }, 0);
        }
    },

    
    setAutoUpdate : function(autoUpdate) {
        if (this.watchOperation !== null) {
            this.factory.clearWatch(this.watchOperation);
            this.watchOperation = null;
        }
        if(!autoUpdate) {
            return true;
        }
        if(!this.hasGeoLocation) {
            this.fireEvent('locationerror', this, false, false, true, null);
            return false;
        }
        try{
            this.watchOperation = this.factory.watchPosition(
                Ext.createDelegate(this.fireUpdate, this), 
                Ext.createDelegate(this.fireError, this), 
                this.parseOptions());
        }
        catch(e){
            this.autoUpdate = false;
            this.fireEvent('locationerror', this, false, false, true, e.message);
            return false;
        }
        return true;
    },

    
    updateLocation : function(callback, scope, positionOptions) {
        var me = this;

        var failFunction = function(message, error){
            if(error){
                me.fireError(error);
            }
            else{
                me.fireEvent('locationerror', me, false, false, true, message);
            }
            if(callback){
                callback.call(scope || me, null, me); 
            }
            me.fireEvent('update', false, me); 
        };

        if(!this.hasGeoLocation){
            setTimeout(function(){
                failFunction(null);
            }, 0);
            return;
        }

        try{
            this.factory.getCurrentPosition(
                
                function(position){
                    me.fireUpdate(position);
                    if(callback){
                        callback.call(scope || me, me, me); 
                    }
                    me.fireEvent('update', me, me); 
                },
                
                function(error){
                    failFunction(null, error);
                },
                positionOptions ? positionOptions : this.parseOptions());
        }
        catch(e){
            setTimeout(function(){
                failFunction(e.message);
            }, 0);
        }
    },

    
    fireUpdate: function(position){
        this.timestamp = position.timestamp;
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.accuracy = position.coords.accuracy;
        this.altitude = position.coords.altitude;
        this.altitudeAccuracy = position.coords.altitudeAccuracy;
        
        
        this.heading = typeof position.coords.heading == 'undefined' ? null : position.coords.heading;
        this.speed = typeof position.coords.speed == 'undefined' ? null : position.coords.speed;
        this.fireEvent('locationupdate', this);
    },
    fireError: function(error){
        this.fireEvent('locationerror', this,
            error.code == error.TIMEOUT, 
            error.code == error.PERMISSION_DENIED, 
            error.code == error.POSITION_UNAVAILABLE,
            error.message == undefined ? null : error.message);
    },
    parseOptions: function(){
        var ret = { 
            maximumAge: this.maximumAge, 
            enableHighAccuracy: this.enableHighAccuracy
        };
        
        if(this.timeout !== Infinity){
            ret.timeout = this.timeout;
        }
        return ret;
    },

    
    getLocation : function(callback, scope) {
        var me = this;
        if(this.latitude !== null){
            callback.call(scope || me, me, me);
        }
        else {
            me.updateLocation(callback, scope);
        }
    }
});

Ext.util.Region = Ext.extend(Object, {
    
    constructor : function(t, r, b, l) {
        var me = this;
        me.top = t;
        me[1] = t;
        me.right = r;
        me.bottom = b;
        me.left = l;
        me[0] = l;
    },

    
    contains : function(region) {
        var me = this;
        return (region.left >= me.left &&
                region.right <= me.right &&
                region.top >= me.top &&
                region.bottom <= me.bottom);

    },

    
    intersect : function(region) {
        var me = this,
            t = Math.max(me.top, region.top),
            r = Math.min(me.right, region.right),
            b = Math.min(me.bottom, region.bottom),
            l = Math.max(me.left, region.left);

        if (b > t && r > l) {
            return new Ext.util.Region(t, r, b, l);
        }
        else {
            return false;
        }
    },

    
    union : function(region) {
        var me = this,
            t = Math.min(me.top, region.top),
            r = Math.max(me.right, region.right),
            b = Math.max(me.bottom, region.bottom),
            l = Math.min(me.left, region.left);

        return new Ext.util.Region(t, r, b, l);
    },

    
    constrainTo : function(r) {
        var me = this,
            constrain = Ext.util.Numbers.constrain;
        me.top = constrain(me.top, r.top, r.bottom);
        me.bottom = constrain(me.bottom, r.top, r.bottom);
        me.left = constrain(me.left, r.left, r.right);
        me.right = constrain(me.right, r.left, r.right);
        return me;
    },

    
    adjust : function(t, r, b, l) {
        var me = this;
        me.top += t;
        me.left += l;
        me.right += r;
        me.bottom += b;
        return me;
    }
});


Ext.util.Region.getRegion = function(el) {
    return Ext.fly(el).getPageBox(true);
};

Ext.Template = function(html) {
    var me = this,
        a = arguments,
        buf = [];

    if (Ext.isArray(html)) {
        html = html.join("");
    }
    else if (a.length > 1) {
        Ext.each(a, function(v) {
            if (Ext.isObject(v)) {
                Ext.apply(me, v);
            } else {
                buf.push(v);
            }
        });
        html = buf.join('');
    }

    
    me.html = html;
    
    if (me.compiled) {
        me.compile();
    }
};

Ext.Template.prototype = {
    isTemplate: true,
    
    re: /\{([\w-]+)(?:\:([\w\.]*)(?:\((.*?)?\))?)?\}/g,
    argsRe: /^\s*['"](.*)["']\s*$/,
    compileARe: /\\/g,
    compileBRe: /(\r\n|\n)/g,
    compileCRe: /'/g,
    
    /**
     * @cfg {Boolean} disableFormats true to disable format functions in the template. If the template doesn't contain format functions, setting 
     * disableFormats to true will reduce apply time (defaults to false)
     */
    disableFormats: false,
    
    
    applyTemplate: function(values) {
        var me = this,
            useF = me.disableFormats !== true,
            fm = Ext.util.Format,
            tpl = me,
            re,
            i,
            len;

        if (me.compiled) {
            return me.compiled(values);
        }
        function fn(m, name, format, args) {
            if (format && useF) {
                if (format.substr(0, 5) == "this.") {
                    return tpl.call(format.substr(5), values[name], values);
                }
                else {
                    if (args) {
                        
                        
                        
                        re = me.argsRe;
                        args = args.split(',');
                        for (i = 0, len = args.length; i < len; i++) {
                            args[i] = args[i].replace(re, "$1");
                        }
                        args = [values[name]].concat(args);
                    }
                    else {
                        args = [values[name]];
                    }
                    return fm[format].apply(fm, args);
                }
            }
            else {
                return values[name] !== undefined ? values[name] : "";
            }
        }
        return me.html.replace(me.re, fn);
    },

    
    set: function(html, compile) {
        var me = this;
        me.html = html;
        me.compiled = null;
        return compile ? me.compile() : me;
    },

    
    compile: function() {
        var me = this,
            fm = Ext.util.Format,
            useF = me.disableFormats !== true,
            body;

        function fn(m, name, format, args) {
            if (format && useF) {
                args = args ? ',' + args: "";
                if (format.substr(0, 5) != "this.") {
                    format = "fm." + format + '(';
                }
                else {
                    format = 'this.call("' + format.substr(5) + '", ';
                    args = ", values";
                }
            }
            else {
                args = '';
                format = "(values['" + name + "'] == undefined ? '' : ";
            }
            return "'," + format + "values['" + name + "']" + args + ") ,'";
        }


        body = ["this.compiled = function(values){ return ['"];
        body.push(me.html.replace(me.compileARe, '\\\\').replace(me.compileBRe, '\\n').replace(me.compileCRe, "\\'").replace(me.re, fn));
        body.push("'].join('');};");
        body = body.join('');
        eval(body);
        return me;
    },

    
    insertFirst: function(el, values, returnElement) {
        return this.doInsert('afterBegin', el, values, returnElement);
    },

    
    insertBefore: function(el, values, returnElement) {
        return this.doInsert('beforeBegin', el, values, returnElement);
    },

    
    insertAfter: function(el, values, returnElement) {
        return this.doInsert('afterEnd', el, values, returnElement);
    },

    
    append: function(el, values, returnElement) {
        return this.doInsert('beforeEnd', el, values, returnElement);
    },

    doInsert: function(where, el, values, returnEl) {
        el = Ext.getDom(el);
        var newNode = Ext.DomHelper.insertHtml(where, el, this.applyTemplate(values));
        return returnEl ? Ext.get(newNode, true) : newNode;
    },

    
    overwrite: function(el, values, returnElement) {
        el = Ext.getDom(el);
        el.innerHTML = this.applyTemplate(values);
        return returnElement ? Ext.get(el.firstChild, true) : el.firstChild;
    },

    
    call: function(fnName, value, allValues) {
        return this[fnName](value, allValues);
    }
};

Ext.Template.prototype.apply = Ext.Template.prototype.applyTemplate;


Ext.Template.from = function(el, config) {
    el = Ext.getDom(el);
    return new Ext.Template(el.value || el.innerHTML, config || '');
};


Ext.XTemplate = function() {
    Ext.XTemplate.superclass.constructor.apply(this, arguments);

    var me = this,
        s = me.html,
        re = /<tpl\b[^>]*>((?:(?=([^<]+))\2|<(?!tpl\b[^>]*>))*?)<\/tpl>/,
        nameRe = /^<tpl\b[^>]*?for="(.*?)"/,
        ifRe = /^<tpl\b[^>]*?if="(.*?)"/,
        execRe = /^<tpl\b[^>]*?exec="(.*?)"/,
        id = 0,
        tpls = [],
        VALUES = 'values',
        PARENT = 'parent',
        XINDEX = 'xindex',
        XCOUNT = 'xcount',
        RETURN = 'return ',
        WITHVALUES = 'with(values){ ',
        m,
        m2,
        m3,
        m4,
        exp,
        fn,
        exec,
        name,
        i;

    s = ['<tpl>', s, '</tpl>'].join('');

    while ((m = s.match(re))) {
        m2 = m[0].match(nameRe);
        m3 = m[0].match(ifRe);
        m4 = m[0].match(execRe);
        exp = null;
        fn = null;
        exec = null;
        name = m2 && m2[1] ? m2[1] : '';

        if (m3) {
            exp = m3 && m3[1] ? m3[1] : null;
            if (exp) {
                fn = new Function(VALUES, PARENT, XINDEX, XCOUNT, WITHVALUES + 'try{' + RETURN + (Ext.util.Format.htmlDecode(exp)) + ';}catch(e){return;}}');
            }
        }
        if (m4) {
            exp = m4 && m4[1] ? m4[1] : null;
            if (exp) {
                exec = new Function(VALUES, PARENT, XINDEX, XCOUNT, WITHVALUES + (Ext.util.Format.htmlDecode(exp)) + '; }');
            }
        }
        if (name) {
            switch (name) {
            case '.':
                name = new Function(VALUES, PARENT, WITHVALUES + RETURN + VALUES + '; }');
                break;
            case '..':
                name = new Function(VALUES, PARENT, WITHVALUES + RETURN + PARENT + '; }');
                break;
            default:
                name = new Function(VALUES, PARENT, WITHVALUES + RETURN + name + '; }');
            }
        }
        tpls.push({
            id: id,
            target: name,
            exec: exec,
            test: fn,
            body: m[1] || ''
        });
        s = s.replace(m[0], '{xtpl' + id + '}');
        ++id;
    }
    for (i = tpls.length - 1; i >= 0; --i) {
        me.compileTpl(tpls[i]);
    }
    me.master = tpls[tpls.length - 1];
    me.tpls = tpls;
};
Ext.extend(Ext.XTemplate, Ext.Template, {
    re: /\{([\w-\.\#]+)(?:\:([\w\.]*)(?:\((.*?)?\))?)?(\s?[\+\-\*\/]\s?[\d\.\+\-\*\/\(\)]+)?\}/g,
    
    
    codeRe: /\{\[((?:\\\]|.|\n)*?)\]\}/g,

    
    applySubTemplate: function(id, values, parent, xindex, xcount) {
        var me = this,
            len,
            t = me.tpls[id],
            vs,
            buf = [],
            i;
        if ((t.test && !t.test.call(me, values, parent, xindex, xcount)) ||
        (t.exec && t.exec.call(me, values, parent, xindex, xcount))) {
            return '';
        }
        vs = t.target ? t.target.call(me, values, parent) : values;
        len = vs.length;
        parent = t.target ? values: parent;
        if (t.target && Ext.isArray(vs)) {
            for (i = 0, len = vs.length; i < len; i++) {
                buf[buf.length] = t.compiled.call(me, vs[i], parent, i + 1, len);
            }
            return buf.join('');
        }
        return t.compiled.call(me, vs, parent, xindex, xcount);
    },

    
    compileTpl: function(tpl) {
        var fm = Ext.util.Format,
            useF = this.disableFormats !== true,
            body;

        function fn(m, name, format, args, math) {
            var v;
            

            
            if (name.substr(0, 4) == 'xtpl') {
                return "',this.applySubTemplate(" + name.substr(4) + ", values, parent, xindex, xcount),'";
            }
            
            if (name == '.') {
                v = 'typeof values == "string" ? values : ""';
            }

            
            else if (name == '#') {
                v = 'xindex';
            }

            
            else if (name.indexOf('.') != -1) {
                v = "values."+name;
            }

            
            else {
                v = "values['" + name + "']";
            }
            if (math) {
                v = '(' + v + math + ')';
            }
            if (format && useF) {
                args = args ? ',' + args: "";
                if (format.substr(0, 5) != "this.") {
                    format = "fm." + format + '(';
                }
                else {
                    format = 'this.call("' + format.substr(5) + '", ';
                    args = ", values";
                }
            }
            else {
                args = '';
                format = "(" + v + " === undefined ? '' : ";
            }
            return "'," + format + v + args + "),'";
        }

        function codeFn(m, code) {
            
            return "',(" + code.replace(/\\'/g, "'") + "),'";
        }
        body = ["tpl.compiled = function(values, parent, xindex, xcount){return ['"];
        body.push(tpl.body.replace(/(\r\n|\n)/g, '\\n').replace(/'/g, "\\'").replace(this.re, fn).replace(this.codeRe, codeFn));
        body.push("'].join('');};");
        body = body.join('');
        eval(body);
        return this;
    },

    
    applyTemplate: function(values) {
        return this.master.compiled.call(this, values, {}, 1, 1);
    },

    
    compile: function() {
        return this;
    }
});

Ext.XTemplate.prototype.apply = Ext.XTemplate.prototype.applyTemplate;


Ext.XTemplate.from = function(el, config) {
    el = Ext.getDom(el);
    return new Ext.XTemplate(el.value || el.innerHTML, config || {});
};


Ext.util.Sorter = Ext.extend(Object, {
    
    
    
    
    
    
    
    direction: "ASC",
    
    constructor: function(config) {
        Ext.apply(this, config);
        
        if (this.property == undefined && this.sorterFn == undefined) {
            throw "A Sorter requires either a property or a sorter function";
        }
        
        this.sort = this.createSortFunction(this.sorterFn || this.defaultSorterFn);
    },
    
    
    createSortFunction: function(sorterFn) {
        var me        = this,
            property  = me.property,
            direction = me.direction,
            modifier  = direction.toUpperCase() == "DESC" ? -1 : 1;
        
        
        
        return function(o1, o2) {
            return modifier * sorterFn.call(me, o1, o2);
        };
    },
    
    
    defaultSorterFn: function(o1, o2) {
        var v1 = this.getRoot(o1)[this.property],
            v2 = this.getRoot(o2)[this.property];

        return v1 > v2 ? 1 : (v1 < v2 ? -1 : 0);
    },
    
    
    getRoot: function(item) {
        return this.root == undefined ? item : item[this.root];
    }
});

Ext.util.Filter = Ext.extend(Object, {
    
    
    
    
    
    anyMatch: false,
    
    
    exactMatch: false,
    
    
    caseSensitive: false,
    
    
    
    constructor: function(config) {
        Ext.apply(this, config);
        
        if (this.filter == undefined) {
            if (this.property == undefined || this.value == undefined) {
                throw "A filter requires either a property or a filter function to be set";
            } else {
                this.filter = this.createFilterFn();
            }
        }
    },
    
    
    createFilterFn: function() {
        var me       = this,
            matcher  = me.createValueMatcher(),
            property = me.property;
        
        return function(item) {
            return matcher.test(me.getRoot.call(me, item)[property]);
        };
    },
    
    
    getRoot: function(item) {
        return this.root == undefined ? item : item[this.root];
    },
    
    
    createValueMatcher : function() {
        var me            = this,
            value         = me.value,
            anyMatch      = me.anyMatch,
            exactMatch    = me.exactMatch,
            caseSensitive = me.caseSensitive,
            escapeRe      = Ext.util.Format.escapeRegex;
        
        if (!value.exec) { 
            value = String(value);

            if (anyMatch === true) {
                value = escapeRe(value);
            } else {
                value = '^' + escapeRe(value);
                if (exactMatch === true) {
                    value += '$';
                }
            }
            value = new RegExp(value, caseSensitive ? '' : 'i');
         }
         
         return value;
    }
});

Ext.util.Functions = {
    
    createInterceptor: function(origFn, newFn, scope) { 
        var method = origFn;
        if (!Ext.isFunction(newFn)) {
            return origFn;
        }
        else {
            return function() {
                var me = this,
                    args = arguments;
                newFn.target = me;
                newFn.method = origFn;
                return (newFn.apply(scope || me || window, args) !== false) ?
                        origFn.apply(me || window, args) :
                        null;
            };
        }
    },

    
    createDelegate: function(fn, obj, args, appendArgs) {
        if (!Ext.isFunction(fn)) {
            return fn;
        }
        return function() {
            var callArgs = args || arguments;
            if (appendArgs === true) {
                callArgs = Array.prototype.slice.call(arguments, 0);
                callArgs = callArgs.concat(args);
            }
            else if (Ext.isNumber(appendArgs)) {
                callArgs = Array.prototype.slice.call(arguments, 0);
                
                var applyArgs = [appendArgs, 0].concat(args);
                
                Array.prototype.splice.apply(callArgs, applyArgs);
                
            }
            return fn.apply(obj || window, callArgs);
        };
    },

    
    defer: function(fn, millis, obj, args, appendArgs) {
        fn = Ext.util.Functions.createDelegate(fn, obj, args, appendArgs);
        if (millis > 0) {
            return setTimeout(fn, millis);
        }
        fn();
        return 0;
    },


    
    createSequence: function(origFn, newFn, scope) {
        if (!Ext.isFunction(newFn)) {
            return origFn;
        }
        else {
            return function() {
                var retval = origFn.apply(this || window, arguments);
                newFn.apply(scope || this || window, arguments);
                return retval;
            };
        }
    }
};



Ext.defer = Ext.util.Functions.defer;



Ext.createInterceptor = Ext.util.Functions.createInterceptor;



Ext.createSequence = Ext.util.Functions.createSequence;


Ext.createDelegate = Ext.util.Functions.createDelegate;



Ext.util.Date = {
    
    getElapsed: function(dateA, dateB) {
        return Math.abs(dateA - (dateB || new Date));
    }
};


Ext.util.Numbers = {
    
    constrain : function(number, min, max) {
        number = parseFloat(number);
        if (!isNaN(min)) {
            number = Math.max(number, min);
        }
        if (!isNaN(max)) {
            number = Math.min(number, max);
        }
        return number;
    }
};

Ext.util.Format = {
    defaultDateFormat: 'm/d/Y',
    escapeRe: /('|\\)/g,
    trimRe: /^[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000]+|[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000]+$/g,
    formatRe: /\{(\d+)\}/g,
    escapeRegexRe: /([-.*+?^${}()|[\]\/\\])/g,
    
    /**
     * Truncate a string and add an ellipsis ('...') to the end if it exceeds the specified length
     * @param {String} value The string to truncate
     * @param {Number} length The maximum length to allow before truncating
     * @param {Boolean} word True to try to find a common work break
     * @return {String} The converted text
     */
    ellipsis: function(value, len, word) {
        if (value && value.length > len) {
            if (word) {
                var vs = value.substr(0, len - 2),
                index = Math.max(vs.lastIndexOf(' '), vs.lastIndexOf('.'), vs.lastIndexOf('!'), vs.lastIndexOf('?'));
                if (index == -1 || index < (len - 15)) {
                    return value.substr(0, len - 3) + "...";
                } else {
                    return vs.substr(0, index) + "...";
                }
            } else {
                return value.substr(0, len - 3) + "...";
            }
        }
        return value;
    },

    /**
     * Escapes the passed string for use in a regular expression
     * @param {String} str
     * @return {String}
     */
    escapeRegex : function(s) {
        return s.replace(Ext.util.Format.escapeRegexRe, "\\$1");
    },

    /**
     * Escapes the passed string for ' and \
     * @param {String} string The string to escape
     * @return {String} The escaped string
     * @static
     */
    escape : function(string) {
        return string.replace(Ext.util.Format.escapeRe, "\\$1");
    },

    
    toggle : function(string, value, other) {
        return string == value ? other : value;
    },

    
    trim : function(string) {
        return string.replace(Ext.util.Format.trimRe, "");
    },

    
    leftPad : function (val, size, ch) {
        var result = String(val);
        ch = ch || " ";
        while (result.length < size) {
            result = ch + result;
        }
        return result;
    },

    
    format : function (format) {
        var args = Ext.toArray(arguments, 1);
        return format.replace(Ext.util.Format.formatRe, function(m, i) {
            return args[i];
        });
    },

    
    htmlEncode: function(value) {
        return ! value ? value: String(value).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
    },

    
    htmlDecode: function(value) {
        return ! value ? value: String(value).replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
    },

    
    date: function(v, format) {
        if (!v) {
            return "";
        }
        if (!Ext.isDate(v)) {
            v = new Date(Date.parse(v));
        }
        return v.dateFormat(format || Ext.util.Format.defaultDateFormat);
    }
};



Ext.applyIf(Array.prototype, {
    
    indexOf: function(o, from) {
        var len = this.length;
        from = from || 0;
        from += (from < 0) ? len: 0;
        for (; from < len; ++from) {
            if (this[from] === o) {
                return from;
            }
        }
        return - 1;
    },

    
    remove: function(o) {
        var index = this.indexOf(o);
        if (index != -1) {
            this.splice(index, 1);
        }
        return this;
    },

    contains: function(o) {
        return this.indexOf(o) !== -1;
    }
});


Ext.ComponentMgr = new Ext.AbstractManager({
    typeName: 'xtype',

    
    create : function(config, defaultType){
        if (config.isComponent) {
            return config;
        } else {
            var type = config.xtype || defaultType,
                Class = this.types[type];
            if (!Class) {
                throw "Attempting to create a component with an xtype that has not been registered: " + type
            }
            return new Class(config);
        }
        return config.render ? config : new (config);
    },

    registerType : function(type, cls) {
        this.types[type] = cls;
        cls[this.typeName] = type;
        cls.prototype[this.typeName] = type;
    }
});


Ext.reg = function() {
    return Ext.ComponentMgr.registerType.apply(Ext.ComponentMgr, arguments);
}; 


Ext.create = function() {
    return Ext.ComponentMgr.create.apply(Ext.ComponentMgr, arguments);
};


Ext.ComponentQuery = {
    
    
    modeRe: /^(\s?[>]\s?|\s|$)/,
    tokenRe: /^(#)?([\w-\*]+)/,

    matchers : [{
        
        re: /^\.([\w-]+)/,
        method: 'getByXType'
    },{
        
        re: /^(?:[\[\{](?:@)?([\w-]+)\s?(?:(=|.=)\s?['"]?(.*?)["']?)?[\]\}])/,
        method: 'getByAttribute'
    }, {
        
        re: /^#([\w-]+)/,
        method: 'getById'
    }],

    
    cache: {},


    query: function(selector, root) {
        var selectors = selector.split(','),
            ln = selectors.length,
            i, query, results = [],
            noDupResults = [], dupMatcher = {}, resultsLn, cmp;

        for (i = 0; i < ln; i++) {
            selector = Ext.util.Format.trim(selectors[i]);
            query = this.cache[selector];
            if (!query) {
                this.cache[selector] = query = this.parse(selector);
            }
            results = results.concat(query.execute(root));
        }

        
        
        if (ln > 1) {
            resultsLn = results.length;
            for (i = 0; i < resultsLn; i++) {
                cmp = results[i];
                if (!dupMatcher[cmp.id]) {
                    noDupResults.push(cmp);
                    dupMatcher[cmp.id] = true;
                }
            }
            results = noDupResults;
        }
        return results;
    },

    parse: function(selector) {
        var matchers = this.matchers,
            operations = [],
            ln = matchers.length,
            lastSelector,
            tokenMatch,
            modeMatch,
            selectorMatch,
            args,
            i, matcher;

        
        
        
        while (selector && lastSelector != selector) {
            lastSelector = selector;

            
            tokenMatch = selector.match(this.tokenRe);

            if (tokenMatch) {
                
                if (tokenMatch[1] == '#') {
                    operations.push({
                        method: 'getById',
                        args: [Ext.util.Format.trim(tokenMatch[2])]
                    });
                }
                
                
                else {
                    operations.push({
                        method: 'getByXType',
                        args: [Ext.util.Format.trim(tokenMatch[2])]
                    });
                }

                
                selector = selector.replace(tokenMatch[0], '');
            }

            
            
            
            while (!(modeMatch = selector.match(this.modeRe))) {
                
                
                for (i = 0; i < ln; i++) {
                    matcher = matchers[i];
                    selectorMatch = selector.match(matcher.re);

                    
                    
                    
                    if (selectorMatch) {
                        operations.push({
                            method: matcher.method,
                            args: selectorMatch.splice(1)
                        });
                        selector = selector.replace(selectorMatch[0], '');
                        
                        
                    }
                }
            }

            
            
            
            if (modeMatch[1]) {
                operations.push({
                    mode: modeMatch[1]
                });
                selector = selector.replace(modeMatch[1], '');
            }
        }

        
        
        return new Ext.ComponentQuery.Query({
            operations: operations
        });
    }
};


Ext.ComponentQuery.Query = Ext.extend(Object, {
    constructor: function(cfg) {
        cfg = cfg || {};
        Ext.apply(this, cfg);
    },

    execute : function(root) {
        var operations = this.operations,
            ln = operations.length,
            operation, i,
            workingItems;

        
        if (!root) {
            workingItems = Ext.ComponentMgr.all.items.slice();
        }

        
        
        for (i = 0; i < ln; i++) {
            operation = operations[i];

            
            
            
            
            
            
            if (operation.mode) {
                workingItems = this.getItems(workingItems || [root], operation.mode);
            }
            else {
                workingItems = this.filterItems(workingItems || this.getItems([root]), operation);
            }

            
            
            if (i == ln -1) {
                return workingItems;
            }
        }

        return [];
    },

    filterItems : function(items, operation) {
        var matchedItems = [],
            ln = items.length,
            i, item,
            args, matches;

        
        
        
        for (i = 0; i < ln; i++) {
            item = items[i];

            
            args = [item].concat(operation.args);

            
            matches = this[operation.method].apply(this, args);
            if (matches) {
                matchedItems.push(item);
            }
        }

        return matchedItems;
    },

    getItems: function(items, mode) {
        var workingItems = [],
            ln = items.length,
            item, i;

        mode = mode ? Ext.util.Format.trim(mode) : '';

        for (i = 0; i < ln; i++) {
            item = items[i];
            if (item.getRefItems) {
                workingItems = workingItems.concat(item.getRefItems(mode != '>'));
            }
        }

        return workingItems;
    },

    
    
    getByXType : function(cmp, xtype) {
        return xtype === '*' || cmp.isXType(xtype);
    },

    
    
    getByAttribute : function(cmp, property, operator, value) {
        return (value === undefined) ? !!cmp[property] : (cmp[property] == value);
    },

    
    getById : function(cmp, id) {
        return cmp.getItemId() == id;
    }
});

Ext.PluginMgr = new Ext.AbstractManager({
    typeName: 'ptype',

    
    create : function(config, defaultType){
        var PluginCls = this.types[config.ptype || defaultType];
        if (PluginCls.init) {
            return PluginCls;
        } else {
            return new PluginCls(config);
        }
    },

    
    findByType: function(type, defaultsOnly) {
        var matches = [],
            types   = this.types;

        for (var name in types) {
            if (!types.hasOwnProperty(name)) {
                continue;
            }
            var item = types[name];

            if (item.type == type && (defaultsOnly === true && item.isDefault)) {
                matches.push(item);
            }
        }

        return matches;
    }
});


Ext.preg = function() {
    return Ext.PluginMgr.registerType.apply(Ext.PluginMgr, arguments);
};


Ext.EventManager = {
    optionsRe: /^(?:capture|scope|delay|buffer|single|stopEvent|preventDefault|stopPropagation|normalized|args|delegate|horizontal|vertical|holdThreshold|doubleTapThreshold|cancelThreshold|singleTapThreshold)$/,
    touchRe: /^(?:pinch|pinchstart|pinchend|tap|singletap|doubletap|swipe|swipeleft|swiperight|scroll|scrollstart|scrollend|touchdown|touchstart|touchmove|touchend|taphold|tapstart|tapcancel)$/i,

    
    addListener : function(element, eventName, fn, scope, o){
        
        if (Ext.isObject(eventName)) {
            this.handleListenerConfig(element, eventName);
            return;
        }

        var dom = Ext.getDom(element);

        
        if (!dom){
            throw "Error listening for \"" + eventName + '\". Element "' + element + '" doesn\'t exist.';
        }

        if (!fn) {
            throw 'Error listening for "' + eventName + '". No handler function specified';
        }

        var touch = this.touchRe.test(eventName);

        
        var wrap = this.createListenerWrap(dom, eventName, fn, scope, o, touch);

        
        this.getEventListenerCache(dom, eventName).push({
            fn: fn,
            wrap: wrap,
            scope: scope
        });

        if (touch) {
            Ext.gesture.Manager.addEventListener(dom, eventName, wrap, o);
        }
        else {
            
            o = o || {};
            dom.addEventListener(eventName, wrap, o.capture || false);
        }
    },

    
    removeListener : function(element, eventName, fn, scope) {
        
        if (Ext.isObject(eventName)) {
            this.handleListenerConfig(element, eventName, true);
            return;
        }

        var dom = Ext.getDom(element),
            cache = this.getEventListenerCache(dom, eventName),
            i = cache.length, j,
            listener, wrap, tasks;

        while (i--) {
            listener = cache[i];

            if (listener && (!fn || listener.fn == fn) && (!scope || listener.scope === scope)) {
                wrap = listener.wrap;

                
                if (wrap.task) {
                    clearTimeout(wrap.task);
                    delete wrap.task;
                }

                
                j = wrap.tasks && wrap.tasks.length;
                if (j) {
                    while (j--) {
                        clearTimeout(wrap.tasks[j]);
                    }
                    delete wrap.tasks;
                }

                if (this.touchRe.test(eventName)) {
                    Ext.gesture.Manager.removeEventListener(dom, eventName, wrap);
                }
                else {
                    
                    dom.removeEventListener(eventName, wrap, false);
                }

                
                cache.splice(i, 1);
            }
        }
    },

    
    removeAll : function(element){
        var dom = Ext.getDom(element),
            cache = this.getElementEventCache(dom),
            ev;

        for (ev in cache) {
            if (!cache.hasOwnProperty(ev)) {
                continue;
            }
            this.removeListener(ev);
        }
        Ext.cache[dom.id].events = {};
    },

    purgeElement : function(element, recurse, eventName) {
        var dom = Ext.getDom(element),
            i = 0, len;

        if(eventName) {
            this.removeListener(dom, eventName);
        }
        else {
            this.removeAll(dom);
        }

        if(recurse && dom && dom.childNodes) {
            for(len = element.childNodes.length; i < len; i++) {
                this.purgeElement(element.childNodes[i], recurse, eventName);
            }
        }
    },

    handleListenerConfig : function(element, config, remove) {
        var key, value;

        
        for (key in config) {
            if (!config.hasOwnProperty(key)) {
                continue;
            }
            
            if (!this.optionsRe.test(key)) {
                value = config[key];
                
                
                if (Ext.isFunction(value)) {
                    
                    this[(remove ? 'remove' : 'add') + 'Listener'](element, key, value, config.scope, config);
                }
                
                else {
                    
                    this[(remove ? 'remove' : 'add') + 'Listener'](element, key, config.fn, config.scope, config);
                }
            }
        }
    },

    getId : function(element) {
        
        
        
        var skip = false,
            id;

        element = Ext.getDom(element);

        if (element === document || element === window) {
            skip = true;
        }

        id = Ext.id(element);

        if (!Ext.cache[id]){
            Ext.Element.addToCache(new Ext.Element(element), id);
            if(skip){
                Ext.cache[id].skipGarbageCollection = true;
            }
        }
        return id;
    },

    
    createListenerWrap : function(dom, ename, fn, scope, o, touch) {
        o = !Ext.isObject(o) ? {} : o;

        var f = ["if(!window.Ext) {return;}"];
        
        if (touch) {
            f.push('e = new Ext.TouchEventObjectImpl(e, args);');
        }
        else {
            if(o.buffer || o.delay) {
                f.push('e = new Ext.EventObjectImpl(e);');
            } else {
                f.push('e = Ext.EventObject.setEvent(e);');
            }
        }

        if (o.delegate) {
            f.push('var t = e.getTarget("' + o.delegate + '", this);');
            f.push('if(!t) {return;}');
        } else {
            f.push('var t = e.target;');
        }

        if (o.target) {
            f.push('if(e.target !== o.target) {return;}');
        }

        if(o.stopEvent) {
            f.push('e.stopEvent();');
        } else {
            if(o.preventDefault) {
                f.push('e.preventDefault();');
            }
            if(o.stopPropagation) {
                f.push('e.stopPropagation();');
            }
        }

        if(o.normalized === false) {
            f.push('e = e.browserEvent;');
        }

        if(o.buffer) {
            f.push('(wrap.task && clearTimeout(wrap.task));');
            f.push('wrap.task = setTimeout(function(){');
        }

        if(o.delay) {
            f.push('wrap.tasks = wrap.tasks || [];');
            f.push('wrap.tasks.push(setTimeout(function(){');
        }

        
        f.push('fn.call(scope || dom, e, t, o);');

        if(o.single) {
            f.push('Ext.EventManager.removeListener(dom, ename, fn, scope);');
        }

        if(o.delay) {
            f.push('}, ' + o.delay + '));');
        }

        if(o.buffer) {
            f.push('}, ' + o.buffer + ');');
        }

        var gen = new Function('e', 'o', 'fn', 'scope', 'ename', 'dom', 'wrap', 'args', f.join("\n"));

        return function(e, args) {
            gen.call(dom, e, o, fn, scope, ename, dom, arguments.callee, args);
        };
    },

    getEventListenerCache : function(element, eventName) {
        var eventCache = this.getElementEventCache(element);
        return eventCache[eventName] || (eventCache[eventName] = []);
    },

    getElementEventCache : function(element) {
        var elementCache = Ext.cache[this.getId(element)];
        return elementCache.events || (elementCache.events = {});
    },

    
    onDocumentReady : function(fn, scope, options){
        var me = this,
            readyEvent = me.readyEvent,
            intervalId;

        if(Ext.isReady){ 
            readyEvent || (readyEvent = new Ext.util.Event());
            readyEvent.addListener(fn, scope, options);
            readyEvent.fire();
            readyEvent.listeners = []; 
        }
        else {
            if(!readyEvent) {
                readyEvent = me.readyEvent = new Ext.util.Event();

                
                var fireReady = function() {
                    Ext.isReady = true;

                    
                    window.removeEventListener('load', arguments.callee, false);

                    
                    if (intervalId) {
                        clearInterval(intervalId);
                    }
                    
                    
                    
                    setTimeout(function() {
                        Ext.supports.init();
                        
                        Ext.gesture.Manager.init();
                        Ext.orientation = Ext.Element.getOrientation();
                                                
                        
                        readyEvent.fire({
                            orientation: Ext.orientation,
                            width: Ext.Element.getViewportWidth(),
                            height: Ext.Element.getViewportHeight()
                        });
                        readyEvent.listeners = [];                        
                    }, 50);
                };

                
                

                
                intervalId = setInterval(function(){
                    if(/loaded|complete/.test(document.readyState)) {
                        clearInterval(intervalId);
                        intervalId = null;
                        fireReady();
                    }
                }, 10);

                
                window.addEventListener('load', fireReady, false);
            }

            options = options || {};
            options.delay = options.delay || 1;
            readyEvent.addListener(fn, scope, options);
        }
    },

    
    onWindowResize : function(fn, scope, options) {
        var me = this,
            resizeEvent = me.resizeEvent;

        if(!resizeEvent){
            me.resizeEvent = resizeEvent = new Ext.util.Event();
            var onResize = function() {
                resizeEvent.fire(Ext.Element.getViewportWidth(), Ext.Element.getViewportHeight());
            };
            this.addListener(window, 'resize', onResize, this);
        }

        resizeEvent.addListener(fn, scope, options);
    },

    onOrientationChange : function(fn, scope, options) {
        var me = this,
            orientationEvent = me.orientationEvent;

        if (!orientationEvent) {
            me.orientationEvent = orientationEvent = new Ext.util.Event();
            var onOrientationChange = function(e) {
                Ext.orientation = Ext.Element.getOrientation();
                if (Ext.stretchEl) {                        
                    Ext.stretchEl.setSize(window.innerWidth, window.innerHeight);
                }

                if (Ext.is.Desktop) {
                    orientationEvent.fire(Ext.orientation, window.innerWidth, window.innerHeight);
                }
                else {
                    setTimeout(function() {
                        Ext.hideAddressBar(function() {
                            orientationEvent.fire(Ext.orientation, window.innerWidth, window.innerHeight);
                        });                   
                    }, 5);                    
                }
            };

            if (Ext.supports.OrientationChange) {
                this.addListener(window, 'orientationchange', onOrientationChange, this);
            }
            else {
                 this.addListener(window, 'resize', onOrientationChange, this, {buffer: 200});
            }
        }

        orientationEvent.addListener(fn, scope, options);
    },
    
    unOrientationChange : function(fn, scope, options) {
        var me = this,
            orientationEvent = me.orientationEvent;
        
        if (orientationEvent) {
            orientationEvent.removeListener(fn, scope, options);
        }
    }
};


Ext.EventManager.on = Ext.EventManager.addListener;


Ext.EventManager.un = Ext.EventManager.removeListener;


Ext.onReady = Ext.EventManager.onDocumentReady;

Ext.EventObjectImpl = Ext.extend(Object, {
    constructor : function(e) {
        if (e) {
            this.setEvent(e.browserEvent || e);
        }
    },

    
    setEvent : function(e){
        var me = this;
        if (e == me || (e && e.browserEvent)){ 
            return e;
        }
        me.browserEvent = e;
        if(e) {
            me.type = e.type;

            
            var node = e.target;
            me.target = node && node.nodeType == 3 ? node.parentNode : node;

            
            me.xy = [e.pageX, e.pageY];
            me.timestamp = e.timeStamp;
        } else {
            me.target = null;
            me.xy = [0, 0];
        }
        return me;
    },

    
    stopEvent : function(){
        this.stopPropagation();
        this.preventDefault();
    },

    
    preventDefault : function(){
        if(this.browserEvent) {
            this.browserEvent.preventDefault();
        }
    },

    
    stopPropagation : function() {
        if(this.browserEvent) {
            this.browserEvent.stopPropagation();
        }
    },

    
    getPageX : function(){
        return this.xy[0];
    },

    
    getPageY : function(){
        return this.xy[1];
    },

    
    getXY : function(){
        return this.xy;
    },

    
    getTarget : function(selector, maxDepth, returnEl) {
        return selector ? Ext.fly(this.target).findParent(selector, maxDepth, returnEl) : (returnEl ? Ext.get(this.target) : this.target);
    },

    getTime : function() {
        return this.timestamp;
    }
});


Ext.EventObject = new Ext.EventObjectImpl();

Ext.is = {
    init : function() {
        var platforms = this.platforms,
            ln = platforms.length,
            i, platform;

        for (i = 0; i < ln; i++) {
            platform = platforms[i];
            this[platform.identity] = platform.regex.test(platform.string);
        }

        
        this.Desktop = this.Mac || this.Windows || (this.Linux && !this.Android);
        
        this.Tablet = this.iPad;
        
        this.Phone = !this.Desktop && !this.Tablet;
        
        this.iOS = this.iPhone || this.iPad || this.iPod;
    },
    
    platforms: [{
        string: navigator.platform,
        regex: /iPhone/i,
        identity: 'iPhone'
    },
    
    {
        string: navigator.platform,
        regex: /iPod/i,
        identity: 'iPod'
    },
    
    {
        string: navigator.userAgent,
        regex: /iPad/i,
        identity: 'iPad'
    },
    
    {
        string: navigator.userAgent,
        regex: /Blackberry/i,
        identity: 'Blackberry'
    },
    
    {
        string: navigator.userAgent,
        regex: /Android/i,
        identity: 'Android'
    },
    
    {
        string: navigator.platform,
        regex: /Mac/i,
        identity: 'Mac'
    },
    
    {
        string: navigator.platform,
        regex: /Win/i,
        identity: 'Windows'
    },
    
    {
        string: navigator.platform,
        regex: /Linux/i,
        identity: 'Linux'
    }]
};

Ext.is.init();


Ext.supports = {
    init : function() {
        var doc = document,
            div = doc.createElement('div'),
            tests = this.tests,
            ln = tests.length,
            i, test;

        div.innerHTML = [
            '<div style="height:30px;width:50px;">',
                '<div style="height:20px;width:20px;"></div>',
            '</div>',
            '<div style="float:left; background-color:transparent;"></div>'
        ].join('');

        doc.body.appendChild(div);

        for (i = 0; i < ln; i++) {
            test = tests[i];
            this[test.identity] = test.fn.call(this, doc, div);
        }

        doc.body.removeChild(div);
    },

    
    OrientationChange : !Ext.is.Desktop && (window.orientation !== undefined),

    tests: [
    
    {
        identity: 'Transitions',
        fn: function(doc, div) {
            var prefix = [
                    'webkit',
                    'Moz',
                    'o',
                    'ms',
                    'khtml'
                ],
                TE = 'TransitionEnd',
                transitionEndName = [
                    prefix[0] + TE,
                    'transitionend', 
                    prefix[2] + TE,
                    prefix[3] + TE,
                    prefix[4] + TE
                ],
                ln = prefix.length,
                i = 0,
                out = false;
            div = Ext.get(div);
            for (; i < ln; i++) {
                if (div.getStyle(prefix[i] + "TransitionProperty")) {
                    Ext.supports.CSS3Prefix = prefix[i];
                    Ext.supports.CSS3TransitionEnd = transitionEndName[i];
                    out = true;
                    break;
                }
            }
            return out;
        }
    },
    
    {
        identity: 'Touch',
        fn: function(doc, div) {
            return (!Ext.is.Desktop && ('ontouchstart' in div));
        }
    },
    
    {
        identity: 'RightMargin',
        fn: function(doc, div, view) {
            view = doc.defaultView;
            return !(view && view.getComputedStyle(div.firstChild.firstChild, null).marginRight != '0px');
        }
    },
    
    {
        identity: 'TransparentColor',
        fn: function(doc, div, view) {
            view = doc.defaultView;
            return !(view && view.getComputedStyle(div.lastChild, null).backgroundColor != 'transparent');
        }
    },
    
    {
        identity: 'SVG',
        fn: function(doc) {
            return !!doc.createElementNS && !!doc.createElementNS( "http:/" + "/www.w3.org/2000/svg", "svg").createSVGRect;
        }
    },
    
    
    {
        identity: 'Canvas',
        fn: function(doc) {
            return !!doc.createElement('canvas').getContext;
        }
    },
    
    {
        identity: 'VML',
        fn: function(doc) {
            var d = doc.createElement("div");
            d.innerHTML = "<!--[if vml]><br><br><![endif]-->";
            return (d.childNodes.length == 2);
        }
    },
    
    {
        identity: 'Float',
        fn: function(doc, div) {
            return !!div.lastChild.style.cssFloat;
        }
    },
    
    {
        identity: 'AudioTag',
        fn: function(doc) {
            return !!doc.createElement('audio').canPlayType;
        }
    }]
};


Ext.data.Batch = Ext.extend(Ext.util.Observable, {
    
    autoStart: false,
    
    
    current: -1,
    
    
    total: 0,
    
    
    running: false,
    
    
    complete: false,
    
    
    exception: false,
    
    
    pauseOnException: true,
    
    constructor: function(config) {                
        this.addEvents(
          
          'complete',
          
          
          'exception',
          
          
          'operation-complete'
        );
        
        Ext.data.Batch.superclass.constructor.call(this, config);
        
        
        this.operations = [];
    },
    
    
    add: function(operation) {
        this.total++;
        
        operation.setBatch(this);
        
        this.operations.push(operation);
    },
    
    
    start: function() {
        this.exception = false;
        this.running = true;
        
        this.runNextOperation();
    },
    
    
    runNextOperation: function() {
        this.runOperation(this.current + 1);
    },
    
    
    pause: function() {
        this.running = false;
    },
    
    
    runOperation: function(index) {
        var operations = this.operations,
            operation  = operations[index];
        
        if (operation == undefined) {
            this.running  = false;
            this.complete = true;
            this.fireEvent('complete', this, operations[operations.length - 1]);
        } else {
            this.current = index;
            
            var onProxyReturn = function(operation) {
                var hasException = operation.hasException();
                
                if (hasException) {
                    this.fireEvent('exception', this, operation);
                } else {
                    this.fireEvent('operation-complete', this, operation);
                }

                if (hasException && this.pauseOnException) {
                    this.pause();
                } else {
                    operation.markCompleted();
                    
                    this.runNextOperation();
                }
            };
            
            operation.markStarted();
            
            this.proxy[operation.action](operation, onProxyReturn, this);
        }
    }
});

Ext.data.Model = Ext.extend(Ext.util.Stateful, {
    evented: false,
    isModel: true,
    
    
    phantom : false,
    
    
    idProperty: 'id',
    
    
    defaultProxyType: 'ajax',
    
    constructor: function(data, id) {
        data = data || {};
        
        if (this.evented) {
            this.addEvents(
                
            );
        }
        
        
        this.internalId = (id || id === 0) ? id : Ext.data.Model.id(this);
        
        Ext.data.Model.superclass.constructor.apply(this);
        
        
        var fields = this.fields.items,
            length = fields.length,
            field, name, i;
        
        for (i = 0; i < length; i++) {
            field = fields[i];
            name  = field.name;
            
            if (data[name] == undefined) {
                data[name] = field.defaultValue;
            }
        }
        
        this.set(data);
        
        if (this.getId()) {
            this.phantom = false;
        }
        
        if (typeof this.init == 'function') {
            this.init();
        }
    },
    
    
    validate: function() {
        var errors      = new Ext.data.Errors(),
            validations = this.validations,
            validators  = Ext.data.validations,
            length, validation, field, valid, type, i;

        if (validations) {
            length = validations.length;
            
            for (i = 0; i < length; i++) {
                validation = validations[i];
                field = validation.field;
                type  = validation.type;
                valid = validators[type](validation, this.get(field));
                
                if (!valid) {
                    errors.add({
                        field  : field,
                        message: validation.message || validators[type + 'Message']
                    });
                }
            }
        }
        
        return errors;
    },
    
    
    getProxy: function() {
        return this.constructor.proxy;
    },
    
    
    save: function(options) {
        var action = this.phantom ? 'create' : 'update';
        
        options = options || {};
        
        Ext.apply(options, {
            records: [this],
            action : action
        });
        
        var operation  = new Ext.data.Operation(options),
            successCb  = options.success,
            failureCb  = options.failure,
            callbackFn = options.callback,
            scope      = options.scope,
            record;
        
        var callback = function(operation) {
            record = operation.getRecords()[0];
            
            if (operation.wasSuccessful()) {
                if (typeof successCb == 'function') {
                    successCb.call(scope, record, operation);
                }
            } else {
                if (typeof failureCb == 'function') {
                    failureCb.call(scope, record, operation);
                }
            }
            
            if (typeof callbackFn == 'function') {
                callbackFn.call(scope, record, operation);
            }
        };
        
        this.getProxy()[action](operation, callback, this);
    },
    
    
    getId: function() {
        return this.get(this.idProperty);
    },
    
    
    setId: function(id) {
        this.set(this.idProperty, id);
    },
    
    
    join : function(store) {
        
        this.store = store;
    },
    
    
    unjoin: function(store) {
        delete this.store;
    },
    
    
    afterEdit : function() {
        this.callStore('afterEdit');
    },
    
    
    afterReject : function() {
        this.callStore("afterReject");
    },
    
    
    afterCommit: function() {
        this.callStore('afterCommit');
    },
    
    
    callStore: function(fn) {
        var store = this.store;
        
        if (store != undefined && typeof store[fn] == "function") {
            store[fn](this);
        }
    }
});

Ext.apply(Ext.data.Model, {
    
    setProxy: function(proxy) {
        
        proxy = Ext.data.ProxyMgr.create(proxy);
        
        proxy.setModel(this);
        this.proxy = proxy;
        
        return proxy;
    },
    
    
    load: function(id, config) {
        config = Ext.applyIf(config || {}, {
            action: 'read',
            id    : id
        });
        
        var operation  = new Ext.data.Operation(config),
            callbackFn = config.callback,
            successCb  = config.success,
            failureCb  = config.failure,
            scope      = config.scope,
            record, callback;
        
        callback = function(operation) {
            record = operation.getRecords()[0];
            
            if (operation.wasSuccessful()) {
                if (typeof successCb == 'function') {
                    successCb.call(scope, record, operation);
                }
            } else {
                if (typeof failureCb == 'function') {
                    failureCb.call(scope, record, operation);
                }
            }
            
            if (typeof callbackFn == 'function') {
                callbackFn.call(scope, record, operation);
            }
        };
        
        this.proxy.read(operation, callback, this);
    }
});


Ext.data.Model.id = function(rec) {
    rec.phantom = true;
    return [Ext.data.Model.PREFIX, '-', Ext.data.Model.AUTO_ID++].join('');
};



Ext.ns('Ext.data.Record');


Ext.data.Record.id = Ext.data.Model.id;


Ext.data.Model.PREFIX = 'ext-record';
Ext.data.Model.AUTO_ID = 1;
Ext.data.Model.EDIT = 'edit';
Ext.data.Model.REJECT = 'reject';
Ext.data.Model.COMMIT = 'commit';


Ext.data.Association = Ext.extend(Object, {
    
    
    
    
    
    primaryKey: 'id',
    
    constructor: function(config) {
        Ext.apply(this, config);
        
        var types           = Ext.ModelMgr.types,
            ownerName       = config.ownerModel,
            associatedName  = config.associatedModel,
            ownerModel      = types[ownerName],
            associatedModel = types[associatedName],
            ownerProto;
        
        if (ownerModel == undefined) {
            throw("The configured ownerModel was not valid (you tried " + ownerName + ")");
        }
        
        if (associatedModel == undefined) {
            throw("The configured associatedModel was not valid (you tried " + associatedName + ")");
        }
        
        this.ownerModel = ownerModel;
        this.associatedModel = associatedModel;
        
        Ext.applyIf(this, {
            ownerName : ownerName,
            associatedName: associatedName
        });
    }
});

Ext.data.HasManyAssociation = Ext.extend(Ext.data.Association, {
    
    
    
    
    
    
    constructor: function(config) {
        Ext.data.HasManyAssociation.superclass.constructor.apply(this, arguments);
        
        var ownerProto = this.ownerModel.prototype,
            name       = this.name;
        
        Ext.applyIf(this, {
            foreignKey: this.ownerName.toLowerCase() + "_id"
        });
        
        ownerProto[name] = this.createStore();
    },
    
    
    createStore: function() {
        var associatedModel = this.associatedModel,
            storeName       = this.name + "Store",
            foreignKey      = this.foreignKey,
            primaryKey      = this.primaryKey,
            storeConfig     = this.storeConfig || {};
        
        return function() {
            var me = this,
                config, filter,
                modelDefaults = {};
                
            if (me[storeName] == undefined) {
                filter = {
                    property  : foreignKey,
                    value     : me.get(primaryKey),
                    exactMatch: true
                };
                
                modelDefaults[foreignKey] = me.get(primaryKey);
                
                config = Ext.apply({}, storeConfig, {
                    model        : associatedModel,
                    filters      : [filter],
                    remoteFilter : false,
                    modelDefaults: modelDefaults
                });
                
                me[storeName] = new Ext.data.Store(config);
            }
            
            return me[storeName];
        };
    }
});

Ext.data.BelongsToAssociation = Ext.extend(Ext.data.Association, {
    
    
    

    
    
    constructor: function(config) {
        Ext.data.BelongsToAssociation.superclass.constructor.apply(this, arguments);
        
        var me             = this,
            ownerProto     = me.ownerModel.prototype,
            associatedName = me.associatedName,
            getterName     = me.getterName || 'get' + associatedName,
            setterName     = me.setterName || 'set' + associatedName;

        Ext.applyIf(me, {
            name      : associatedName,
            foreignKey: associatedName.toLowerCase() + "_id"
        });
        
        ownerProto[getterName] = me.createGetter();
        ownerProto[setterName] = me.createSetter();
    },
    
    
    createSetter: function() {
        var me              = this,
            ownerModel      = me.ownerModel,
            associatedModel = me.associatedModel,
            foreignKey      = me.foreignKey,
            primaryKey      = me.primaryKey;
        
        
        return function(value, options, scope) {
            this.set(foreignKey, value);
            
            if (typeof options == 'function') {
                options = {
                    callback: options,
                    scope: scope || this
                };
            }
            
            if (Ext.isObject(options)) {
                return this.save(options);
            }
        };
    },
    
    
    createGetter: function() {
        var me              = this,
            ownerModel      = me.ownerModel,
            associatedName  = me.associatedName,
            associatedModel = me.associatedModel,
            foreignKey      = me.foreignKey,
            primaryKey      = me.primaryKey,
            instanceName    = me.name + 'BelongsToInstance';
        
        
        return function(options, scope) {
            options = options || {};
            
            var foreignKeyId = this.get(foreignKey),
                instance, callbackFn;
                
            if (this[instanceName] == undefined) {
                instance = Ext.ModelMgr.create({}, associatedName);
                instance.set(primaryKey, foreignKeyId);

                if (typeof options == 'function') {
                    options = {
                        callback: options,
                        scope: scope || this
                    };
                }
                
                associatedModel.load(foreignKeyId, options);
            } else {
                instance = this[instanceName];
                
                
                
                
                if (typeof options == 'function') {
                    options.call(scope || this, instance);
                }
                
                if (options.success) {
                    options.success.call(scope || this, instance);
                }
                
                if (options.callback) {
                    options.callback.call(scope || this, instance);
                }
                
                return instance;
            }
        };
    }
});

Ext.data.PolymorphicAssociation = Ext.extend(Ext.data.Association, {

    constructor: function(config) {
        Ext.data.PolymorphicAssociation.superclass.constructor.call(this, config);
        
        var ownerProto = this.ownerModel.prototype,
            name       = this.name;
        
        Ext.applyIf(this, {
            associationIdField: this.ownerName.toLowerCase() + "_id"
        });
        
        ownerProto[name] = this.createStore();
    },

    
    createStore: function() {
        var association           = this,
            ownerName             = this.ownerName,
            storeName             = this.name + "Store",
            associatedModel       = this.associatedModel,
            primaryKey            = this.primaryKey,
            associationIdField    = 'associated_id',
            associationModelField = 'associated_model';
        
        return function() {
            var me = this,
                modelDefaults = {},
                config, filters;
                
            if (me[storeName] == undefined) {
                filters = [
                    {
                        property  : associationIdField,
                        value     : me.get(primaryKey),
                        exactMatch: true
                    },
                    {
                        property  : associationModelField,
                        value     : ownerName,
                        exactMatch: true
                    }
                ];
                
                modelDefaults[associationIdField] = me.get(primaryKey);
                modelDefaults[associationModelField] = ownerName;
                
                config = Ext.apply({}, association.storeConfig || {}, {
                    model        : associatedModel,
                    filters      : filters,
                    remoteFilter : false,
                    modelDefaults: modelDefaults
                });
                
                me[storeName] = new Ext.data.Store(config);
            }
            
            return me[storeName];
        };
    }
});

Ext.data.Field = Ext.extend(Object, {
    
    constructor : function(config) {
        if (Ext.isString(config)) {
            config = {name: config};
        }
        Ext.apply(this, config);
        
        var types = Ext.data.Types,
            st = this.sortType,
            t;

        if (this.type) {
            if (Ext.isString(this.type)) {
                this.type = types[this.type.toUpperCase()] || types.AUTO;
            }
        } else {
            this.type = types.AUTO;
        }

        
        if (Ext.isString(st)) {
            this.sortType = Ext.data.SortTypes[st];
        } else if(Ext.isEmpty(st)) {
            this.sortType = this.type.sortType;
        }

        if (!this.convert) {
            this.convert = this.type.convert;
        }
    },
    
    
    
    
    
    dateFormat: null,
    
    
    useNull: false,
    
    
    defaultValue: "",
    
    mapping: null,
    
    sortType : null,
    
    sortDir : "ASC",
    
    allowBlank : true
});


Ext.data.SortTypes = {
    
    none : function(s) {
        return s;
    },

    
    stripTagsRE : /<\/?[^>]+>/gi,

    
    asText : function(s) {
        return String(s).replace(this.stripTagsRE, "");
    },

    
    asUCText : function(s) {
        return String(s).toUpperCase().replace(this.stripTagsRE, "");
    },

    
    asUCString : function(s) {
        return String(s).toUpperCase();
    },

    
    asDate : function(s) {
        if(!s){
            return 0;
        }
        if(Ext.isDate(s)){
            return s.getTime();
        }
        return Date.parse(String(s));
    },

    
    asFloat : function(s) {
        var val = parseFloat(String(s).replace(/,/g, ""));
        return isNaN(val) ? 0 : val;
    },

    
    asInt : function(s) {
        var val = parseInt(String(s).replace(/,/g, ""), 10);
        return isNaN(val) ? 0 : val;
    }
};

Ext.data.Types = new function() {
    var st = Ext.data.SortTypes;
    
    Ext.apply(this, {
        
        stripRe: /[\$,%]/g,
        
        
        AUTO: {
            convert: function(v) {
                return v;
            },
            sortType: st.none,
            type: 'auto'
        },

        
        STRING: {
            convert: function(v) {
                return (v === undefined || v === null) ? '' : String(v);
            },
            sortType: st.asUCString,
            type: 'string'
        },

        
        INT: {
            convert: function(v) {
                return v !== undefined && v !== null && v !== '' ?
                    parseInt(String(v).replace(Ext.data.Types.stripRe, ''), 10) : (this.useNull ? null : 0);
            },
            sortType: st.none,
            type: 'int'
        },
        
        
        FLOAT: {
            convert: function(v) {
                return v !== undefined && v !== null && v !== '' ?
                    parseFloat(String(v).replace(Ext.data.Types.stripRe, ''), 10) : (this.useNull ? null : 0);
            },
            sortType: st.none,
            type: 'float'
        },
        
        
        BOOL: {
            convert: function(v) {
                return v === true || v === 'true' || v == 1;
            },
            sortType: st.none,
            type: 'bool'
        },
        
        
        DATE: {
            convert: function(v) {
                var df = this.dateFormat;
                if (!v) {
                    return null;
                }
                if (Ext.isDate(v)) {
                    return v;
                }
                if (df) {
                    if (df == 'timestamp') {
                        return new Date(v*1000);
                    }
                    if (df == 'time') {
                        return new Date(parseInt(v, 10));
                    }
                    return Date.parseDate(v, df);
                }
                
                var parsed = Date.parse(v);
                return parsed ? new Date(parsed) : null;
            },
            sortType: st.asDate,
            type: 'date'
        }
    });
    
    Ext.apply(this, {
        
        BOOLEAN: this.BOOL,
        
        
        INTEGER: this.INT,
        
        
        NUMBER: this.FLOAT    
    });
};

Ext.ModelMgr = new Ext.AbstractManager({
    typeName: 'mtype',
    
    
    defaultProxyType: 'ajax',
    
    
    associationStack: [],
    
    
    registerType: function(name, config) {
        
        
        var PluginMgr    = Ext.PluginMgr,
            plugins      = PluginMgr.findByType('model', true),
            fields       = config.fields || [],
            associations = config.associations || [],
            belongsTo    = config.belongsTo,
            hasMany      = config.hasMany,
            extendName   = config.extend,
            modelPlugins = config.plugins || [],
            association, model, length, i,
            extendModel, extendModelProto, extendValidations, proxy;
        
        
        
        if (belongsTo) {
            if (!Ext.isArray(belongsTo)) {
                belongsTo = [belongsTo];
            }
            
            for (i = 0; i < belongsTo.length; i++) {
                association = belongsTo[i];
                
                if (!Ext.isObject(association)) {
                    association = {model: association};
                }
                Ext.apply(association, {type: 'belongsTo'});
                
                associations.push(association);
            }
            
            delete config.belongsTo;
        }
        
        if (hasMany) {
            if (!Ext.isArray(hasMany)) {
                hasMany = [hasMany];
            }
            
            for (i = 0; i < hasMany.length; i++) {
                association = hasMany[i];
                
                if (!Ext.isObject(association)) {
                    association = {model: association};
                }
                
                Ext.apply(association, {type: 'hasMany'});
                
                associations.push(association);
            }
            
            delete config.hasMany;
        }
        
        
        if (extendName) {
            extendModel       = this.types[extendName];
            extendModelProto  = extendModel.prototype;
            extendValidations = extendModelProto.validations;
            
            proxy              = extendModel.proxy;
            fields             = extendModelProto.fields.items.concat(fields);
            associations       = extendModelProto.associations.items.concat(associations);
            config.validations = extendValidations ? extendValidations.concat(config.validations) : config.validations;
        } else {
            extendModel = Ext.data.Model;
            proxy = config.proxy;
        }
        
        model = Ext.extend(extendModel, config);
        
        for (i = 0, length = modelPlugins.length; i < length; i++) {
            plugins.push(PluginMgr.create(modelPlugins[i]));
        }
        
        this.types[name] = model;
        
        Ext.override(model, {
            plugins     : plugins,
            fields      : this.createFields(fields),
            associations: this.createAssociations(associations, name)
        });
        
        model.modelName = name;
        Ext.data.Model.setProxy.call(model, proxy || this.defaultProxyType);
        model.getProxy = model.prototype.getProxy;
        
        model.load = function() {
            Ext.data.Model.load.apply(this, arguments);
        };
        
        for (i = 0, length = plugins.length; i < length; i++) {
            plugins[i].bootstrap(model, config);
        }
        
        model.defined = true;
        this.onModelDefined(model);
        
        return model;
    },
    
    
    onModelDefined: function(model) {
        var stack  = this.associationStack,
            length = stack.length,
            create = [],
            association, i;
        
        for (i = 0; i < length; i++) {
            association = stack[i];
            
            if (association.associatedModel == model.modelName) {
                create.push(association);
            }
        }
        
        length = create.length;
        for (i = 0; i < length; i++) {
            this.addAssociation(create[i], this.types[create[i].ownerModel].prototype.associations);
            stack.remove(create[i]);
        }
    },
    
    
    createAssociations: function(associations, name) {
        var length = associations.length,
            i, associationsMC, association;
        
        associationsMC = new Ext.util.MixedCollection(false, function(association) {
            return association.name;
        });
        
        for (i = 0; i < length; i++) {
            association = associations[i];
            Ext.apply(association, {
                ownerModel: name,
                associatedModel: association.model
            });
            
            if (this.types[association.model] == undefined) {
                this.associationStack.push(association);
            } else {
                this.addAssociation(association, associationsMC);
            }
        }
        
        return associationsMC;
    },
    
    
    addAssociation: function(association, associationsMC) {
        var type = association.type;
        
        if (type == 'belongsTo') {
            associationsMC.add(new Ext.data.BelongsToAssociation(association));
        }
        
        if (type == 'hasMany') {
            associationsMC.add(new Ext.data.HasManyAssociation(association));
        }
        
        if (type == 'polymorphic') {
            associationsMC.add(new Ext.data.PolymorphicAssociation(association));
        }
    },
    
    
    createFields: function(fields) {
        var length = fields.length,
            i, fieldsMC;
        
        fieldsMC = new Ext.util.MixedCollection(false, function(field) {
            return field.name;
        });
        
        for (i = 0; i < length; i++) {
            fieldsMC.add(new Ext.data.Field(fields[i]));
        }
        
        return fieldsMC;
    },
    
    
    getModel: function(id) {
        var model = id;
        if (typeof model == 'string') {
            model = this.types[model];
        }
        return model;
    },
    
    create: function(config, name) {
        var con = typeof name == 'function' ? name : this.types[name || config.name];
        
        return new con(config);
    }
});

Ext.regModel = function() {
    return Ext.ModelMgr.registerType.apply(Ext.ModelMgr, arguments);
};

Ext.data.Operation = Ext.extend(Object, {
    
    synchronous: true,
    
    
    action: undefined,
    
    
    filters: undefined,
    
    
    sorters: undefined,
    
    
    group: undefined,
    
    
    start: undefined,
    
    
    limit: undefined,
    
    
    batch: undefined,
    
        
    
    started: false,
    
    
    running: false,
    
    
    complete: false,
    
    
    success: undefined,
    
    
    exception: false,
    
    
    error: undefined,
    
    constructor: function(config) {
        Ext.apply(this, config || {});
    },
    
    
    markStarted: function() {
        this.started = true;
        this.running = true;
    },
    
    
    markCompleted: function() {
        this.complete = true;
        this.running  = false;
    },
    
    
    markSuccessful: function() {
        this.success = true;
    },
    
    
    markException: function(error) {
        this.exception = true;
        this.success = false;
        this.running = false;
        this.error = error;
    },
    
    
    hasException: function() {
        return this.exception === true;
    },
    
    
    getError: function() {
        return this.error;
    },
    
    
    getRecords: function() {
        var resultSet = this.getResultSet();
        
        return (resultSet == undefined ? this.records : resultSet.records);
    },
    
    
    getResultSet: function() {
        return this.resultSet;
    },
    
    
    isStarted: function() {
        return this.started === true;
    },
    
    
    isRunning: function() {
        return this.running === true;
    },
    
    
    isComplete: function() {
        return this.complete === true;
    },
    
    
    wasSuccessful: function() {
        return this.isComplete() && this.success === true;
    },
    
    
    setBatch: function(batch) {
        this.batch = batch;
    },
    
    
    allowWrite: function() {
        return this.action != 'read';
    }
});
Ext.data.ProxyMgr = new Ext.AbstractManager({
    create: function(config) {
        if (config == undefined || typeof config == 'string') {
            config = {
                type: config
            };
        }

        if (!(config instanceof Ext.data.Proxy)) {
            Ext.applyIf(config, {
                type : this.defaultProxyType,
                model: this.model
            });

            var type = config[this.typeName] || config.type,
                Constructor = this.types[type];

            if (Constructor == undefined) {
                throw new Error(Ext.util.Format.format("The '{0}' type has not been registered with this manager", type));
            }

            return new Constructor(config);
        } else {
            return config;
        }
    }
});

Ext.data.ReaderMgr = new Ext.AbstractManager({
    typeName: 'rtype'
});

Ext.data.Request = Ext.extend(Object, {
    
    action: undefined,
    
    
    params: undefined,
    
    
    method: 'GET',
    
    
    url: undefined,

    constructor: function(config) {
        Ext.apply(this, config);
    }
});

Ext.data.ResultSet = Ext.extend(Object, {
    
    loaded: true,
    
    
    count: 0,
    
    
    total: 0,
    
    
    success: false,
    
    

    constructor: function(config) {
        Ext.apply(this, config);
        
        
        this.totalRecords = this.total;
        
        if (config.count == undefined) {
            this.count = this.records.length;
        }
    }
});

Ext.data.AbstractStore = Ext.extend(Ext.util.Observable, {
    remoteSort  : false,
    remoteFilter: false,

    

    
    autoLoad: false,

    
    autoSave: false,

    
    batchUpdateMode: 'operation',

    
    filterOnLoad: true,

    
    sortOnLoad: true,

    
    defaultSortDirection: "ASC",

    
    implicitModel: false,

    
    defaultProxyType: 'memory',

    
    isDestroyed: false,

    isStore: true,

    

    
    constructor: function(config) {
        this.addEvents(
            
            'add',

            
            'remove',
            
            
            'update',

            
            'datachanged',

            
            'beforeload',

            
            'load',

            
            'beforesync'
        );
        
        Ext.apply(this, config);

        
        this.removed = [];

        
        this.sortToggle = {};

        Ext.data.AbstractStore.superclass.constructor.apply(this, arguments);

        this.model = Ext.ModelMgr.getModel(config.model);
        
        
        Ext.applyIf(this, {
            modelDefaults: {}
        });

        
        if (!this.model && config.fields) {
            this.model = Ext.regModel('ImplicitModel-' + this.storeId || Ext.id(), {
                fields: config.fields
            });

            delete this.fields;

            this.implicitModel = true;
        }

        
        this.setProxy(config.proxy || this.model.proxy);

        if (this.id && !this.storeId) {
            this.storeId = this.id;
            delete this.id;
        }

        if (this.storeId) {
            Ext.StoreMgr.register(this);
        }
    },


    
    setProxy: function(proxy) {
        if (proxy instanceof Ext.data.Proxy) {
            proxy.setModel(this.model);
        } else {
            Ext.applyIf(proxy, {
                model: this.model
            });
            
            proxy = Ext.data.ProxyMgr.create(proxy);
        }
        
        this.proxy = proxy;
        
        return this.proxy;
    },

    
    getProxy: function() {
        return this.proxy;
    },

    
    create: function(data, options) {
        var instance = Ext.ModelMgr.create(Ext.applyIf(data, this.modelDefaults), this.model.modelName),
            operation;
        
        options = options || {};

        Ext.applyIf(options, {
            action : 'create',
            records: [instance]
        });

        operation = new Ext.data.Operation(options);

        return this.proxy.create(operation, this.onProxyWrite, this);
    },

    read: function() {
        return this.load.apply(this, arguments);
    },

    onProxyRead: Ext.emptyFn,

    update: function(options) {
        options = options || {};

        Ext.applyIf(options, {
            action : 'update',
            records: this.getUpdatedRecords()
        });

        var operation = new Ext.data.Operation(options);

        return this.proxy.update(operation, this.onProxyWrite, this);
    },

    onProxyWrite: Ext.emptyFn,


    
    destroy: function(options) {
        options = options || {};

        Ext.applyIf(options, {
            action : 'destroy',
            records: this.getRemovedRecords()
        });

        var operation = new Ext.data.Operation(options);

        return this.proxy.destroy(operation, this.onProxyWrite, this);
    },


    onBatchOperationComplete: function(batch, operation) {
        if (operation.action == 'create') {
            var records = operation.records,
                length  = records.length,
                i;

            for (i = 0; i < length; i++) {
                records[i].needsAdd = false;
            }
        }
    },

    
    onBatchComplete: function(batch, operation) {
        var operations = batch.operations,
            length = operations.length,
            i;

        this.suspendEvents();

        for (i = 0; i < length; i++) {
            this.onProxyWrite(operations[i]);
        }

        this.resumeEvents();

        this.fireEvent('datachanged', this);
    },

    onBatchException: function(batch, operation) {
        
        
        
        
        
    },

    
    filterNew: function(item) {
        return item.phantom == true || item.needsAdd == true;
    },

    getNewRecords: function() {
        return [];
    },

    getUpdatedRecords: function() {
        return [];
    },

    
    filterDirty: function(item) {
        return item.dirty == true;
    },

    
    getRemovedRecords: function() {
        return this.removed;
    },


    sort: function(sorters, direction) {

    },

    
    decodeSorters: function(sorters) {
        if (!Ext.isArray(sorters)) {
            if (sorters == undefined) {
                sorters = [];
            } else {
                sorters = [sorters];
            }
        }

        var length = sorters.length,
            Sorter = Ext.util.Sorter,
            config, i;

        for (i = 0; i < length; i++) {
            config = sorters[i];

            if (!(config instanceof Sorter)) {
                if (Ext.isString(config)) {
                    config = {
                        property: config
                    };
                }
                
                Ext.applyIf(config, {
                    root     : 'data',
                    direction: "ASC"
                });

                
                if (config.fn) {
                    config.sorterFn = config.fn;
                }

                
                if (typeof config == 'function') {
                    config = {
                        sorterFn: config
                    };
                }

                sorters[i] = new Sorter(config);
            }
        }

        return sorters;
    },

    filter: function(filters, value) {

    },

    
    createSortFunction: function(field, direction) {
        direction = direction || "ASC";
        var directionModifier = direction.toUpperCase() == "DESC" ? -1 : 1;

        var fields   = this.model.prototype.fields,
            sortType = fields.get(field).sortType;

        
        
        return function(r1, r2) {
            var v1 = sortType(r1.data[field]),
                v2 = sortType(r2.data[field]);

            return directionModifier * (v1 > v2 ? 1 : (v1 < v2 ? -1 : 0));
        };
    },

    
    decodeFilters: function(filters) {
        if (!Ext.isArray(filters)) {
            if (filters != undefined) {
                filters = [filters];
            } else {
                filters = [];
            }
        }

        var length = filters.length,
            Filter = Ext.util.Filter,
            config, i;

        for (i = 0; i < length; i++) {
            config = filters[i];

            if (!(config instanceof Filter)) {
                Ext.apply(config, {
                    root: 'data'
                });

                
                if (config.fn) {
                    config.filter = config.fn;
                }

                
                if (typeof config == 'function') {
                    config = {
                        filter: config
                    };
                }

                filters[i] = new Filter(config);
            }
        }

        return filters;
    },

    clearFilter: function(supressEvent) {

    },

    isFiltered: function() {

    },

    filterBy: function(fn, scope) {

    },


    
    sync: function() {
        var me        = this,
            options   = {},
            toCreate  = me.getNewRecords(),
            toUpdate  = me.getUpdatedRecords(),
            toDestroy = me.getRemovedRecords(),
            needsSync = false;

        if (toCreate.length > 0) {
            options.create = toCreate;
            needsSync = true;
        }

        if (toUpdate.length > 0) {
            options.update = toUpdate;
            needsSync = true;
        }

        if (toDestroy.length > 0) {
            options.destroy = toDestroy;
            needsSync = true;
        }

        if (needsSync && me.fireEvent('beforesync', options) !== false) {
            me.proxy.batch(options, me.getBatchListeners());
        }
    },


    
    getBatchListeners: function() {
        var listeners = {
            scope: this,
            exception: this.onBatchException
        };

        if (this.batchUpdateMode == 'operation') {
            listeners['operation-complete'] = this.onBatchOperationComplete;
        } else {
            listeners['complete'] = this.onBatchComplete;
        }

        return listeners;
    },

    
    save: function() {
        return this.sync.apply(this, arguments);
    },

    
    load: function(options) {
        var me = this,
            operation;

        options = options || {};

        Ext.applyIf(options, {
            action : 'read',
            filters: me.filters,
            sorters: me.sorters
        });

        operation = new Ext.data.Operation(options);

        if (me.fireEvent('beforeload', me, operation) !== false) {
            me.proxy.read(operation, me.onProxyLoad, me);
        }
        
        return me;
    },

    
    afterEdit : function(record) {
        this.fireEvent('update', this, record, Ext.data.Model.EDIT);
    },

    
    afterReject : function(record) {
        this.fireEvent('update', this, record, Ext.data.Model.REJECT);
    },

    
    afterCommit : function(record) {
        if (this.autoSave) {
            this.sync();
        }

        this.fireEvent('update', this, record, Ext.data.Model.COMMIT);
    },

    clearData: Ext.emptFn,

    destroyStore: function() {
        if (!this.isDestroyed) {
            if (this.storeId) {
                Ext.StoreMgr.unregister(this);
            }
            this.clearData();
            this.data = null;
            this.tree = null;
            
            this.reader = this.writer = null;
            this.purgeListeners();
            this.isDestroyed = true;

            if (this.implicitModel) {
                Ext.destroy(this.model);
            }
        }
    },

    
    getSortState : function() {
        return this.sortInfo;
    },

    getCount: function() {

    },

    getById: function(id) {

    },

    
    
    removeAll: function() {

    }
});

Ext.data.Store = Ext.extend(Ext.data.AbstractStore, {
    
    remoteSort  : false,

    
    remoteFilter: false,

    

    

    
    groupField: undefined,

    
    groupDir: "ASC",

    
    pageSize: 25,

    
    currentPage: undefined,

    
    implicitModel: false,

    
    defaultProxyType: 'memory',

    
    isDestroyed: false,

    isStore: true,

    
    constructor: function(config) {
        config = config || {};
        
        
        this.data = new Ext.util.MixedCollection(false, function(record) {
            return record.internalId;
        });

        if (config.data) {
            this.inlineData = config.data;
            delete config.data;
        }

        Ext.data.Store.superclass.constructor.call(this, config);
        
        this.sorters = this.decodeSorters(this.sorters);
        
        var proxy = this.proxy,
            data  = this.inlineData;
            
        if (data) {
            if (proxy instanceof Ext.data.MemoryProxy) {
                proxy.data = data;
                this.read();
            } else {
                this.add.apply(this, data);
            }
            
            this.sort(this.sorters);
            delete this.inlineData;
        } else if (this.autoLoad) {
            Ext.defer(this.load, 10, this, [typeof this.autoLoad == 'object' ? this.autoLoad : undefined]);
        }
    },

    
    getGroups: function() {
        var records  = this.data.items,
            length   = records.length,
            groups   = [],
            pointers = {},
            record, groupStr, group, i;

        for (i = 0; i < length; i++) {
            record = records[i];
            groupStr = this.getGroupString(record);
            group = pointers[groupStr];

            if (group == undefined) {
                group = {
                    name: groupStr,
                    children: []
                };

                groups.push(group);
                pointers[groupStr] = group;
            }

            group.children.push(record);
        }
        
        return groups;
    },

    
    getGroupString: function(instance) {
        return instance.get(this.groupField);
    },
    
    
    first: function() {
        return this.data.first();
    },
    
    
    last: function() {
        return this.data.last();
    },

    
    insert : function(index, records) {
        var i, record, len;

        records = [].concat(records);
        for (i = 0, len = records.length; i < len; i++) {
            records[i].set(this.modelDefaults);

            this.data.insert(index + i, records[i]);
            records[i].join(this);
        }

        if (this.snapshot) {
            this.snapshot.addAll(records);
        }

        this.fireEvent('add', this, records, index);
        this.fireEvent('datachanged', this);
    },

    
    add: function() {
        var records = Array.prototype.slice.apply(arguments),
            length  = records.length,
            record, i;

        for (i = 0; i < length; i++) {
            record = records[i];
            
            if (!(record instanceof Ext.data.Model)) {
                record = Ext.ModelMgr.create(record, this.model);
            }

            if (record.phantom == false) {
                record.needsAdd = true;
            }
            
            records[i] = record;
        }

        this.insert(this.data.length, records);

        return records;
    },

    
    each : function(fn, scope) {
        this.data.each(fn, scope);
    },

    
    remove: function(records) {
        if (!Ext.isArray(records)) {
            records = [records];
        }

        var length = records.length,
            i, index, record;

        for (i = 0; i < length; i++) {
            record = records[i];
            index = this.data.indexOf(record);

            if (index > -1) {
                this.removed.push(record);

                if (this.snapshot) {
                    this.snapshot.remove(record);
                }

                record.unjoin(this);
                this.data.remove(record);

                this.fireEvent('remove', this, record, index);
            }
        }

        this.fireEvent('datachanged', this);
    },

    
    removeAt: function(index) {
        var record = this.getAt(index);

        if (record) {
            this.remove(record);
        }
    },

    
    load: function(options) {
        options = options || {};
        
        Ext.applyIf(options, {
            group  : {field: this.groupField, direction: this.groupDir},
            start  : 0,
            limit  : this.pageSize,
            addRecords: false
        });
        
        return Ext.data.Store.superclass.load.call(this, options);
    },

    
    onProxyLoad: function(operation) {
        var records = operation.getRecords();
        
        this.loadRecords(records, operation.addRecords);
        this.fireEvent('load', this, records, operation.wasSuccessful());
        
        
        this.fireEvent('read', this, records, operation.wasSuccessful());

        
        var callback = operation.callback;
        
        if (typeof callback == 'function') {
            callback.call(operation.scope || this, records, operation, operation.wasSuccessful());
        }
    },

    
    onProxyWrite: function(operation) {
        var data     = this.data,
            action   = operation.action,
            records  = operation.getRecords(),
            length   = records.length,
            callback = operation.callback,
            record, i;

        if (operation.wasSuccessful()) {
            if (action == 'create' || action == 'update') {
                for (i = 0; i < length; i++) {
                    record = records[i];

                    record.phantom = false;
                    record.join(this);
                    data.replace(record);
                }
            }

            else if (action == 'destroy') {
                for (i = 0; i < length; i++) {
                    record = records[i];

                    record.unjoin(this);
                    data.remove(record);
                }

                this.removed = [];
            }

            this.fireEvent('datachanged');
        }

        
        if (typeof callback == 'function') {
            callback.call(operation.scope || this, records, operation, operation.wasSuccessful());
        }
    },

    
    getNewRecords: function() {
        return this.data.filterBy(this.filterNew).items;
    },

    
    getUpdatedRecords: function() {
        return this.data.filterBy(this.filterDirty).items;
    },

    
    sort: function(sorters, direction) {
        if (Ext.isString(sorters)) {
            var property   = sorters,
                sortToggle = this.sortToggle,
                toggle = Ext.util.Format.toggle;

            if (direction == undefined) {
                sortToggle[property] = toggle(sortToggle[property] || "", "ASC", "DESC");
                direction = sortToggle[property];
            }

            sorters = {
                property : property,
                direction: direction
            };
        }

        this.sorters = this.decodeSorters(sorters);

        if (this.remoteSort) {
            
            this.read();
        } else {
            this.data.sort(this.sorters);

            this.fireEvent('datachanged', this);
        }
    },


    
    filter: function(filters, value) {
        if (Ext.isString(filters)) {
            filters = {
                property: filters,
                value   : value
            };
        }

        this.filters = this.decodeFilters(filters);

        if (this.remoteFilter) {
            
            this.read();
        } else {
            
            this.snapshot = this.snapshot || this.data.clone();

            this.data = this.data.filter(this.filters);

            this.fireEvent('datachanged', this);
        }
    },

    
    clearFilter : function(suppressEvent) {
        if (this.isFiltered()) {
            this.data = this.snapshot.clone();
            delete this.snapshot;

            if (suppressEvent !== true) {
                this.fireEvent('datachanged', this);
            }
        }
    },

    
    isFiltered : function() {
        return !!this.snapshot && this.snapshot != this.data;
    },

    
    filterBy : function(fn, scope) {
        this.snapshot = this.snapshot || this.data.clone();
        this.data = this.queryBy(fn, scope || this);
        this.fireEvent('datachanged', this);
    },

    
    queryBy : function(fn, scope) {
        var data = this.snapshot || this.data;
        return data.filterBy(fn, scope||this);
    },
    
    
    loadData: function(data, append) {
        var model  = this.model,
            length = data.length,
            i, record;

        
        for (i = 0; i < length; i++) {
            record = data[i];

            if (!(record instanceof Ext.data.Model)) {
                data[i] = Ext.ModelMgr.create(record, model);
            }
        }

        this.loadRecords(data, append);
    },

    
    loadRecords: function(records, add) {
        if (!add) {
            this.data.clear();
        }
        
        this.data.addAll(records);
        
        
        for (var i = 0, length = records.length; i < length; i++) {
            records[i].needsAdd = false;
            records[i].join(this);
        }
        
        
        this.suspendEvents();

        if (this.filterOnLoad && !this.remoteFilter) {
            this.filter(this.filters);
        }

        if (this.sortOnLoad && !this.remoteSort) {
            this.sort(this.sorters);
        }

        this.resumeEvents();
        this.fireEvent('datachanged', this, records);
    },

    

    
    loadPage: function(page) {
        this.currentPage = page;

        this.read({
            start: (page - 1) * this.pageSize,
            limit: this.pageSize
        });
    },

    
    nextPage: function() {
        this.loadPage(this.currentPage + 1);
    },

    
    previousPage: function() {
        this.loadPage(this.currentPage - 1);
    },

    
    clearData: function(){
        this.data.each(function(record) {
            record.unjoin();
        });

        this.data.clear();
    },

    
    find : function(property, value, start, anyMatch, caseSensitive) {
        var fn = this.createFilterFn(property, value, anyMatch, caseSensitive);
        return fn ? this.data.findIndexBy(fn, null, start) : -1;
    },

    
    findRecord : function() {
        var index = this.find.apply(this, arguments);
        return index != -1 ? this.getAt(index) : null;
    },

    
    createFilterFn : function(property, value, anyMatch, caseSensitive, exactMatch) {
        if(Ext.isEmpty(value)){
            return false;
        }
        value = this.data.createValueMatcher(value, anyMatch, caseSensitive, exactMatch);
        return function(r) {
            return value.test(r.data[property]);
        };
    },

    
    findExact: function(property, value, start) {
        return this.data.findIndexBy(function(rec){
            return rec.get(property) === value;
        }, this, start);
    },

    
    findBy : function(fn, scope, start) {
        return this.data.findIndexBy(fn, scope, start);
    },

    
    collect : function(dataIndex, allowNull, bypassFilter) {
        var values  = [],
            uniques = {},
            length, value, strValue, data, i;

        if (bypassFilter === true && this.snapshot) {
            data = this.snapshot.items;
        } else {
            data = this.data.items;
        }

        length = data.length;

        for (i = 0; i < length; i++) {
            value = data[i].data[dataIndex];
            strValue = String(value);

            if ((allowNull || !Ext.isEmpty(value)) && !uniques[strValue]) {
                uniques[strValue] = true;
                values[values.length] = value;
            }
        }

        return values;
    },

    
    sum : function(property, start, end) {
        var records = this.data.items,
            value   = 0,
            i;

        start = start || 0;
        end   = (end || end === 0) ? end : records.length - 1;

        for (i = start; i <= end; i++) {
            value += (records[i].data[property] || 0);
        }

        return value;
    },

    
    getCount : function() {
        return this.data.length || 0;
    },

    
    getAt : function(index) {
        return this.data.itemAt(index);
    },

    
    getRange : function(start, end) {
        return this.data.getRange(start, end);
    },

    
    getById : function(id) {
        return (this.snapshot || this.data).find(function(record) {
            return record.getId() === id;
        });
    },

    
    indexOf : function(record) {
        return this.data.indexOf(record);
    },

    
    indexOfId : function(id) {
        return this.data.indexOfKey(id);
    },

    removeAll: function(silent) {
        var items = [];
        this.each(function(rec){
            items.push(rec);
        });
        this.clearData();
        if(this.snapshot){
            this.snapshot.clear();
        }
        
        
        
        if (silent !== true) {
            this.fireEvent('clear', this, items);
        }
    }
});

Ext.data.TreeStore = Ext.extend(Ext.data.AbstractStore, {
    
    clearOnLoad : true,

    
    nodeParameter: 'node',

    
    defaultRootId: 'root',

    constructor: function(config) {
        config = config || {};
        var rootCfg = config.root || {};
        rootCfg.id = rootCfg.id || this.defaultRootId;

        
        var rootNode = new Ext.data.RecordNode(rootCfg);
        this.tree = new Ext.data.Tree(rootNode);
        this.tree.treeStore = this;

        Ext.data.TreeStore.superclass.constructor.call(this, config);

        if (config.root) {
            this.read({
                node: rootNode,
                doPreload: true
            });
        }
    },


    
    getRootNode: function() {
        return this.tree.getRootNode();
    },

    
    getNodeById: function(id) {
        return this.tree.getNodeById(id);
    },


    
    
    
    load: function(options) {
        options = options || {};
        options.params = options.params || {};

        var node = options.node || this.tree.getRootNode(),
            records,
            record,
            reader = this.proxy.reader,
            root;

        if (this.clearOnLoad) {
            while (node.firstChild){
                node.removeChild(node.firstChild);
            }
        }

        if (!options.doPreload) {
            Ext.applyIf(options, {
                node: node
            });
            record = node.getRecord();
            options.params[this.nodeParameter] = record ? record.getId() : 'root';

            return Ext.data.TreeStore.superclass.load.call(this, options);
        } else {
            root = reader.getRoot(node.isRoot ? node.attributes : node.getRecord().raw);
            records = reader.extractData(root, true);
            this.fillNode(node, records);
            return true;
        }
    },

    
    
    fillNode: function(node, records) {
        node.loaded = true;
        var ln = records.length,
            recordNode,
            i = 0,
            raw,
            subStore = node.subStore;

        for (; i < ln; i++) {
            raw = records[i].raw;
            records[i].data.leaf = raw.leaf;
            recordNode = new Ext.data.RecordNode({
                id: records[i].getId(),
                leaf: raw.leaf,
                record: records[i],
                expanded: raw.expanded
            });
            node.appendChild(recordNode);
            if (records[i].doPreload) {
                this.load({
                    node: recordNode,
                    doPreload: true
                });
            }
        }

        
        if (subStore) {
            if (this.clearOnLoad) {
                subStore.removeAll();
            }
            subStore.add.apply(subStore, records);
        }
    },


    onProxyLoad: function(operation) {
        var records = operation.getRecords();

        this.fillNode(operation.node, records);

        this.fireEvent('read', this, operation.node, records, operation.wasSuccessful());
        
        var callback = operation.callback;
        if (typeof callback == 'function') {
            callback.call(operation.scope || this, records, operation, operation.wasSuccessful());
        }
    },


    
    getSubStore: function(node) {
        
        if (node && node.node) {
            node = node.node;
        }
        return node.getSubStore();
    },


    removeAll: function() {
        var rootNode = this.getRootNode();
        rootNode.destroy();
    }
});


Ext.StoreMgr = Ext.apply(new Ext.util.MixedCollection(), {
    

    
    register : function() {
        for (var i = 0, s; (s = arguments[i]); i++) {
            this.add(s);
        }
    },

    
    unregister : function() {
        for (var i = 0, s; (s = arguments[i]); i++) {
            this.remove(this.lookup(s));
        }
    },

    
    lookup : function(id) {
        if (Ext.isArray(id)) {
            var fields = ['field1'], expand = !Ext.isArray(id[0]);
            if(!expand){
                for(var i = 2, len = id[0].length; i <= len; ++i){
                    fields.push('field' + i);
                }
            }
            return new Ext.data.ArrayStore({
                data  : id,
                fields: fields,
                expandData : expand,
                autoDestroy: true,
                autoCreated: true
            });
        }
        return Ext.isObject(id) ? (id.events ? id : Ext.create(id, 'store')) : this.get(id);
    },

    
    getKey : function(o) {
         return o.storeId;
    }
});


Ext.regStore = function(id, store) {
    if (store == undefined) {
        store = id;
    } else {
        store.storeId = id;
    }
    
    if (!(store instanceof Ext.data.Store)) {
        store = new Ext.data.Store(store);
    }
    
    return Ext.StoreMgr.register(store);
};
Ext.data.WriterMgr = new Ext.AbstractManager({
    
});

Ext.data.Tree = Ext.extend(Ext.util.Observable, {
    
    constructor: function(root) {
        this.nodeHash = {};
        
        
        this.root = null;
        
        if (root) {
            this.setRootNode(root);
        }
        
        this.addEvents(
            
            "append",
            
            
            "remove",
            
            
            "move",
            
            
            "insert",
            
            
            "beforeappend",
            
            
            "beforeremove",
            
            
            "beforemove",
            
            
            "beforeinsert"
        );
        
        Ext.data.Tree.superclass.constructor.call(this);        
    },
    
    
    pathSeparator: "/",

    
    proxyNodeEvent : function(){
        return this.fireEvent.apply(this, arguments);
    },

    
    getRootNode : function() {
        return this.root;
    },

    
    setRootNode : function(node) {
        this.root = node;
        node.ownerTree = this;
        node.isRoot = true;
        this.registerNode(node);
        return node;
    },

    
    getNodeById : function(id) {
        return this.nodeHash[id];
    },

    
    registerNode : function(node) {
        this.nodeHash[node.id] = node;
    },

    
    unregisterNode : function(node) {
        delete this.nodeHash[node.id];
    },

    toString : function() {
        return "[Tree"+(this.id?" "+this.id:"")+"]";
    }
});


Ext.data.Node = Ext.extend(Ext.util.Observable, {

    constructor: function(attributes) {
        
        this.attributes = attributes || {};

        this.leaf = this.attributes.leaf;

        
        this.id = this.attributes.id;

        if (!this.id) {
            this.id = Ext.id(null, "xnode-");
            this.attributes.id = this.id;
        }
        
        this.childNodes = [];

        
        this.parentNode = null;

        
        this.firstChild = null;

        
        this.lastChild = null;

        
        this.previousSibling = null;

        
        this.nextSibling = null;

        this.addEvents({
            
            "append" : true,

            
            "remove" : true,

            
            "move" : true,

            
            "insert" : true,

            
            "beforeappend" : true,

            
            "beforeremove" : true,

            
            "beforemove" : true,

             
            "beforeinsert" : true
        });

        this.listeners = this.attributes.listeners;
        Ext.data.Node.superclass.constructor.call(this);
    },

    
    fireEvent : function(evtName) {
        
        if (Ext.data.Node.superclass.fireEvent.apply(this, arguments) === false) {
            return false;
        }

        
        var ot = this.getOwnerTree();
        if (ot) {
            if (ot.proxyNodeEvent.apply(ot, arguments) === false) {
                return false;
            }
        }
        return true;
    },

    
    isLeaf : function() {
        return this.leaf === true;
    },

    
    setFirstChild : function(node) {
        this.firstChild = node;
    },

    
    setLastChild : function(node) {
        this.lastChild = node;
    },


    
    isLast : function() {
       return (!this.parentNode ? true : this.parentNode.lastChild == this);
    },

    
    isFirst : function() {
       return (!this.parentNode ? true : this.parentNode.firstChild == this);
    },

    
    hasChildNodes : function() {
        return !this.isLeaf() && this.childNodes.length > 0;
    },

    
    isExpandable : function() {
        return this.attributes.expandable || this.hasChildNodes();
    },

    
    appendChild : function(node) {
        var multi = false,
            i, len;

        if (Ext.isArray(node)) {
            multi = node;
        } else if (arguments.length > 1) {
            multi = arguments;
        }

        
        if (multi) {
            len = multi.length;

            for (i = 0; i < len; i++) {
                this.appendChild(multi[i]);
            }
        } else {
            if (this.fireEvent("beforeappend", this.ownerTree, this, node) === false) {
                return false;
            }

            var index = this.childNodes.length;
            var oldParent = node.parentNode;

            
            if (oldParent) {
                if (node.fireEvent("beforemove", node.getOwnerTree(), node, oldParent, this, index) === false) {
                    return false;
                }
                oldParent.removeChild(node);
            }

            index = this.childNodes.length;
            if (index === 0) {
                this.setFirstChild(node);
            }

            this.childNodes.push(node);
            node.parentNode = this;
            var ps = this.childNodes[index-1];
            if (ps) {
                node.previousSibling = ps;
                ps.nextSibling = node;
            } else {
                node.previousSibling = null;
            }

            node.nextSibling = null;
            this.setLastChild(node);
            node.setOwnerTree(this.getOwnerTree());
            this.fireEvent("append", this.ownerTree, this, node, index);

            if (oldParent) {
                node.fireEvent("move", this.ownerTree, node, oldParent, this, index);
            }

            return node;
        }
    },

    
    removeChild : function(node, destroy) {
        var index = this.indexOf(node);

        if (index == -1) {
            return false;
        }
        if (this.fireEvent("beforeremove", this.ownerTree, this, node) === false) {
            return false;
        }

        
        this.childNodes.splice(index, 1);

        
        if (node.previousSibling) {
            node.previousSibling.nextSibling = node.nextSibling;
        }
        if (node.nextSibling) {
            node.nextSibling.previousSibling = node.previousSibling;
        }

        
        if (this.firstChild == node) {
            this.setFirstChild(node.nextSibling);
        }
        if (this.lastChild == node) {
            this.setLastChild(node.previousSibling);
        }

        this.fireEvent("remove", this.ownerTree, this, node);
        if (destroy) {
            node.destroy(true);
        } else {
            node.clear();
        }

        return node;
    },

    
    clear : function(destroy) {
        
        this.setOwnerTree(null, destroy);
        this.parentNode = this.previousSibling = this.nextSibling = null;
        if (destroy) {
            this.firstChild = this.lastChild = null;
        }
    },

    
    destroy : function(silent) {
        
        if (silent === true) {
            this.purgeListeners();
            this.clear(true);
            Ext.each(this.childNodes, function(n) {
                n.destroy(true);
            });
            this.childNodes = null;
        } else {
            this.remove(true);
        }
    },

    
    insertBefore : function(node, refNode) {
        if (!refNode) { 
            return this.appendChild(node);
        }
        
        if (node == refNode) {
            return false;
        }

        if (this.fireEvent("beforeinsert", this.ownerTree, this, node, refNode) === false) {
            return false;
        }

        var index     = this.indexOf(refNode),
            oldParent = node.parentNode,
            refIndex  = index;

        
        if (oldParent == this && this.indexOf(node) < index) {
            refIndex--;
        }

        
        if (oldParent) {
            if (node.fireEvent("beforemove", node.getOwnerTree(), node, oldParent, this, index, refNode) === false) {
                return false;
            }
            oldParent.removeChild(node);
        }

        if (refIndex === 0) {
            this.setFirstChild(node);
        }

        this.childNodes.splice(refIndex, 0, node);
        node.parentNode = this;

        var ps = this.childNodes[refIndex-1];

        if (ps) {
            node.previousSibling = ps;
            ps.nextSibling = node;
        } else {
            node.previousSibling = null;
        }

        node.nextSibling = refNode;
        refNode.previousSibling = node;
        node.setOwnerTree(this.getOwnerTree());
        this.fireEvent("insert", this.ownerTree, this, node, refNode);

        if (oldParent) {
            node.fireEvent("move", this.ownerTree, node, oldParent, this, refIndex, refNode);
        }
        return node;
    },

    
    remove : function(destroy) {
        var parentNode = this.parentNode;

        if (parentNode) {
            parentNode.removeChild(this, destroy);
        }
        return this;
    },

    
    removeAll : function(destroy) {
        var cn = this.childNodes,
            n;

        while ((n = cn[0])) {
            this.removeChild(n, destroy);
        }
        return this;
    },

    
    item : function(index) {
        return this.childNodes[index];
    },

    
    replaceChild : function(newChild, oldChild) {
        var s = oldChild ? oldChild.nextSibling : null;

        this.removeChild(oldChild);
        this.insertBefore(newChild, s);
        return oldChild;
    },

    
    indexOf : function(child) {
        return this.childNodes.indexOf(child);
    },

    
    getOwnerTree : function() {
        
        if (!this.ownerTree) {
            var p = this;

            while (p) {
                if (p.ownerTree) {
                    this.ownerTree = p.ownerTree;
                    break;
                }
                p = p.parentNode;
            }
        }

        return this.ownerTree;
    },

    
    getDepth : function() {
        var depth = 0,
            p     = this;

        while (p.parentNode) {
            ++depth;
            p = p.parentNode;
        }

        return depth;
    },

    
    setOwnerTree : function(tree, destroy) {
        
        if (tree != this.ownerTree) {
            if (this.ownerTree) {
                this.ownerTree.unregisterNode(this);
            }
            this.ownerTree = tree;

            
            if (destroy !== true) {
                Ext.each(this.childNodes, function(n) {
                    n.setOwnerTree(tree);
                });
            }
            if (tree) {
                tree.registerNode(this);
            }
        }
    },

    
    setId: function(id) {
        if (id !== this.id) {
            var t = this.ownerTree;
            if (t) {
                t.unregisterNode(this);
            }
            this.id = this.attributes.id = id;
            if (t) {
                t.registerNode(this);
            }
            this.onIdChange(id);
        }
    },

    
    onIdChange: Ext.emptyFn,

    
    getPath : function(attr) {
        attr = attr || "id";
        var p = this.parentNode,
            b = [this.attributes[attr]];

        while (p) {
            b.unshift(p.attributes[attr]);
            p = p.parentNode;
        }

        var sep = this.getOwnerTree().pathSeparator;
        return sep + b.join(sep);
    },

    
    bubble : function(fn, scope, args) {
        var p = this;
        while (p) {
            if (fn.apply(scope || p, args || [p]) === false) {
                break;
            }
            p = p.parentNode;
        }
    },

    
    cascade : function(fn, scope, args) {
        if (fn.apply(scope || this, args || [this]) !== false) {
            var childNodes = this.childNodes,
                length     = childNodes.length,
                i;

            for (i = 0; i < length; i++) {
                childNodes[i].cascade(fn, scope, args);
            }
        }
    },

    
    eachChild : function(fn, scope, args) {
        var childNodes = this.childNodes,
            length     = childNodes.length,
            i;

        for (i = 0; i < length; i++) {
            if (fn.apply(scope || this, args || [childNodes[i]]) === false) {
                break;
            }
        }
    },

    
    findChild : function(attribute, value, deep) {
        return this.findChildBy(function(){
            return this.attributes[attribute] == value;
        }, null, deep);
    },

    
    findChildBy : function(fn, scope, deep) {
        var cs = this.childNodes,
            len = cs.length,
            i = 0,
            n,
            res;

        for(; i < len; i++){
            n = cs[i];
            if(fn.call(scope || n, n) === true){
                return n;
            }else if (deep){
                res = n.findChildBy(fn, scope, deep);
                if(res != null){
                    return res;
                }
            }

        }

        return null;
    },

    
    sort : function(fn, scope) {
        var cs  = this.childNodes,
            len = cs.length,
            i, n;

        if (len > 0) {
            var sortFn = scope ? function(){return fn.apply(scope, arguments);} : fn;
            cs.sort(sortFn);
            for (i = 0; i < len; i++) {
                n = cs[i];
                n.previousSibling = cs[i-1];
                n.nextSibling = cs[i+1];

                if (i === 0){
                    this.setFirstChild(n);
                }
                if (i == len - 1) {
                    this.setLastChild(n);
                }
            }
        }
    },

    
    contains : function(node) {
        return node.isAncestor(this);
    },

    
    isAncestor : function(node) {
        var p = this.parentNode;
        while (p) {
            if (p == node) {
                return true;
            }
            p = p.parentNode;
        }
        return false;
    },

    toString : function() {
        return "[Node" + (this.id ? " " + this.id : "") + "]";
    }
});


Ext.data.RecordNode = Ext.extend(Ext.data.Node, {
    constructor: function(config) {
        config = config || {};
        if (config.record) {
            
            config.record.node = this;
        }
        Ext.data.RecordNode.superclass.constructor.call(this, config);
    },

    getChildRecords: function() {
        var cn = this.childNodes,
            ln = cn.length,
            i = 0,
            rs = [],
            r;

        for (; i < ln; i++) {
            r = cn[i].attributes.record;
            
            
            
            
            r.data.leaf = cn[i].leaf;
            rs.push(r);
        }
        return rs;
    },

    getRecord: function() {
        return this.attributes.record;
    },


    getSubStore: function() {

        
        if (this.leaf) {
            throw "Attempted to get a substore of a leaf node.";
        }
        

        var treeStore = this.getOwnerTree().treeStore;
        if (!this.subStore) {
            this.subStore = new Ext.data.Store({
                model: treeStore.model
            });
            
            
            
            var children = this.getChildRecords();
            this.subStore.add.apply(this.subStore, children);
        }

        if (!this.loaded) {
            treeStore.load({
                node: this
            });
        }
        return this.subStore;
    },

    destroy : function(silent) {
        if (this.subStore) {
            this.subStore.destroyStore();
        }
        var attr = this.attributes;
        if (attr.record) {
            delete attr.record.node;
            delete attr.record;
        }

        return Ext.data.RecordNode.superclass.destroy.call(this, silent);
    }
});

Ext.data.Proxy = Ext.extend(Ext.util.Observable, {
    
    batchOrder: 'create,update,destroy',
    
    
    defaultReaderType: 'json',
    
    
    defaultWriterType: 'json',
    
    
    setModel: function(model, setOnStore) {
        this.model = Ext.ModelMgr.getModel(model);
        
        if (setOnStore && this.store) {
            this.store.setModel(this.model);
        }
    },
    
    
    getModel: function() {
        return this.model;
    },
    
    
    setReader: function(reader) {
        if (reader == undefined || typeof reader == 'string') {
            reader = {
                type: reader
            };
        }

        if (!(reader instanceof Ext.data.Reader)) {
            Ext.applyIf(reader, {
                proxy: this,
                model: this.model,
                type : this.defaultReaderType
            });

            reader = Ext.data.ReaderMgr.create(reader);
        }
        
        this.reader = reader;
        
        return this.reader;
    },
    
    
    getReader: function() {
        return this.reader;
    },
    
    
    setWriter: function(writer) {
        if (writer == undefined || typeof writer == 'string') {
            writer = {
                type: writer
            };
        }

        if (!(writer instanceof Ext.data.Writer)) {
            Ext.applyIf(writer, {
                model: this.model,
                type : this.defaultWriterType
            });

            writer = Ext.data.WriterMgr.create(writer);
        }
        
        this.writer = writer;
        
        return this.writer;
    },
    
    
    getWriter: function() {
        return this.writer;
    },
    
    
    create: Ext.emptyFn,
    
    
    read: Ext.emptyFn,
    
    
    update: Ext.emptyFn,
    
    
    destroy: Ext.emptyFn,
    
    
    batch: function(operations, listeners) {
        var batch = new Ext.data.Batch({
            proxy: this,
            listeners: listeners || {}
        });
        
        Ext.each(this.batchOrder.split(','), function(action) {
            if (operations[action]) {
                batch.add(new Ext.data.Operation({
                    action : action, 
                    records: operations[action]
                }));
            }
        }, this);
        
        batch.start();
        
        return batch;
    }
});


Ext.data.DataProxy = Ext.data.Proxy;

Ext.data.ProxyMgr.registerType('proxy', Ext.data.Proxy);

Ext.data.ServerProxy = Ext.extend(Ext.data.Proxy, {
    
    
    
    noCache : true,
    
    
    cacheString: "_dc",
    
    
    timeout : 30000,
    
    
    constructor: function(config) {
        Ext.data.ServerProxy.superclass.constructor.call(this, config);
        
        
        this.extraParams = config.extraParams || {};
        
        
        this.nocache = this.noCache;
        
        
        this.setReader(this.reader);
        this.setWriter(this.writer);
    },
    
    
    setModel: function(model){
        Ext.data.ServerProxy.superclass.setModel.call(this, model);
        model = this.model;
        
        var reader = this.reader;
        if(reader && !reader.model){
            this.reader.setModel(model);
        }
        if(this.writer){
            this.writer.model = model;
        }
    },
    
    
    create: function() {
        return this.doRequest.apply(this, arguments);
    },
    
    read: function() {
        return this.doRequest.apply(this, arguments);
    },
    
    update: function() {
        return this.doRequest.apply(this, arguments);
    },
    
    destroy: function() {
        return this.doRequest.apply(this, arguments);
    },
    
    
    buildRequest: function(operation) {
        var params = Ext.applyIf(operation.params || {}, this.extraParams || {});
        
        
        params = Ext.applyIf(params, this.getParams(params));
        
        var request = new Ext.data.Request({
            params  : params,
            action  : operation.action,
            records : operation.records,
            
            operation : operation
        });
        
        request.url = this.buildUrl(request);
        
        
        operation.request = request;
        
        return request;
    },
    
    
    getParams: function(params) {
        var options = ['start', 'limit', 'group', 'filters', 'sorters'],
            o = {},
            len = options.length,
            i, opt;
            
        for(i = 0; i < len; ++i){
            opt = options[i];
            if (params[opt] !== undefined) {
                o[opt] = params[opt];
            }
        }
        return o;
    },
    
    
    buildUrl: function(request) {
        var url = request.url || this.url;
        
        if (!url) {
            throw "You are using a ServerProxy but have not supplied it with a url. ";
        }
        
        if (this.noCache) {
            url = Ext.urlAppend(url, Ext.util.Format.format("{0}={1}", this.cacheString, (new Date().getTime())));
        }
        
        return url;
    },
    
    
    doRequest: function(operation, callback, scope) {
        throw new Error("The doRequest function has not been implemented on your Ext.data.ServerProxy subclass. See src/data/ServerProxy.js for details");
    },
    
    
    afterRequest: Ext.emptyFn,
    
    onDestroy: function() {
        Ext.destroy(this.reader, this.writer);
        
        Ext.data.ServerProxy.superclass.destroy.apply(this, arguments);
    }
});

Ext.data.AjaxProxy = Ext.extend(Ext.data.ServerProxy, {
    
    actionMethods: {
        create : 'POST',
        read   : 'GET',
        update : 'POST',
        destroy: 'POST'
    },
    
    
    
    constructor: function() {
        this.addEvents(
            
            'exception'
        );
        Ext.data.AjaxProxy.superclass.constructor.apply(this, arguments);    
    },
    
    
    doRequest: function(operation, callback, scope) {
        var writer  = this.getWriter(),
            request = this.buildRequest(operation, callback, scope);
            
        if (operation.allowWrite()) {
            request = writer.write(request);
        }
        
        Ext.apply(request, {
            headers : this.headers,
            timeout : this.timeout,
            scope   : this,
            callback: this.createRequestCallback(request, operation, callback, scope),
            method  : this.getMethod(request)
        });
        
        Ext.Ajax.request(request);
        
        return request;
    },
    
    
    getMethod: function(request) {
        return this.actionMethods[request.action];
    },
    
    
    createRequestCallback: function(request, operation, callback, scope) {
        var me = this;
        
        return function(options, success, response) {
            if (success === true) {
                var reader = me.getReader(),
                    result = reader.read(response);

                
                Ext.apply(operation, {
                    response : response,
                    resultSet: result
                });

                operation.markCompleted();
            } else {
                me.fireEvent('exception', this, response, operation);
                
                
                operation.markException();                
            }
            
            
            if (typeof callback == 'function') {
                callback.call(scope || me, operation);
            }
            
            me.afterRequest(request, true);
        };
    }
});

Ext.data.ProxyMgr.registerType('ajax', Ext.data.AjaxProxy);


Ext.data.HttpProxy = Ext.data.AjaxProxy;

Ext.data.RestProxy = Ext.extend(Ext.data.AjaxProxy, {
    
    actionMethods: {
        create : 'POST',
        read   : 'GET',
        update : 'PUT',
        destroy: 'DELETE'
    },
    
    api: {
        create : 'create',
        read   : 'read',
        update : 'update',
        destroy: 'destroy'
    }
});

Ext.data.ProxyMgr.registerType('rest', Ext.data.RestProxy);
Ext.apply(Ext, {
    
    getHead : function() {
        var head;
        
        return function() {
            if (head == undefined) {
                head = Ext.get(document.getElementsByTagName("head")[0]);
            }
            
            return head;
        };
    }()
});


Ext.data.ScriptTagProxy = Ext.extend(Ext.data.ServerProxy, {
    defaultWriterType: 'base',
    
    
    callbackParam : "callback",
    
    
    scriptIdPrefix: 'stcScript',
    
    
    callbackPrefix: 'stcCallback',
    
    
    recordParam: 'records',
    
    
    lastRequest: undefined,
    
    constructor: function(){
        this.addEvents(
            
            'exception'
        );
        Ext.data.ScriptTagProxy.superclass.constructor.apply(this, arguments);    
    },

    
    doRequest: function(operation, callback, scope) {
        
        var format     = Ext.util.Format.format,
            transId    = ++Ext.data.ScriptTagProxy.TRANS_ID,
            scriptId   = format("{0}{1}", this.scriptIdPrefix, transId),
            stCallback = format("{0}{1}", this.callbackPrefix, transId);
        
        var writer  = this.getWriter(),
            request = this.buildRequest(operation),
            
            url     = Ext.urlAppend(request.url, format("{0}={1}", this.callbackParam, stCallback));
            
        if(operation.allowWrite()){
            request = writer.write(request);
        }
        
        
        Ext.apply(request, {
            url       : url,
            transId   : transId,
            scriptId  : scriptId,
            stCallback: stCallback
        });
        
        
        request.timeoutId = Ext.defer(this.createTimeoutHandler, this.timeout, this, [request, operation]);
        
        
        window[stCallback] = this.createRequestCallback(request, operation, callback, scope);
        
        
        var script = document.createElement("script");
        script.setAttribute("src", url);
        script.setAttribute("type", "text/javascript");
        script.setAttribute("id", scriptId);
        
        Ext.getHead().appendChild(script);
        operation.markStarted();
        
        this.lastRequest = request;
        
        return request;
    },
    
    
    createRequestCallback: function(request, operation, callback, scope) {
        var me = this;
        
        return function(response) {
            var reader = me.getReader(),
                result = reader.read(response);
            
            
            Ext.apply(operation, {
                response : response,
                resultSet: result
            });
            
            operation.markCompleted();
            
            
            if (typeof callback == 'function') {
                callback.call(scope || me, operation);
            }
            
            me.afterRequest(request, true);
        };
    },
    
    
    afterRequest: function() {
        var cleanup = function(functionName) {
            return function() {
                window[functionName] = undefined;
                
                try {
                    delete window[functionName];
                } catch(e) {}
            };
        };
        
        return function(request, isLoaded) {
            Ext.get(request.scriptId).remove();
            clearTimeout(request.timeoutId);
            
            var callbackName = request.stCallback;
            
            if (isLoaded) {
                cleanup(callbackName)();
                this.lastRequest.completed = true;
            } else {
                
                window[callbackName] = cleanup(callbackName);
            }
        };
    }(),
    
    
    buildUrl: function(request) {
        var url = Ext.data.ScriptTagProxy.superclass.buildUrl.call(this, request);
        
        url = Ext.urlAppend(url, Ext.urlEncode(request.params));
        
        
        var records = request.records;
        
        if (Ext.isArray(records) && records.length > 0) {
            url = Ext.urlAppend(url, Ext.util.Format.format("{0}={1}", this.recordParam, this.encodeRecords(records)));
        }
        
        return url;
    },
    
    
    destroy: function() {
        this.abort();
        
        Ext.data.ScriptTagProxy.superclass.destroy.apply(this, arguments);
    },
        
    
    isLoading : function(){
        var lastRequest = this.lastRequest;
        
        return (lastRequest != undefined && !lastRequest.completed);
    },
    
    
    abort: function() {
        if (this.isLoading()) {
            this.afterRequest(this.lastRequest);
        }
    },
        
    
    encodeRecords: function(records) {
        var encoded = "";
        
        for (var i = 0, length = records.length; i < length; i++) {
            encoded += Ext.urlEncode(records[i].data);
        }
        
        return encoded;
    },
    
    
    createTimeoutHandler: function(request, operation) {
        this.afterRequest(request, false);

        this.fireEvent('exception', this, request, operation);
        
        if (typeof request.callback == 'function') {
            request.callback.call(request.scope || window, null, request.options, false);
        }        
    }
});

Ext.data.ScriptTagProxy.TRANS_ID = 1000;

Ext.data.ProxyMgr.registerType('scripttag', Ext.data.ScriptTagProxy);

Ext.data.ClientProxy = Ext.extend(Ext.data.Proxy, {
    
    clear: function() {
        throw new Error("The Ext.data.ClientProxy subclass that you are using has not defined a 'clear' function. See src/data/ClientProxy.js for details.");
    }
});

Ext.data.MemoryProxy = Ext.extend(Ext.data.ClientProxy, {
    
    
    constructor: function(config) {
        Ext.data.MemoryProxy.superclass.constructor.call(this, config);
        
        
        this.setReader(this.reader);
    },
    
    
    read: function(operation, callback, scope) {
        var reader = this.getReader(),
            result = reader.read(this.data);

        Ext.apply(operation, {
            resultSet: result
        });
        
        operation.markCompleted();
        
        if (typeof callback == 'function') {
            callback.call(scope || this, operation);
        }
    },
    
    clear: Ext.emptyFn
});

Ext.data.ProxyMgr.registerType('memory', Ext.data.MemoryProxy);

Ext.data.WebStorageProxy = Ext.extend(Ext.data.ClientProxy, {
    
    id: undefined,

    
    constructor: function(config) {
        Ext.data.WebStorageProxy.superclass.constructor.call(this, config);
        
        
        this.cache = {};

        if (this.getStorageObject() == undefined) {
            throw "Local Storage is not supported in this browser, please use another type of data proxy";
        }

        
        this.id = this.id || (this.store ? this.store.storeId : undefined);

        if (this.id == undefined) {
            throw "No unique id was provided to the local storage proxy. See Ext.data.LocalStorageProxy documentation for details";
        }

        this.initialize();
    },

    
    create: function(operation, callback, scope) {
        var records = operation.records,
            length  = records.length,
            ids     = this.getIds(),
            id, record, i;
        
        operation.markStarted();

        for (i = 0; i < length; i++) {
            record = records[i];

            if (record.phantom) {
                record.phantom = false;
                id = this.getNextId();
            } else {
                id = record.getId();
            }

            this.setRecord(record, id);
            ids.push(id);
        }

        this.setIds(ids);

        operation.markCompleted();
        operation.markSuccessful();

        if (typeof callback == 'function') {
            callback.call(scope || this, operation);
        }
    },

    
    read: function(operation, callback, scope) {
        

        var records = [],
            ids     = this.getIds(),
            length  = ids.length,
            i, recordData, record;
        
        
        if (operation.id) {
            record = this.getRecord(operation.id);
            
            if (record) {
                records.push(record);
                operation.markSuccessful();
            }
        } else {
            for (i = 0; i < length; i++) {
                records.push(this.getRecord(ids[i]));
            }
            operation.markSuccessful();
        }
        
        operation.markCompleted();

        operation.resultSet = new Ext.data.ResultSet({
            records: records,
            total  : records.length,
            loaded : true
        });

        if (typeof callback == 'function') {
            callback.call(scope || this, operation);
        }
    },

    
    update: function(operation, callback, scope) {
        var records = operation.records,
            length  = records.length,
            ids     = this.getIds(),
            record, id, i;

        operation.markStarted();

        for (i = 0; i < length; i++) {
            record = records[i];
            this.setRecord(record);
            
            
            
            id = record.getId();
            if (ids.indexOf(id) == -1) {
                ids.push(id);
            }
        }
        this.setIds(ids);

        operation.markCompleted();
        operation.markSuccessful();

        if (typeof callback == 'function') {
            callback.call(scope || this, operation);
        }
    },

    
    destroy: function(operation, callback, scope) {
        var records = operation.records,
            length  = records.length,
            ids     = this.getIds(),

            
            newIds  = [].concat(ids),
            i;

        for (i = 0; i < length; i++) {
            newIds.remove(records[i].getId());
            this.removeRecord(records[i], false);
        }

        this.setIds(newIds);

        if (typeof callback == 'function') {
            callback.call(scope || this, operation);
        }
    },

    
    getRecord: function(id) {
        if (this.cache[id] == undefined) {
            var rawData = Ext.decode(this.getStorageObject().getItem(this.getRecordKey(id))),
                data    = {},
                Model   = this.model,
                fields  = Model.prototype.fields.items,
                length  = fields.length,
                i, field, name, record;

            for (i = 0; i < length; i++) {
                field = fields[i];
                name  = field.name;

                if (typeof field.decode == 'function') {
                    data[name] = field.decode(rawData[name]);
                } else {
                    data[name] = rawData[name];
                }
            }

            record = new Model(data);
            record.phantom = false;

            this.cache[id] = record;
        }
        
        return this.cache[id];
    },

    
    setRecord: function(record, id) {
        if (id) {
            record.setId(id);
        } else {
            id = record.getId();
        }

        var rawData = record.data,
            data    = {},
            model   = this.model,
            fields  = model.prototype.fields.items,
            length  = fields.length,
            i, field, name;

        for (i = 0; i < length; i++) {
            field = fields[i];
            name  = field.name;

            if (typeof field.encode == 'function') {
                data[name] = field.encode(rawData[name], record);
            } else {
                data[name] = rawData[name];
            }
        }

        var obj = this.getStorageObject(),
            key = this.getRecordKey(id);
        
        
        this.cache[id] = record;
        
        
        obj.removeItem(key);
        obj.setItem(key, Ext.encode(data));
    },

    
    removeRecord: function(id, updateIds) {
        if (id instanceof Ext.data.Model) {
            id = id.getId();
        }

        if (updateIds !== false) {
            var ids = this.getIds();
            ids.remove(id);
            this.setIds(ids);
        }

        this.getStorageObject().removeItem(this.getRecordKey(id));
    },

    
    getRecordKey: function(id) {
        if (id instanceof Ext.data.Model) {
            id = id.getId();
        }

        return Ext.util.Format.format("{0}-{1}", this.id, id);
    },

    
    getRecordCounterKey: function() {
        return Ext.util.Format.format("{0}-counter", this.id);
    },

    
    getIds: function() {
        var ids    = (this.getStorageObject().getItem(this.id) || "").split(","),
            length = ids.length,
            i;

        if (length == 1 && ids[0] == "") {
            ids = [];
        } else {
            for (i = 0; i < length; i++) {
                ids[i] = parseInt(ids[i], 10);
            }
        }

        return ids;
    },

    
    setIds: function(ids) {
        var obj = this.getStorageObject(),
            str = ids.join(",");

        if (Ext.isEmpty(str)) {
            obj.removeItem(this.id);
        } else {
            obj.setItem(this.id,  str);
        }
    },

    
    getNextId: function() {
        var obj  = this.getStorageObject(),
            key  = this.getRecordCounterKey(),
            last = obj[key],
            ids, id;
        
        if (last == undefined) {
            ids = this.getIds();
            last = ids[ids.length - 1] || 0;
        }
        
        id = parseInt(last, 10) + 1;
        obj.setItem(key, id);
        
        return id;
    },

    
    initialize: function() {
        var storageObject = this.getStorageObject();
        storageObject.setItem(this.id, storageObject.getItem(this.id) || "");
    },

    
    clear: function() {
        var obj = this.getStorageObject(),
            ids = this.getIds(),
            len = ids.length,
            i;

        
        for (i = 0; i < len; i++) {
            this.removeRecord(ids[i]);
        }

        
        obj.removeItem(this.getRecordCounterKey());
        obj.removeItem(this.id);
    },

    
    getStorageObject: function() {
        throw new Error("The getStorageObject function has not been defined in your Ext.data.WebStorageProxy subclass");
    }
});

Ext.data.LocalStorageProxy = Ext.extend(Ext.data.WebStorageProxy, {
    
    getStorageObject: function() {
        return window.localStorage;
    }
});

Ext.data.ProxyMgr.registerType('localstorage', Ext.data.LocalStorageProxy);

Ext.data.SessionStorageProxy = Ext.extend(Ext.data.WebStorageProxy, {
    
    getStorageObject: function() {
        return window.sessionStorage;
    }
});

Ext.data.ProxyMgr.registerType('sessionstorage', Ext.data.SessionStorageProxy);

Ext.data.Reader = Ext.extend(Object, {
    
    idProperty: 'id',

    
    totalProperty: 'total',

    
    successProperty: 'success',

    
    root: '',
    
    
    implicitIncludes: true,

    constructor: function(config) {
        Ext.apply(this, config || {});

        this.model = Ext.ModelMgr.getModel(config.model);
        if (this.model) {
            this.buildExtractors();
        }
    },

    
    setModel: function(model, setOnProxy) {
        this.model = Ext.ModelMgr.getModel(model);
        this.buildExtractors(true);
        
        if (setOnProxy && this.proxy) {
            this.proxy.setModel(this.model, true);
        }
    },

    
    read: function(response) {
        var data = response;

        if (response.responseText) {
            data = this.getResponseData(response);
        }

        return this.readRecords(data);
    },

    
    readRecords: function(data) {
        
        this.rawData = data;

        data = this.getData(data);

        var root    = this.getRoot(data),
            total   = root.length,
            success = true,
            value, records, recordCount;

        if (this.totalProperty) {
            value = parseInt(this.getTotal(data), 10);
            if (!isNaN(value)) {
                total = value;
            }
        }

        if (this.successProperty) {
            value = this.getSuccess(data);
            if (value === false || value === 'false') {
                success = false;
            }
        }

        records = this.extractData(root, true);
        recordCount = records.length;

        return new Ext.data.ResultSet({
            total  : total || recordCount,
            count  : recordCount,
            records: records,
            success: success
        });
    },

    
    extractData : function(root, returnRecords) {
        var values  = [],
            records = [],
            Model   = this.model,
            length  = root.length,
            idProp  = this.idProperty,
            node, id, record, i;

        for (i = 0; i < length; i++) {
            node   = root[i];
            values = this.extractValues(node);
            id     = this.getId(node);

            if (returnRecords === true) {
                record = new Model(values, id);
                record.raw = node;
                records.push(record);
                
                if (this.implicitIncludes) {
                    this.readAssociated(record, node);
                }
            } else {
                values[idProp] = id;
                records.push(values);
            }
        }

        return records;
    },
    
    
    readAssociated: function(record, data) {
        var associations = record.associations.items,
            length       = associations.length,
            association, associationName, associationData, proxy, reader, store, i;
        
        for (i = 0; i < length; i++) {
            association     = associations[i];
            associationName = association.name;
            associationData = data[association.associationKey || associationName];
            
            if (associationData) {
                proxy = association.associatedModel.getProxy();
                
                
                if (proxy) {
                    reader = proxy.getReader();
                }
                
                
                if (!reader) {
                    reader = new this.constructor({
                        model: association.associatedName
                    });
                    
                    if (association.type == 'hasMany') {
                        store = record[associationName]();
                        
                        store.add.apply(store, reader.read(associationData).records);
                    } else if (association.type == 'belongsTo') {
                        record[associationName + "BelongsToInstance"] = reader.read([associationData]).records[0];
                    }
                }
            }
        }
    },

    
    extractValues: function(data) {
        var fields = this.model.prototype.fields.items,
            length = fields.length,
            output = {},
            field, value, i;

        for (i = 0; i < length; i++) {
            field = fields[i];
            value = this.extractorFunctions[i](data) || field.defaultValue;

            output[field.name] = value;
        }

        return output;
    },

    
    getData: function(data) {
        return data;
    },

    
    getRoot: function(data) {
        return data;
    },

    
    getResponseData: function(response) {
        throw new Error("getResponseData must be implemented in the Ext.data.Reader subclass");
    },

    
    onMetaChange : function(meta) {
        var fields = meta.fields,
            newModel;
        
        Ext.apply(this, meta);
        
        if (fields) {
            newModel = Ext.regModel("JsonReader-Model" + Ext.id(), {fields: fields});
            this.setModel(newModel, true);
        } else {
            this.buildExtractors(true);
        }
    },

    
    buildExtractors: function(force) {
        if (force === true) {
            delete this.extractorFunctions;
        }
        
        if (this.extractorFunctions) {
            return;
        }

        var idProp      = this.id || this.idProperty,
            totalProp   = this.totalProperty,
            successProp = this.successProperty,
            messageProp = this.messageProperty;

        
        if (totalProp) {
            this.getTotal = this.createAccessor(totalProp);
        }

        if (successProp) {
            this.getSuccess = this.createAccessor(successProp);
        }

        if (messageProp) {
            this.getMessage = this.createAccessor(messageProp);
        }

        if (idProp) {
            var accessor = this.createAccessor(idProp);

            this.getId = function(record) {
                var id = accessor(record);

                return (id == undefined || id == '') ? null : id;
            };
        } else {
            this.getId = function() {
                return null;
            };
        }
        this.buildFieldExtractors();
    },

    
    buildFieldExtractors: function() {
        
        var fields = this.model.prototype.fields.items,
            ln = fields.length,
            i  = 0,
            extractorFunctions = [],
            field, map;

        for (; i < ln; i++) {
            field = fields[i];
            map   = (field.mapping !== undefined && field.mapping !== null) ? field.mapping : field.name;

            extractorFunctions.push(this.createAccessor(map));
        }

        this.extractorFunctions = extractorFunctions;
    }
});

Ext.data.Writer = Ext.extend(Object, {

    constructor: function(config) {
        Ext.apply(this, config);
    },

    
    write: function(request) {
        var operation = request.operation,
            records   = operation.records || [],
            ln        = records.length,
            i         = 0,
            data      = [];

        for (; i < ln; i++) {
            data.push(this.getRecordData(records[i]));
        }
        return this.writeRecords(request, data);
    },

    
    getRecordData: function(record) {
        return record.data;
    }
});

Ext.data.WriterMgr.registerType('base', Ext.data.Writer);


Ext.data.JsonWriter = Ext.extend(Ext.data.Writer, {
    
    root: 'records',
    
    
    encode: false,
    
    
    writeRecords: function(request, data) {
        if (this.encode === true) {
            data = Ext.encode(data);
        }
        
        request.jsonData = request.jsonData || {};
        request.jsonData[this.root] = data;
        
        return request;
    }
});

Ext.data.WriterMgr.registerType('json', Ext.data.JsonWriter);


Ext.data.JsonReader = Ext.extend(Ext.data.Reader, {
    
    
    readRecords: function(data) {
        
        if (data.metaData) {
            this.onMetaChange(data.metaData);
        }

        
        this.jsonData = data;

        return Ext.data.JsonReader.superclass.readRecords.call(this, data);
    },

    
    getResponseData: function(response) {
        try {
            var data = Ext.decode(response.responseText);
        }
        catch (ex) {
            throw 'Ext.data.JsonReader.getResponseData: Unable to parse JSON returned by Server.';
        }

        if (!data) {
            throw 'Ext.data.JsonReader.getResponseData: JSON object not found';
        }

        return data;
    },

    
    buildExtractors : function() {
        Ext.data.JsonReader.superclass.buildExtractors.apply(this, arguments);

        if (this.root) {
            this.getRoot = this.createAccessor(this.root);
        } else {
            this.getRoot = function(root) {
                return root;
            };
        }
    },

    
    createAccessor: function() {
        var re = /[\[\.]/;

        return function(expr) {
            if (Ext.isEmpty(expr)) {
                return Ext.emptyFn;
            }
            if (Ext.isFunction(expr)) {
                return expr;
            }
            var i = String(expr).search(re);
            if (i >= 0) {
                return new Function('obj', 'return obj' + (i > 0 ? '.' : '') + expr);
            }
            return function(obj) {
                return obj[expr];
            };
        };
    }()
});

Ext.data.ReaderMgr.registerType('json', Ext.data.JsonReader);
Ext.data.TreeReader = Ext.extend(Ext.data.JsonReader, {
    extractData : function(root, returnRecords) {
        var records = Ext.data.TreeReader.superclass.extractData.call(this, root, returnRecords),
            ln = records.length,
            i  = 0,
            record;

        if (returnRecords) {
            for (; i < ln; i++) {
                record = records[i];
                record.doPreload = !!this.getRoot(record.raw);
            }
        }
        return records;
    }
});
Ext.data.ReaderMgr.registerType('tree', Ext.data.TreeReader);

Ext.data.ArrayReader = Ext.extend(Ext.data.JsonReader, {

    
    buildExtractors: function() {
        Ext.data.ArrayReader.superclass.buildExtractors.apply(this, arguments);
        
        var fields = this.model.prototype.fields.items,
            length = fields.length,
            extractorFunctions = [],
            i;
        
        for (i = 0; i < length; i++) {
            extractorFunctions.push(function(index) {
                return function(data) {
                    return data[index];
                };
            }(fields[i].mapping || i));
        }
        
        this.extractorFunctions = extractorFunctions;
    }
});

Ext.data.ReaderMgr.registerType('array', Ext.data.ArrayReader);


Ext.data.ArrayStore = Ext.extend(Ext.data.Store, {
    
    constructor: function(config) {
        config = config || {};

        Ext.applyIf(config, {
            proxy: {
                type: 'memory',
                reader: 'array'
            }
        });

        Ext.data.ArrayStore.superclass.constructor.call(this, config);
    },

    loadData: function(data, append) {
        if (this.expandData === true) {
            var r = [],
                i = 0,
                ln = data.length;

            for (; i < ln; i++) {
                r[r.length] = [data[i]];
            }
            
            data = r;
        }

        Ext.data.ArrayStore.superclass.loadData.call(this, data, append);
    }
});
Ext.reg('arraystore', Ext.data.ArrayStore);


Ext.data.SimpleStore = Ext.data.ArrayStore;
Ext.reg('simplestore', Ext.data.SimpleStore);

Ext.data.JsonStore = Ext.extend(Ext.data.Store, {
    
    constructor: function(config) {
        config = config || {};
              
        Ext.applyIf(config, {
            proxy: {
                type  : 'ajax',
                reader: 'json',
                writer: 'json'
            }
        });
        
        Ext.data.JsonStore.superclass.constructor.call(this, config);
    }
});

Ext.reg('jsonstore', Ext.data.JsonStore);

Ext.data.JsonPStore = Ext.extend(Ext.data.Store, {
    
    constructor: function(config) {
        Ext.data.JsonPStore.superclass.constructor.call(this, Ext.apply(config, {
            reader: new Ext.data.JsonReader(config),
            proxy : new Ext.data.ScriptTagProxy(config)
        }));
    }
});

Ext.reg('jsonpstore', Ext.data.JsonPStore);


Ext.data.XmlWriter = Ext.extend(Ext.data.Writer, {
    
    documentRoot: 'xmlData',

    
    header: '',

    
    record: 'record',

    
    writeRecords: function(request, data) {
        var tpl = this.buildTpl(request, data);

        request.xmlData = tpl.apply(data);

        return request;
    },

    buildTpl: function(request, data) {
        if (this.tpl) {
            return this.tpl;
        }

        var tpl = [],
            root = this.documentRoot,
            record = this.record,
            first,
            key;

        if (this.header) {
            tpl.push(this.header);
        }
        tpl.push('<', root, '>');
        if (data.length > 0) {
            tpl.push('<tpl for="."><', record, '>');
            first = data[0];
            for (key in first) {
                if (first.hasOwnProperty(key)) {
                    tpl.push('<', key, '>{', key, '}</', key, '>');
                }
            }
            tpl.push('</', record, '></tpl>');
        }
        tpl.push('</', root, '>');
        this.tpl = new Ext.XTemplate(tpl.join(''));
        return this.tpl;
    }
});

Ext.data.WriterMgr.registerType('xml', Ext.data.XmlWriter);

Ext.data.XmlReader = Ext.extend(Ext.data.Reader, {
    

    

    createAccessor: function() {
        var selectValue = function(key, root, defaultValue){
            var node = Ext.DomQuery.selectNode(key, root),
                val;
            if(node && node.firstChild){
                val = node.firstChild.nodeValue;
            }
            return Ext.isEmpty(val) ? defaultValue : val;
        };

        return function(key) {
            var fn;

            if (key == this.totalProperty) {
                fn = function(root, defaultValue) {
                    var value = selectValue(key, root, defaultValue);
                    return parseFloat(value);
                };
            }

            else if (key == this.successProperty) {
                fn = function(root, defaultValue) {
                    var value = selectValue(key, root, true);
                    return (value !== false && value !== 'false');
                };
            }

            else {
                fn = function(root, defaultValue) {
                    return selectValue(key, root, defaultValue);
                };
            }

            return fn;
        };
    }(),

    
    getResponseData: function(response) {
        var xml = response.responseXML;

        if (!xml) {
            throw {message: 'Ext.data.XmlReader.read: XML data not found'};
        }

        return xml;
    },

    
    getData: function(data) {
        return data.documentElement || data;
    },

    
    getRoot: function(data) {
        return Ext.DomQuery.select(this.root, data);
    },


    


    

    

    

    
    constructor: function(config) {
        config = config || {};

        
        

        
        Ext.applyIf(config, {
            idProperty     : config.idPath || config.id,
            successProperty: config.success,
            root           : config.record
        });
        Ext.data.XmlReader.superclass.constructor.call(this, config);
    },

    
    
    readRecords: function(doc) {
        
        this.xmlData = doc;

        return Ext.data.XmlReader.superclass.readRecords.call(this, doc);
    }
});

Ext.data.ReaderMgr.registerType('xml', Ext.data.XmlReader);

Ext.data.XmlStore = Ext.extend(Ext.data.Store, {
    
    constructor: function(config){
        config = config || {};
        config = config || {};
              
        Ext.applyIf(config, {
            proxy: {
                type: 'ajax',
                reader: 'xml',
                writer: 'xml'
            }
        });
        Ext.data.XmlStore.superclass.constructor.call(this, config);
    }
});
Ext.reg('xmlstore', Ext.data.XmlStore);



(function() {
var El = Ext.Element = Ext.extend(Object, {
    
    defaultUnit : "px",

    constructor : function(element, forceNew) {
        var dom = typeof element == 'string'
                ? document.getElementById(element)
                : element,
            id;

        if (!dom) {
            return null;
        }

        id = dom.id;
        if (!forceNew && id && Ext.cache[id]) {
            return Ext.cache[id].el;
        }

        
        this.dom = dom;

        
        this.id = id || Ext.id(dom);
        return this;
    },

    
    set : function(o, useSet) {
        var el = this.dom,
            attr,
            value;

        for (attr in o) {
            if (o.hasOwnProperty(attr)) {
                value = o[attr];
                if (attr == 'style') {
                    this.applyStyles(value);
                }
                else if (attr == 'cls') {
                    el.className = value;
                }
                else if (useSet !== false) {
                    el.setAttribute(attr, value);
                }
                else {
                    el[attr] = value;
                }
            }
        }
        return this;
    },

    
    is : function(simpleSelector) {
        return Ext.DomQuery.is(this.dom, simpleSelector);
    },

    
    getValue : function(asNumber){
        var val = this.dom.value;
        return asNumber ? parseInt(val, 10) : val;
    },

    
    addListener : function(eventName, fn, scope, options){
        Ext.EventManager.on(this.dom,  eventName, fn, scope || this, options);
        return this;
    },

    
    removeListener : function(eventName, fn, scope) {
        Ext.EventManager.un(this.dom, eventName, fn, scope);
        return this;
    },

    
    removeAllListeners : function(){
        Ext.EventManager.removeAll(this.dom);
        return this;
    },

    
    purgeAllListeners : function() {
        Ext.EventManager.purgeElement(this, true);
        return this;
    },

    
    remove : function() {
        var me = this,
            dom = me.dom;

        if (dom) {
            delete me.dom;
            Ext.removeNode(dom);
        }
    },

    isAncestor : function(c) {
        var p = this.dom;
        c = Ext.getDom(c);
        if (p && c) {
            return p.contains(c);
        }
        return false;
    },

    
    isDescendent : function(p) {
        return Ext.fly(p).isAncestor(this);
    },

    
    contains : function(el) {
        return !el ? false : this.isAncestor(el);
    },

    
    getAttribute : function(name, ns) {
        var d = this.dom;
        return d.getAttributeNS(ns, name) || d.getAttribute(ns + ":" + name) || d.getAttribute(name) || d[name];
    },

    
    setHTML : function(html) {
        if(this.dom) {
            this.dom.innerHTML = html;
        }
        return this;
    },

    
    getHTML : function() {
        return this.dom ? this.dom.innerHTML : '';
    },

    
    hide : function() {
        this.setVisible(false);
        return this;
    },

    
    show : function() {
        this.setVisible(true);
        return this;
    },

    
     setVisible : function(visible, animate) {
        var me = this,
            dom = me.dom,
            mode = this.getVisibilityMode();

        switch (mode) {
            case El.VISIBILITY:
                this.removeClass(['x-hidden-display', 'x-hidden-offsets']);
                this[visible ? 'removeClass' : 'addClass']('x-hidden-visibility');
            break;

            case El.DISPLAY:
                this.removeClass(['x-hidden-visibility', 'x-hidden-offsets']);
                this[visible ? 'removeClass' : 'addClass']('x-hidden-display');
            break;

            case El.OFFSETS:
                this.removeClass(['x-hidden-visibility', 'x-hidden-display']);
                this[visible ? 'removeClass' : 'addClass']('x-hidden-offsets');
            break;
        }

        return me;
    },

    getVisibilityMode: function() {
        var dom = this.dom,
            mode = El.data(dom, 'visibilityMode');

        if (mode === undefined) {
            El.data(dom, 'visibilityMode', mode = El.DISPLAY);
        }

        return mode;
    },

    setDisplayMode : function(mode) {
        El.data(this.dom, 'visibilityMode', mode);
        return this;
    }
});

var Elp = El.prototype;


El.VISIBILITY = 1;

El.DISPLAY = 2;

El.OFFSETS = 3;


El.addMethods = function(o){
   Ext.apply(Elp, o);
};


Elp.on = Elp.addListener;
Elp.un = Elp.removeListener;


Elp.update = Elp.setHTML;


El.get = function(el){
    var extEl,
        dom,
        id;

    if(!el){
        return null;
    }

    if (typeof el == "string") { 
        if (!(dom = document.getElementById(el))) {
            return null;
        }
        if (Ext.cache[el] && Ext.cache[el].el) {
            extEl = Ext.cache[el].el;
            extEl.dom = dom;
        } else {
            extEl = El.addToCache(new El(dom));
        }
        return extEl;
    } else if (el.tagName) { 
        if(!(id = el.id)){
            id = Ext.id(el);
        }
        if (Ext.cache[id] && Ext.cache[id].el) {
            extEl = Ext.cache[id].el;
            extEl.dom = el;
        } else {
            extEl = El.addToCache(new El(el));
        }
        return extEl;
    } else if (el instanceof El) {
        if(el != El.docEl){
            
            
            el.dom = document.getElementById(el.id) || el.dom;
        }
        return el;
    } else if(el.isComposite) {
        return el;
    } else if(Ext.isArray(el)) {
        return El.select(el);
    } else if(el == document) {
        
        if(!El.docEl){
            var F = function(){};
            F.prototype = Elp;
            El.docEl = new F();
            El.docEl.dom = document;
            El.docEl.id = Ext.id(document);
        }
        return El.docEl;
    }
    return null;
};


El.addToCache = function(el, id){
    id = id || el.id;
    Ext.cache[id] = {
        el:  el,
        data: {},
        events: {}
    };
    return el;
};


El.data = function(el, key, value) {
    el = El.get(el);
    if (!el) {
        return null;
    }
    var c = Ext.cache[el.id].data;
    if (arguments.length == 2) {
        return c[key];
    }
    else {
        return (c[key] = value);
    }
};




El.garbageCollect = function() {
    if (!Ext.enableGarbageCollector) {
        clearInterval(El.collectorThreadId);
    }
    else {
        var id,
            dom,
            EC = Ext.cache;

        for (id in EC) {
            if (!EC.hasOwnProperty(id)) {
                continue;
            }
            if(EC[id].skipGarbageCollection){
                continue;
            }
            dom = EC[id].el.dom;
            if(!dom || !dom.parentNode || (!dom.offsetParent && !document.getElementById(id))){
                if(Ext.enableListenerCollection){
                    Ext.EventManager.removeAll(dom);
                }
                delete EC[id];
            }
        }
    }
};



El.Flyweight = function(dom) {
    this.dom = dom;
};

var F = function(){};
F.prototype = Elp;

El.Flyweight.prototype = new F;
El.Flyweight.prototype.isFlyweight = true;

El._flyweights = {};


El.fly = function(el, named) {
    var ret = null;
    named = named || '_global';

    el = Ext.getDom(el);
    if (el) {
        (El._flyweights[named] = El._flyweights[named] || new El.Flyweight()).dom = el;
        ret = El._flyweights[named];
    }

    return ret;
};


Ext.get = El.get;


Ext.fly = El.fly;



})();

Ext.applyIf(Ext.Element, {
    unitRe: /\d+(px|em|%|en|ex|pt|in|cm|mm|pc)$/i,
    camelRe: /(-[a-z])/gi,
    opacityRe: /alpha\(opacity=(.*)\)/i,
    propertyCache: {},
    defaultUnit : "px",
    borders: {l: 'border-left-width', r: 'border-right-width', t: 'border-top-width', b: 'border-bottom-width'},
    paddings: {l: 'padding-left', r: 'padding-right', t: 'padding-top', b: 'padding-bottom'},
    margins: {l: 'margin-left', r: 'margin-right', t: 'margin-top', b: 'margin-bottom'},

    addUnits : function(size) {
        if (size === "" || size == "auto" || size === null || size === undefined) {
            size = size || '';
        }
        else if (!isNaN(size) || !this.unitRe.test(size)) {
            size = size + (this.defaultUnit || 'px');
        }
        return size;
    },

    
    parseBox : function(box) {
        if (typeof box != 'string') {
            box = box.toString();
        }
        var parts  = box.split(' '),
            ln = parts.length;

        if (ln == 1) {
            parts[1] = parts[2] = parts[3] = parts[0];
        }
        else if (ln == 2) {
            parts[2] = parts[0];
            parts[3] = parts[1];
        }
        else if (ln == 3) {
            parts[3] = parts[1];
        }

        return {
            top   :parseFloat(parts[0]) || 0,
            right :parseFloat(parts[1]) || 0,
            bottom:parseFloat(parts[2]) || 0,
            left  :parseFloat(parts[3]) || 0
        };
    },
    
    
    unitizeBox : function(box){
        var A = this.addUnits,
            B = this.parseBox(box);
            
        return A( B.top ) + ' ' +
               A( B.right ) + ' ' +
               A( B.bottom ) + ' ' +
               A( B.left );
        
    },

    
    camelReplaceFn : function(m, a) {
        return a.charAt(1).toUpperCase();
    },

    
    normalize : function(prop) {
        return this.propertyCache[prop] || (this.propertyCache[prop] = prop == 'float' ? 'cssFloat' : prop.replace(this.camelRe, this.camelReplaceFn));
    },

    
    getDocumentHeight: function() {
        return Math.max(!Ext.isStrict ? document.body.scrollHeight : document.documentElement.scrollHeight, this.getViewportHeight());
    },

    
    getDocumentWidth: function() {
        return Math.max(!Ext.isStrict ? document.body.scrollWidth : document.documentElement.scrollWidth, this.getViewportWidth());
    },

    
    getViewportHeight: function(){
        return window.innerHeight;
    },

    
    getViewportWidth : function() {
        return window.innerWidth;
    },

    
    getViewSize : function() {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        };
    },

    
    getOrientation : function() {
        return (window.innerHeight > window.innerWidth) ? 'portrait' : 'landscape';
    },

    
    fromPoint: function(x, y) {
        return Ext.get(document.elementFromPoint(x, y));
    }
});


Ext.Element.addMethods({
    
    getY : function(el) {
        return this.getXY(el)[1];
    },

    
    getX : function(el) {
        return this.getXY(el)[0];
    },

    
    getXY : function() {
        
        var point = window.webkitConvertPointFromNodeToPage(this.dom, new WebKitPoint(0, 0));
        return [point.x, point.y];
    },

    
    getOffsetsTo : function(el){
        var o = this.getXY(),
            e = Ext.fly(el, '_internal').getXY();
        return [o[0]-e[0],o[1]-e[1]];
    },

    
    setXY : function(pos) {
        var me = this;

        if(arguments.length > 1) {
            pos = [pos, arguments[1]];
        }

        
        var pts = me.translatePoints(pos),
            style = me.dom.style;

        for (pos in pts) {
            if (!pts.hasOwnProperty(pos)) {
                continue;
            }
            if(!isNaN(pts[pos])) style[pos] = pts[pos] + "px";
        }
        return me;
    },

    
    setX : function(x){
        return this.setXY([x, this.getY()]);
    },

    
    setY : function(y) {
        return this.setXY([this.getX(), y]);
    },

    
    setLeft : function(left) {
        this.setStyle('left', Ext.Element.addUnits(left));
        return this;
    },

    
    setTop : function(top) {
        this.setStyle('top', Ext.Element.addUnits(top));
        return this;
    },

    
    setTopLeft: function(top, left) {
        var addUnits = Ext.Element.addUnits;

        this.setStyle('top', addUnits(top));
        this.setStyle('left', addUnits(left));

        return this;
    },

    
    setRight : function(right) {
        this.setStyle('right', Ext.Element.addUnits(right));
        return this;
    },

    
    setBottom : function(bottom) {
        this.setStyle('bottom', Ext.Element.addUnits(bottom));
        return this;
    },

    
    getLeft : function(local) {
        return parseInt(this.getStyle('left'), 10) || 0;
    },

    
    getRight : function(local) {
        return parseInt(this.getStyle('right'), 10) || 0;
    },

    
    getTop : function(local) {
        return parseInt(this.getStyle('top'), 10) || 0;
    },

    
    getBottom : function(local) {
        return parseInt(this.getStyle('bottom'), 10) || 0;
    },

    
    setBox : function(left, top, width, height) {
        var undefined;
        if (Ext.isObject(left)) {
            width = left.width;
            height = left.height;
            top = left.top;
            left = left.left;
        }
        
        if (left !== undefined) {
            this.setLeft(left);
        }
        if (top !== undefined) {
            this.setTop(top);
        }
        if (width !== undefined) {
            this.setWidth(width);
        }
        if (height !== undefined) {
            this.setHeight(height);
        }
    
        return this;
    },

    
    getBox : function(contentBox, local) {
        var me = this,
            dom = me.dom,
            width = dom.offsetWidth,
            height = dom.offsetHeight,
            xy, box, l, r, t, b;

        if (!local) {
            xy = me.getXY();
        }
        else if (contentBox) {
            xy = [0,0];
        }
        else {
            xy = [parseInt(me.getStyle("left"), 10) || 0, parseInt(me.getStyle("top"), 10) || 0];
        }

        if (!contentBox) {
            box = {
                x: xy[0],
                y: xy[1],
                0: xy[0],
                1: xy[1],
                width: width,
                height: height
            };
        }
        else {
            l = me.getBorderWidth.call(me, "l") + me.getPadding.call(me, "l");
            r = me.getBorderWidth.call(me, "r") + me.getPadding.call(me, "r");
            t = me.getBorderWidth.call(me, "t") + me.getPadding.call(me, "t");
            b = me.getBorderWidth.call(me, "b") + me.getPadding.call(me, "b");
            box = {
                x: xy[0] + l,
                y: xy[1] + t,
                0: xy[0] + l,
                1: xy[1] + t,
                width: width - (l + r),
                height: height - (t + b)
            };
        }

        box.left = box.x;
        box.top = box.y;
        box.right = box.x + box.width;
        box.bottom = box.y + box.height;

        return box;
    },

    
    getPageBox : function(getRegion) {
        var me = this,
            el = me.dom,
            w = el.offsetWidth,
            h = el.offsetHeight,
            xy = me.getXY(),
            t = xy[1],
            r = xy[0] + w,
            b = xy[1] + h,
            l = xy[0];

        if (getRegion) {
            return new Ext.util.Region(t, r, b, l);
        }
        else {
            return {
                left: l,
                top: t,
                width: w,
                height: h,
                right: r,
                bottom: b
            };
        }
    },

    
    translatePoints : function(x, y) {
        y = isNaN(x[1]) ? y : x[1];
        x = isNaN(x[0]) ? x : x[0];
        var me = this,
            relative = me.isStyle('position', 'relative'),
            o = me.getXY(),
            l = parseInt(me.getStyle('left'), 10),
            t = parseInt(me.getStyle('top'), 10);

        l = !isNaN(l) ? l : (relative ? 0 : me.dom.offsetLeft);
        t = !isNaN(t) ? t : (relative ? 0 : me.dom.offsetTop);

        return {left: (x - o[0] + l), top: (y - o[1] + t)};
    }
});

(function() {
    
    Ext.Element.classReCache = {};
    var El = Ext.Element,
        view = document.defaultView;

    El.addMethods({
        marginRightRe: /marginRight/i,
        trimRe: /^\s+|\s+$/g,
        spacesRe: /\s+/,

        
        addClass: function(className) {
            var me = this,
                i,
                len,
                v,
                cls = [];

            if (!Ext.isArray(className)) {
                if (className && !this.hasClass(className)) {
                    me.dom.className += " " + className;
                }
            }
            else {
                for (i = 0, len = className.length; i < len; i++) {
                    v = className[i];
                    if (v && !me.hasClass(v)) {
                        cls.push(v);
                    }
                }
                if (cls.length) {
                    me.dom.className += " " + cls.join(" ");
                }
            }
            return me;
        },

        
        removeClass: function(className) {
            var me = this,
                i,
                idx,
                len,
                cls,
                elClasses;
            if (!Ext.isArray(className)) {
                className = [className];
            }
            if (me.dom && me.dom.className) {
                elClasses = me.dom.className.replace(this.trimRe, '').split(this.spacesRe);
                for (i = 0, len = className.length; i < len; i++) {
                    cls = className[i];
                    if (typeof cls == 'string') {
                        cls = cls.replace(this.trimRe, '');
                        idx = elClasses.indexOf(cls);
                        if (idx != -1) {
                            elClasses.splice(idx, 1);
                        }
                    }
                }
                me.dom.className = elClasses.join(" ");
            }
            return me;
        },

        
        mask: function(transparent, html) {
            var me = this,
                dom = me.dom,
                el = Ext.Element.data(dom, 'mask'),
                mask,
                size;

            me.addClass('x-masked');
            if (me.getStyle("position") == "static") {
                me.addClass('x-masked-relative');
            }
            if (el) {
                el.remove();
            }
            mask = me.createChild({
                cls: 'x-mask' + (transparent ? ' x-mask-transparent': ''),
                html: html || ''
            });

            size = me.getSize();

            Ext.Element.data(dom, 'mask', mask);

            if (dom === document.body) {
                size.height = window.innerHeight;
                if (me.orientationHandler) {
                    Ext.EventManager.unOrientationChange(me.orientationHandler, me);
                }

                me.orientationHandler = function() {
                    size = me.getSize();
                    size.height = window.innerHeight;
                    mask.setSize(size);
                };

                Ext.EventManager.onOrientationChange(me.orientationHandler, me);
            }
            mask.setSize(size);
            if (Ext.is.iPad) {
                Ext.repaint();
            }
        },

        
        unmask: function() {
            var me = this,
                dom = me.dom,
                mask = Ext.Element.data(dom, 'mask');

            if (mask) {
                mask.remove();
                Ext.Element.data(dom, 'mask', undefined);
            }
            me.removeClass(['x-masked', 'x-masked-relative']);

            if (dom === document.body) {
                Ext.EventManager.unOrientationChange(me.orientationHandler, me);
                delete me.orientationHandler;
            }
        },

        
        radioClass: function(className) {
            var cn = this.dom.parentNode.childNodes,
                v;
            className = Ext.isArray(className) ? className: [className];
            for (var i = 0, len = cn.length; i < len; i++) {
                v = cn[i];
                if (v && v.nodeType == 1) {
                    Ext.fly(v, '_internal').removeClass(className);
                }
            };
            return this.addClass(className);
        },

        
        toggleClass: function(className) {
            return this.hasClass(className) ? this.removeClass(className) : this.addClass(className);
        },

        
        hasClass: function(className) {
            return className && (' ' + this.dom.className + ' ').indexOf(' ' + className + ' ') != -1;
        },

        
        replaceClass: function(oldClassName, newClassName) {
            return this.removeClass(oldClassName).addClass(newClassName);
        },

        isStyle: function(style, val) {
            return this.getStyle(style) == val;
        },

        
        getStyle: function(prop) {
            var dom = this.dom,
                result,
                display,
                cs,
                platform = Ext.is,
                style = dom.style;

            prop = El.normalize(prop);
            cs = (view) ? view.getComputedStyle(dom, '') : dom.currentStyle;
            result = (cs) ? cs[prop] : null;

            
            if (result && !platform.correctRightMargin &&
                    this.marginRightRe.test(prop) &&
                    style.position != 'absolute' &&
                    result != '0px') {
                display = style.display;
                style.display = 'inline-block';
                result = view.getComputedStyle(dom, null)[prop];
                style.display = display;
            }

            result || (result = style[prop]);

            
            if (!platform.correctTransparentColor && result == 'rgba(0, 0, 0, 0)') {
                result = 'transparent';
            }

            return result;
        },

        
        setStyle: function(prop, value) {
            var tmp,
                style;

            if (typeof prop == 'string') {
                tmp = {};
                tmp[prop] = value;
                prop = tmp;
            }

            for (style in prop) {
                if (prop.hasOwnProperty(style)) {
                    this.dom.style[El.normalize(style)] = prop[style];
                }
            }

            return this;
        },

        
        applyStyles: function(styles) {
            if (styles) {
                var i,
                    len,
                    dom = this.dom;

                if (typeof styles == 'function') {
                    styles = styles.call();
                }
                if (typeof styles == 'string') {
                    styles = Ext.util.Format.trim(styles).split(/\s*(?::|;)\s*/);
                    for (i = 0, len = styles.length; i < len;) {
                        dom.style[El.normalize(styles[i++])] = styles[i++];
                    }
                }
                else if (typeof styles == 'object') {
                    this.setStyle(styles);
                }
            }
        },

        
        getHeight: function(contentHeight) {
            var dom = this.dom,
                height = contentHeight ? (dom.clientHeight - this.getPadding("tb")) : dom.offsetHeight;
            return height > 0 ? height: 0;
        },

        
        getWidth: function(contentWidth) {
            var dom = this.dom,
                width = contentWidth ? (dom.clientWidth - this.getPadding("lr")) : dom.offsetWidth;
            return width > 0 ? width: 0;
        },

        
        setWidth: function(width) {
            var me = this;
                me.dom.style.width = El.addUnits(width);
            return me;
        },

        
        setHeight: function(height) {
            var me = this;
                me.dom.style.height = El.addUnits(height);
            return me;
        },

        
        setSize: function(width, height) {
            var me = this,
                style = me.dom.style;

            if (Ext.isObject(width)) {
                
                height = width.height;
                width = width.width;
            }

            style.width = El.addUnits(width);
            style.height = El.addUnits(height);
            return me;
        },

        
        getBorderWidth: function(side) {
            return this.sumStyles(side, El.borders);
        },

        
        getPadding: function(side) {
            return this.sumStyles(side, El.paddings);
        },

        
        getMargin: function(side) {
            return this.sumStyles(side, El.margins);
        },

        
        getViewSize: function() {
            var doc = document,
                dom = this.dom;

            if (dom == doc || dom == doc.body) {
                return {
                    width: El.getViewportWidth(),
                    height: El.getViewportHeight()
                };
            }
            else {
                return {
                    width: dom.clientWidth,
                    height: dom.clientHeight
                };
            }
        },

        
        getSize: function(contentSize) {
            var dom = this.dom;
            return {
                width: Math.max(0, contentSize ? (dom.clientWidth - this.getPadding("lr")) : dom.offsetWidth),
                height: Math.max(0, contentSize ? (dom.clientHeight - this.getPadding("tb")) : dom.offsetHeight)
            };
        },

        
        repaint: function() {
            var dom = this.dom;
                this.addClass("x-repaint");
            dom.style.background = 'transparent none';
            setTimeout(function() {
                dom.style.background = null;
                Ext.get(dom).removeClass("x-repaint");
            },
            1);
            return this;
        },

        
        getOuterWidth: function() {
            return this.getWidth() + this.getMargin('lr');
        },

        
        getOuterHeight: function() {
            return this.getHeight() + this.getMargin('tb');
        },

        
        sumStyles: function(sides, styles) {
            var val = 0,
                m = sides.match(/\w/g),
                len = m.length,
                s,
                i;

            for (i = 0; i < len; i++) {
                s = m[i] && parseFloat(this.getStyle(styles[m[i]])) || 0;
                if (s) {
                    val += Math.abs(s);
                }
            }
            return val;
        }
    });
})();

Ext.Element.addMethods({
    
    findParent : function(simpleSelector, maxDepth, returnEl) {
        var p = this.dom,
            b = document.body,
            depth = 0,
            stopEl;

        maxDepth = maxDepth || 50;
        if (isNaN(maxDepth)) {
            stopEl = Ext.getDom(maxDepth);
            maxDepth = Number.MAX_VALUE;
        }
        while (p && p.nodeType == 1 && depth < maxDepth && p != b && p != stopEl) {
            if (Ext.DomQuery.is(p, simpleSelector)) {
                return returnEl ? Ext.get(p) : p;
            }
            depth++;
            p = p.parentNode;
        }
        return null;
    },
    
    
    getScrollParent : function() {
        var parent = this.dom, scroller;
        while (parent && parent != document.body) {
            if (parent.id && (scroller = Ext.ScrollManager.get(parent.id))) {
                return scroller;
            }
            parent = parent.parentNode;
        }
        return null;
    },

    
    findParentNode : function(simpleSelector, maxDepth, returnEl) {
        var p = Ext.fly(this.dom.parentNode, '_internal');
        return p ? p.findParent(simpleSelector, maxDepth, returnEl) : null;
    },

    
    up : function(simpleSelector, maxDepth) {
        return this.findParentNode(simpleSelector, maxDepth, true);
    },

    
    select : function(selector, composite) {
        return Ext.Element.select(selector, this.dom, composite);
    },

    
    query : function(selector) {
        return Ext.DomQuery.select(selector, this.dom);
    },

    
    down : function(selector, returnDom) {
        var n = Ext.DomQuery.selectNode(selector, this.dom);
        return returnDom ? n : Ext.get(n);
    },

    
    child : function(selector, returnDom) {
        var node,
            me = this,
            id;
        id = Ext.get(me).id;
        
        id = id.replace(/[\.:]/g, "\\$0");
        node = Ext.DomQuery.selectNode('#' + id + " > " + selector, me.dom);
        return returnDom ? node : Ext.get(node);
    },

     
    parent : function(selector, returnDom) {
        return this.matchNode('parentNode', 'parentNode', selector, returnDom);
    },

     
    next : function(selector, returnDom) {
        return this.matchNode('nextSibling', 'nextSibling', selector, returnDom);
    },

    
    prev : function(selector, returnDom) {
        return this.matchNode('previousSibling', 'previousSibling', selector, returnDom);
    },


    
    first : function(selector, returnDom) {
        return this.matchNode('nextSibling', 'firstChild', selector, returnDom);
    },

    
    last : function(selector, returnDom) {
        return this.matchNode('previousSibling', 'lastChild', selector, returnDom);
    },

    matchNode : function(dir, start, selector, returnDom) {
        var n = this.dom[start];
        while (n) {
            if (n.nodeType == 1 && (!selector || Ext.DomQuery.is(n, selector))) {
                return !returnDom ? Ext.get(n) : n;
            }
            n = n[dir];
        }
        return null;
    }
});


Ext.Element.addMethods({
    
    appendChild : function(el) {
        return Ext.get(el).appendTo(this);
    },

    
    appendTo : function(el) {
        Ext.getDom(el).appendChild(this.dom);
        return this;
    },

    
    insertBefore : function(el) {
        el = Ext.getDom(el);
        el.parentNode.insertBefore(this.dom, el);
        return this;
    },

    
    insertAfter : function(el) {
        el = Ext.getDom(el);
        el.parentNode.insertBefore(this.dom, el.nextSibling);
        return this;
    },

    
    insertFirst : function(el, returnDom) {
        el = el || {};
        if (el.nodeType || el.dom || typeof el == 'string') { 
            el = Ext.getDom(el);
            this.dom.insertBefore(el, this.dom.firstChild);
            return !returnDom ? Ext.get(el) : el;
        }
        else { 
            return this.createChild(el, this.dom.firstChild, returnDom);
        }
    },

    
    insertSibling: function(el, where, returnDom){
        var me = this, rt,
        isAfter = (where || 'before').toLowerCase() == 'after',
        insertEl;

        if(Ext.isArray(el)){
            insertEl = me;
            Ext.each(el, function(e) {
                rt = Ext.fly(insertEl, '_internal').insertSibling(e, where, returnDom);
                if(isAfter){
                    insertEl = rt;
                }
            });
            return rt;
        }

        el = el || {};

        if(el.nodeType || el.dom){
            rt = me.dom.parentNode.insertBefore(Ext.getDom(el), isAfter ? me.dom.nextSibling : me.dom);
            if (!returnDom) {
                rt = Ext.get(rt);
            }
        }else{
            if (isAfter && !me.dom.nextSibling) {
                rt = Ext.DomHelper.append(me.dom.parentNode, el, !returnDom);
            } else {
                rt = Ext.DomHelper[isAfter ? 'insertAfter' : 'insertBefore'](me.dom, el, !returnDom);
            }
        }
        return rt;
    },

    
    replace : function(el) {
        el = Ext.get(el);
        this.insertBefore(el);
        el.remove();
        return this;
    },

    
    createChild : function(config, insertBefore, returnDom) {
        config = config || {tag:'div'};
        if (insertBefore) {
            return Ext.DomHelper.insertBefore(insertBefore, config, returnDom !== true);
        }
        else {
            return Ext.DomHelper[!this.dom.firstChild ? 'overwrite' : 'append'](this.dom, config,  returnDom !== true);
        }
    },

    
    wrap : function(config, returnDom) {
        var newEl = Ext.DomHelper.insertBefore(this.dom, config || {tag: "div"}, !returnDom);
        newEl.dom ? newEl.dom.appendChild(this.dom) : newEl.appendChild(this.dom);
        return newEl;
    },

    
    insertHtml : function(where, html, returnEl) {
        var el = Ext.DomHelper.insertHtml(where, this.dom, html);
        return returnEl ? Ext.get(el) : el;
    }
});


Ext.Element.addMethods({
    
    getAnchorXY: function(anchor, local, size) {
        
        
        anchor = (anchor || "tl").toLowerCase();
        size = size || {};

        var me = this,
            vp = me.dom == document.body || me.dom == document,
            width = size.width || vp ? window.innerWidth: me.getWidth(),
            height = size.height || vp ? window.innerHeight: me.getHeight(),
            xy,
            rnd = Math.round,
            myXY = me.getXY(),
            extraX = vp ? 0: !local ? myXY[0] : 0,
            extraY = vp ? 0: !local ? myXY[1] : 0,
            hash = {
                c: [rnd(width * 0.5), rnd(height * 0.5)],
                t: [rnd(width * 0.5), 0],
                l: [0, rnd(height * 0.5)],
                r: [width, rnd(height * 0.5)],
                b: [rnd(width * 0.5), height],
                tl: [0, 0],
                bl: [0, height],
                br: [width, height],
                tr: [width, 0]
            };

        xy = hash[anchor];
        return [xy[0] + extraX, xy[1] + extraY];
    },

    
    getAlignToXY: function(el, position, offsets) {
        el = Ext.get(el);

        if (!el || !el.dom) {
            throw "Element.alignToXY with an element that doesn't exist";
        }
        offsets = offsets || [0, 0];

        if (!position || position == '?') {
            position = 'tl-bl?';
        }
        else if (! (/-/).test(position) && position !== "") {
            position = 'tl-' + position;
        }
        position = position.toLowerCase();

        var me = this,
            matches = position.match(/^([a-z]+)-([a-z]+)(\?)?$/),
            dw = window.innerWidth,
            dh = window.innerHeight,
            p1 = "",
            p2 = "",
            a1,
            a2,
            x,
            y,
            swapX,
            swapY,
            p1x,
            p1y,
            p2x,
            p2y,
            width,
            height,
            region,
            constrain;

        if (!matches) {
            throw "Element.alignTo with an invalid alignment " + position;
        }

        p1 = matches[1];
        p2 = matches[2];
        constrain = !!matches[3];

        
        
        a1 = me.getAnchorXY(p1, true);
        a2 = el.getAnchorXY(p2, false);

        x = a2[0] - a1[0] + offsets[0];
        y = a2[1] - a1[1] + offsets[1];

        if (constrain) {
            width = me.getWidth();
            height = me.getHeight();

            region = el.getPageBox();

            
            
            
            p1y = p1.charAt(0);
            p1x = p1.charAt(p1.length - 1);
            p2y = p2.charAt(0);
            p2x = p2.charAt(p2.length - 1);

            swapY = ((p1y == "t" && p2y == "b") || (p1y == "b" && p2y == "t"));
            swapX = ((p1x == "r" && p2x == "l") || (p1x == "l" && p2x == "r"));

            if (x + width > dw) {
                x = swapX ? region.left - width: dw - width;
            }
            if (x < 0) {
                x = swapX ? region.right: 0;
            }
            if (y + height > dh) {
                y = swapY ? region.top - height: dh - height;
            }
            if (y < 0) {
                y = swapY ? region.bottom: 0;
            }
        }

        return [x, y];
    }

    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
});


Ext.CompositeElement = function(els, root) {
    
    this.elements = [];
    this.add(els, root);
    this.el = new Ext.Element.Flyweight();
};

Ext.CompositeElement.prototype = {
    isComposite: true,

    
    getElement : function(el) {
        
        var e = this.el;
        e.dom = el;
        e.id = el.id;
        return e;
    },

    
    transformElement : function(el) {
        return Ext.getDom(el);
    },

    
    getCount : function() {
        return this.elements.length;
    },

    
    add : function(els, root) {
        var me = this,
            elements = me.elements;
        if (!els) {
            return this;
        }
        if (typeof els == 'string') {
            els = Ext.Element.selectorFunction(els, root);
        }
        else if (els.isComposite) {
            els = els.elements;
        }
        else if (!Ext.isIterable(els)) {
            els = [els];
        }

        for (var i = 0, len = els.length; i < len; ++i) {
            elements.push(me.transformElement(els[i]));
        }

        return me;
    },

    invoke : function(fn, args) {
        var me = this,
            els = me.elements,
            len = els.length,
            e,
            i;

        for (i = 0; i < len; i++) {
            e = els[i];
            if (e) {
                Ext.Element.prototype[fn].apply(me.getElement(e), args);
            }
        }
        return me;
    },
    
    item : function(index) {
        var me = this,
            el = me.elements[index],
            out = null;

        if (el){
            out = me.getElement(el);
        }
        return out;
    },

    
    addListener : function(eventName, handler, scope, opt) {
        var els = this.elements,
            len = els.length,
            i, e;

        for (i = 0; i<len; i++) {
            e = els[i];
            if (e) {
                Ext.EventManager.on(e, eventName, handler, scope || e, opt);
            }
        }
        return this;
    },

    
    each : function(fn, scope) {
        var me = this,
            els = me.elements,
            len = els.length,
            i, e;

        for (i = 0; i<len; i++) {
            e = els[i];
            if (e) {
                e = this.getElement(e);
                if(fn.call(scope || e, e, me, i)){
                    break;
                }
            }
        }
        return me;
    },

    
    fill : function(els) {
        var me = this;
        me.elements = [];
        me.add(els);
        return me;
    },

    
    filter : function(selector) {
        var els = [],
            me = this,
            elements = me.elements,
            fn = Ext.isFunction(selector) ? selector
                : function(el){
                    return el.is(selector);
                };

        me.each(function(el, self, i){
            if(fn(el, i) !== false){
                els[els.length] = me.transformElement(el);
            }
        });
        me.elements = els;
        return me;
    },

    
    first : function() {
        return this.item(0);
    },

    
    last : function() {
        return this.item(this.getCount()-1);
    },

    
    contains : function(el) {
        return this.indexOf(el) != -1;
    },

    
    indexOf : function(el) {
        return this.elements.indexOf(this.transformElement(el));
    },

    
    clear : function() {
        this.elements = [];
    }
};

Ext.CompositeElement.prototype.on = Ext.CompositeElement.prototype.addListener;

(function(){
var fnName,
    ElProto = Ext.Element.prototype,
    CelProto = Ext.CompositeElement.prototype;

for (fnName in ElProto) {
    if (Ext.isFunction(ElProto[fnName])) {
        (function(fnName) {
            CelProto[fnName] = CelProto[fnName] || function(){
                return this.invoke(fnName, arguments);
            };
        }).call(CelProto, fnName);

    }
}
})();

if(Ext.DomQuery) {
    Ext.Element.selectorFunction = Ext.DomQuery.select;
}


Ext.Element.select = function(selector, root, composite) {
    var els;
    composite = (composite === false) ? false : true;
    if (typeof selector == "string") {
        els = Ext.Element.selectorFunction(selector, root);
    } else if (selector.length !== undefined) {
        els = selector;
    } else {
        throw "Invalid selector";
    }
    return composite ? new Ext.CompositeElement(els) : els;
};

Ext.select = Ext.Element.select;


Ext.CompositeElementLite = Ext.CompositeElement;


Ext.apply(Ext.CompositeElementLite.prototype, {
    addElements : function(els, root){
        if(!els){
            return this;
        }
        if(typeof els == "string"){
            els = Ext.Element.selectorFunction(els, root);
        }
        var yels = this.elements;
        Ext.each(els, function(e) {
            yels.push(Ext.get(e));
        });
        return this;
    },

    
    removeElement : function(keys, removeDom){
        var me = this,
            els = this.elements,
            el;
        Ext.each(keys, function(val){
            if ((el = (els[val] || els[val = me.indexOf(val)]))) {
                if(removeDom){
                    if(el.dom){
                        el.remove();
                    }else{
                        Ext.removeNode(el);
                    }
                }
                els.splice(val, 1);
            }
        });
        return this;
    },

    
    replaceElement : function(el, replacement, domReplace){
        var index = !isNaN(el) ? el : this.indexOf(el),
            d;
        if(index > -1){
            replacement = Ext.getDom(replacement);
            if(domReplace){
                d = this.elements[index];
                d.parentNode.insertBefore(replacement, d);
                Ext.removeNode(d);
            }
            this.elements.splice(index, 1, replacement);
        }
        return this;
    }
});


Ext.DomHelper = {
    emptyTags : /^(?:br|frame|hr|img|input|link|meta|range|spacer|wbr|area|param|col)$/i,
    confRe : /tag|children|cn|html$/i,
    endRe : /end/i,

    
    markup : function(o) {
        var b = '',
            attr,
            val,
            key,
            keyVal,
            cn;

        if (typeof o == "string") {
            b = o;
        }
        else if (Ext.isArray(o)) {
            for (var i=0; i < o.length; i++) {
                if (o[i]) {
                    b += this.markup(o[i]);
                }
            };
        }
        else {
            b += '<' + (o.tag = o.tag || 'div');
            for (attr in o) {
                if (!o.hasOwnProperty(attr)) {
                    continue;
                }
                val = o[attr];
                if (!this.confRe.test(attr)) {
                    if (typeof val == "object") {
                        b += ' ' + attr + '="';
                        for (key in val) {
                            if (!val.hasOwnProperty(key)) {
                                continue;
                            }
                            b += key + ':' + val[key] + ';';
                        };
                        b += '"';
                    }
                    else {
                        b += ' ' + ({cls : 'class', htmlFor : 'for'}[attr] || attr) + '="' + val + '"';
                    }
                }
            };

            
            if (this.emptyTags.test(o.tag)) {
                b += '/>';
            }
            else {
                b += '>';
                if ((cn = o.children || o.cn)) {
                    b += this.markup(cn);
                }
                else if (o.html) {
                    b += o.html;
                }
                b += '</' + o.tag + '>';
            }
        }
        return b;
    },

    
    applyStyles : function(el, styles) {
        if (styles) {
            var i = 0,
                len,
                style;

            el = Ext.fly(el);
            if (typeof styles == 'function') {
                styles = styles.call();
            }
            if (typeof styles == 'string'){
                styles = Ext.util.Format.trim(styles).split(/\s*(?::|;)\s*/);
                for(len = styles.length; i < len;){
                    el.setStyle(styles[i++], styles[i++]);
                }
            } else if (Ext.isObject(styles)) {
                el.setStyle(styles);
            }
        }
    },

    
    insertHtml : function(where, el, html) {
        var hash = {},
            hashVal,
            setStart,
            range,
            frag,
            rangeEl,
            rs;

        where = where.toLowerCase();

        
        hash['beforebegin'] = ['BeforeBegin', 'previousSibling'];
        hash['afterend'] = ['AfterEnd', 'nextSibling'];

        range = el.ownerDocument.createRange();
        setStart = 'setStart' + (this.endRe.test(where) ? 'After' : 'Before');
        if (hash[where]) {
            range[setStart](el);
            frag = range.createContextualFragment(html);
            el.parentNode.insertBefore(frag, where == 'beforebegin' ? el : el.nextSibling);
            return el[(where == 'beforebegin' ? 'previous' : 'next') + 'Sibling'];
        }
        else {
            rangeEl = (where == 'afterbegin' ? 'first' : 'last') + 'Child';
            if (el.firstChild) {
                range[setStart](el[rangeEl]);
                frag = range.createContextualFragment(html);
                if (where == 'afterbegin') {
                    el.insertBefore(frag, el.firstChild);
                }
                else {
                    el.appendChild(frag);
                }
            }
            else {
                el.innerHTML = html;
            }
            return el[rangeEl];
        }

        throw 'Illegal insertion point -> "' + where + '"';
    },

    
    insertBefore : function(el, o, returnElement) {
        return this.doInsert(el, o, returnElement, 'beforebegin');
    },

    
    insertAfter : function(el, o, returnElement) {
        return this.doInsert(el, o, returnElement, 'afterend', 'nextSibling');
    },

    
    insertFirst : function(el, o, returnElement) {
        return this.doInsert(el, o, returnElement, 'afterbegin', 'firstChild');
    },

    
    append : function(el, o, returnElement) {
        return this.doInsert(el, o, returnElement, 'beforeend', '', true);
    },

    
    overwrite : function(el, o, returnElement) {
        el = Ext.getDom(el);
        el.innerHTML = this.markup(o);
        return returnElement ? Ext.get(el.firstChild) : el.firstChild;
    },

    doInsert : function(el, o, returnElement, pos, sibling, append) {
        var newNode = this.insertHtml(pos, Ext.getDom(el), this.markup(o));
        return returnElement ? Ext.get(newNode, true) : newNode;
    }
};


Ext.DomQuery = {
    
    select : function(q, root) {
        var results = [],
            nodes,
            i,
            j,
            qlen,
            nlen;

        root = root || document;
        if (typeof root == 'string') {
            root = document.getElementById(root);
        }

        q = q.split(",");
        for (i = 0, qlen = q.length; i < qlen; i++) {
            if (typeof q[i] == 'string') {
                nodes = root.querySelectorAll(q[i]);

                for (j = 0, nlen = nodes.length; j < nlen; j++) {
                    results.push(nodes[j]);
                }
            }
        }

        return results;
    },

    
    selectNode : function(q, root) {
        return Ext.DomQuery.select(q, root)[0];
    },

    
    is : function(el, q) {
        if (typeof el == "string") {
            el = document.getElementById(el);
        }
        return Ext.DomQuery.select(q).indexOf(el) !== -1;
    }
};

Ext.Element.selectorFunction = Ext.DomQuery.select;
Ext.query = Ext.DomQuery.select;


Ext.Anim = Ext.extend(Object, {
    isAnim: true,
    disableAnimations: (Ext.is.Android || Ext.is.Blackberry) ? true : false,

    defaultConfig: {
        
        from: {},

        
        to: {},

        
        duration: 250,

        
        delay: 0,

        
        easing: 'ease-in-out',

        
        autoClear: true,

        
        autoReset: false,

        
        autoShow: true,

        
        out: true,

        
        direction: null,

        
        reverse: false
    },

    

    

    opposites: {
        'left': 'right',
        'right': 'left',
        'up': 'down',
        'down': 'up'
    },

    constructor: function(config) {
        config = Ext.apply({}, config || {}, this.defaultConfig);
        this.config = config;

        Ext.Anim.superclass.constructor.call(this);

        this.running = [];
    },

    initConfig : function(el, runConfig) {
        var me = this,
            runtime = {},
            config = Ext.apply({}, runConfig || {}, me.config);

        config.el = el = Ext.get(el);

        if (config.reverse && me.opposites[config.direction]) {
            config.direction = me.opposites[config.direction];
        }

        if (me.config.before) {
            me.config.before.call(config, el, config);
        }

        if (runConfig.before) {
            runConfig.before.call(config.scope || config, el, config);
        }

        return config;
    },

    run: function(el, config) {
        el = Ext.get(el);
        config = config || {};

        var me = this,
            style = el.dom.style,
            property,
            after = config.after;

        config = this.initConfig(el, config);

        if (this.disableAnimations) {
            for (property in config.to) {
                if (!config.to.hasOwnProperty(property)) {
                    continue;
                }
                style[property] = config.to[property];
            }
            this.onTransitionEnd(null, el, {
                config: config,
                after: after
            });
            return me;
        }

        el.un('webkitTransitionEnd', me.onTransitionEnd, me);

        style.webkitTransitionDuration = '0ms';
        for (property in config.from) {
            if (!config.from.hasOwnProperty(property)) {
                continue;
            }
            style[property] = config.from[property];
        }

        setTimeout(function() {
            
            if (config.is3d === true) {
                el.parent().setStyle({
                    
                    '-webkit-perspective': '1200',
                    '-webkit-transform-style': 'preserve-3d'
                });
            }

            style.webkitTransitionDuration = config.duration + 'ms';
            style.webkitTransitionProperty = 'all';
            style.webkitTransitionTimingFunction = config.easing;

            
            el.on('webkitTransitionEnd', me.onTransitionEnd, me, {
                single: true,
                config: config,
                after: after
            });

            for (property in config.to) {
                if (!config.to.hasOwnProperty(property)) {
                    continue;
                }
                style[property] = config.to[property];
            }
        }, config.delay || 5);

        me.running[el.id] = config;
        return me;
    },

    onTransitionEnd: function(ev, el, o) {
        el = Ext.get(el);
        var style = el.dom.style,
            config = o.config,
            property,
            me = this;

        if (config.autoClear) {
            for (property in config.to) {
                if (!config.to.hasOwnProperty(property)) {
                    continue;
                }
                style[property] = '';
            }
        }

        style.webkitTransitionDuration = null;
        style.webkitTransitionProperty = null;
        style.webkitTransitionTimingFunction = null;

        if (config.is3d) {
            el.parent().setStyle({
                '-webkit-perspective': '',
                '-webkit-transform-style': ''
            });
        }

        if (me.config.after) {
            me.config.after.call(config, el, config);
        }

        if (o.after) {
            o.after.call(config.scope || me, el, config);
        }

        delete me.running[el.id];
    }
});

Ext.Anim.seed = 1000;

Ext.Anim.run = function(el, anim, config) {
    if (el.isComponent) {
        el = el.el;
    }

    config = config || {};

    if (anim.isAnim) {
        anim.run(el, config);
    }
    else {
        if (Ext.isObject(anim)) {
            if (config.before && anim.before) {
                config.before = Ext.createInterceptor(config.before, anim.before, anim.scope);
            }
            if (config.after && anim.after) {
                config.after = Ext.createInterceptor(config.after, anim.after, anim.scope);
            }
            config = Ext.apply({}, config, anim);
            anim = anim.type;
        }

        if (!Ext.anims[anim]) {
            throw anim + ' is not a valid animation type.';
        }
        else {
            
            if (el && el.dom) {
                Ext.anims[anim].run(el, config);
            }

        }
    }
};


Ext.anims = {
    
    fade: new Ext.Anim({
        before: function(el) {
            var fromOpacity = 1,
                toOpacity = 1,
                curZ = el.getStyle('z-index') == 'auto' ? 0 : el.getStyle('z-index'),
                zIndex = curZ;

            if (this.out) {
                toOpacity = 0;
            } else {
                zIndex = curZ + 1;
                fromOpacity = 0;
            }

            this.from = {
                'opacity': fromOpacity,
                'z-index': zIndex
            };
            this.to = {
                'opacity': toOpacity,
                'z-index': zIndex
            };
        }
    }),

    
    slide: new Ext.Anim({
        direction: 'left',
        cover: false,
        reveal: false,

        before: function(el) {
            var curZ = el.getStyle('z-index') == 'auto' ? 0 : el.getStyle('z-index'),
                zIndex = curZ + 1,
                toX = 0,
                toY = 0,
                fromX = 0,
                fromY = 0,
                elH = el.getHeight(),
                elW = el.getWidth();

            if (this.direction == 'left' || this.direction == 'right') {
                if (this.out == true) {
                    toX = -elW;
                }
                else {
                    fromX = elW;
                }
            }
            else if (this.direction == 'up' || this.direction == 'down') {
                if (this.out == true) {
                    toY = -elH;
                }
                else {
                    fromY = elH;
                }
            }

            if (this.direction == 'right' || this.direction == 'down') {
                toY *= -1;
                toX *= -1;
                fromY *= -1;
                fromX *= -1;
            }

            if (this.cover && this.out) {
                toX = 0;
                toY = 0;
                zIndex = curZ;
            }
            else if (this.reveal && !this.out) {
                fromX = 0;
                fromY = 0;
                zIndex = curZ;
            }

            this.from = {
                '-webkit-transform': 'translate3d(' + fromX + 'px, ' + fromY + 'px, 0)',
                'z-index': zIndex,
                'opacity': 0.99
            };
            this.to = {
                '-webkit-transform': 'translate3d(' + toX + 'px, ' + toY + 'px, 0)',
                'z-index': zIndex,
                'opacity': 1
            };
        }
    }),

    cardslide: new Ext.Anim({
        direction: 'left',
        cover: false,
        reveal: false,
        previousIndex : 0,
        newIndex : 0,

        before: function(el) {
            var curZ = el.getStyle('z-index') == 'auto' ? 0 : el.getStyle('z-index'),
                zIndex = curZ + 1,
                toX = 0,
                toY = 0,
                fromX = 0,
                fromY = 0,
                elH = el.getHeight(),
                elW = el.getWidth();

            if (/left|right/i.test(this.direction)) {

                if (this.previousIndex || this.newIndex) {
	                this.direction = this.previousIndex > this.newIndex ? 'right' : 'left';
	            }
                if (this.out === true) {
                    toX = -elW;
                }
                else {
                    fromX = elW;
                }
            }

            if (this.direction == 'right') {
                toY *= -1;
                toX *= -1;
                fromY *= -1;
                fromX *= -1;
            }

            if (this.cover && this.out) {
                toX = 0;
                toY = 0;
                zIndex = curZ;
            }
            else if (this.reveal && !this.out) {
                fromX = 0;
                fromY = 0;
                zIndex = curZ;
            }

            this.from = {
                '-webkit-transform': 'translate3d(' + fromX + 'px, ' + fromY + 'px, 0)',
                'z-index': zIndex,
                'opacity': 0.99
            };
            this.to = {
                '-webkit-transform': 'translate3d(' + toX + 'px, ' + toY + 'px, 0)',
                'z-index': zIndex,
                'opacity': 1
            };
        }
    }),

    
    flip: new Ext.Anim({
        is3d: true,
        direction: 'left',
        before: function(el) {
            var rotateProp = 'Y',
                fromScale = 1,
                toScale = 1,
                fromRotate = 0,
                toRotate = 0;

            if (this.out) {
                toRotate = -180;
                toScale = 0.8;
            }
            else {
                fromRotate = 180;
                fromScale = 0.8;
            }

            if (this.direction == 'up' || this.direction == 'down') {
                rotateProp = 'X';
            }

            if (this.direction == 'right' || this.direction == 'left') {
                toRotate *= -1;
                fromRotate *= -1;
            }

            this.from = {
                '-webkit-transform': 'rotate' + rotateProp + '(' + fromRotate + 'deg) scale(' + fromScale + ')',
                '-webkit-backface-visibility': 'hidden'
            };
            this.to = {
                '-webkit-transform': 'rotate' + rotateProp + '(' + toRotate + 'deg) scale(' + toScale + ')',
                '-webkit-backface-visibility': 'hidden'
            };
        }
    }),

    
    cube: new Ext.Anim({
        is3d: true,
        direction: 'left',
        style: 'outer',
        before: function(el) {
            var origin = '0% 0%',
                fromRotate = 0,
                toRotate = 0,
                rotateProp = 'Y',
                fromZ = 0,
                toZ = 0,
                fromOpacity = 1,
                toOpacity = 1,
                zDepth,
                elW = el.getWidth(),
                elH = el.getHeight(),
                showTranslateZ = true,
                fromTranslate = ' translateX(0)',
                toTranslate = '';

            if (this.direction == 'left' || this.direction == 'right') {
                if (this.out) {
                    origin = '100% 100%';
                    toZ = elW;
                    toOpacity = 0.5;
                    toRotate = -90;
                } else {
                    origin = '0% 0%';
                    fromZ = elW;
                    fromOpacity = 0.5;
                    fromRotate = 90;
                }
            } else if (this.direction == 'up' || this.direction == 'down') {
                rotateProp = 'X';
                if (this.out) {
                    origin = '100% 100%';
                    toZ = elH;
                    toRotate = 90;
                } else {
                    origin = '0% 0%';
                    fromZ = elH;
                    fromRotate = -90;
                }
            }

            if (this.direction == 'down' || this.direction == 'right') {
                fromRotate *= -1;
                toRotate *= -1;
                origin = (origin == '0% 0%') ? '100% 100%': '0% 0%';
            }

            if (this.style == 'inner') {
                fromZ *= -1;
                toZ *= -1;
                fromRotate *= -1;
                toRotate *= -1;

                if (!this.out) {
                    toTranslate = ' translateX(0px)';
                    origin = '0% 50%';
                } else {
                    toTranslate = fromTranslate;
                    origin = '100% 50%';
                }
            }

            this.from = {
                '-webkit-transform': 'rotate' + rotateProp + '(' + fromRotate + 'deg)' + (showTranslateZ ? ' translateZ(' + fromZ + 'px)': '') + fromTranslate,
                '-webkit-transform-origin': origin
            };
            this.to = {
                '-webkit-transform': 'rotate' + rotateProp + '(' + toRotate + 'deg) translateZ(' + toZ + 'px)' + toTranslate,
                '-webkit-transform-origin': origin
            };
        },
        duration: 250
    }),

    
    pop: new Ext.Anim({
        scaleOnExit: true,
        before: function(el) {
            var fromScale = 1,
                toScale = 1,
                fromOpacity = 1,
                toOpacity = 1,
                curZ = el.getStyle('z-index') == 'auto' ? 0 : el.getStyle('z-index'),
                fromZ = curZ,
                toZ = curZ;

            if (!this.out) {
                fromScale = 0.01;
                fromZ = curZ + 1;
                toZ = curZ + 1;
                fromOpacity = 0;
            }
            else {
                if (this.scaleOnExit) {
                    toScale = 0.01;
                    toOpacity = 0;
                } else {
                    toOpacity = 0.8;
                }
            }

            this.from = {
                '-webkit-transform': 'scale(' + fromScale + ')',
                '-webkit-transform-origin': '50% 50%',
                'opacity': fromOpacity,
                'z-index': fromZ
            };

            this.to = {
                '-webkit-transform': 'scale(' + toScale + ')',
                '-webkit-transform-origin': '50% 50%',
                'opacity': toOpacity,
                'z-index': toZ
            };
        }
    }),

    
    wipe: new Ext.Anim({
        before: function(el) {
            var curZ = el.getStyle('z-index'),
                mask = '',
                toSize = '100%',
                fromSize = '100%';

            if (!this.out) {
                zindex = curZ + 1;
                mask = '-webkit-gradient(linear, left bottom, right bottom, from(transparent), to(#000), color-stop(66%, #000), color-stop(33%, transparent))';
                toSize = el.getHeight() * 100 + 'px';
                fromSize = el.getHeight();

                this.from = {
                    '-webkit-mask-image': mask,
                    '-webkit-mask-size': el.getWidth() * 3 + 'px ' + el.getHeight() + 'px',
                    'z-index': zIndex,
                    '-webkit-mask-position-x': 0
                };
                this.to = {
                    '-webkit-mask-image': mask,
                    '-webkit-mask-size': el.getWidth() * 3 + 'px ' + el.getHeight() + 'px',
                    'z-index': zIndex,
                    '-webkit-mask-position-x': -el.getWidth() * 2 + 'px'
                };
            }
        },
        duration: 500
    })
};


Ext.apply(Ext, {
    
    version : '0.9.7',
    versionDetail : {
        major : 0,
        minor : 9,
        patch : 7
    },
    
    
    setup: function(config) {
        if (config && typeof config == 'object') {
            if (config.addMetaTags !== false) {
                var head = Ext.get(document.getElementsByTagName('head')[0]),
                    tag, precomposed;

                
                if (!Ext.is.Desktop) {
                    tag = Ext.get(document.createElement('meta'));
                    tag.set({
                        name: 'viewport',
                        content: 'width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0;'
                    });
                    head.appendChild(tag);                    
                }

                
                if (Ext.is.iOS) {
                                    
                    if (config.fullscreen !== false) {
                        tag = Ext.get(document.createElement('meta'));
                        tag.set({
                            name: 'apple-mobile-web-app-capable',
                            content: 'yes'
                        });
                        head.appendChild(tag);

                        if (Ext.isString(config.statusBarStyle)) {
                            tag = Ext.get(document.createElement('meta'));
                            tag.set({
                                name: 'apple-mobile-web-app-status-bar-style',
                                content: config.statusBarStyle
                            });
                            head.appendChild(tag);
                        }
                    }
                    
                    
                    if (config.tabletStartupScreen && Ext.is.iPad) {
                        tag = Ext.get(document.createElement('link'));
                        tag.set({
                            rel: 'apple-touch-startup-image',
                            href: config.tabletStartupScreen
                        }); 
                        head.appendChild(tag);                  
                    }
                    
                    if (config.phoneStartupScreen && !Ext.is.iPad) {
                        tag = Ext.get(document.createElement('link'));
                        tag.set({
                            rel: 'apple-touch-startup-image',
                            href: config.phoneStartupScreen
                        });
                        head.appendChild(tag);
                    }
                    
                    
                    if (config.icon) {
                        config.phoneIcon = config.tabletIcon = config.icon;
                    }
                    
                    precomposed = (config.glossOnIcon === false) ? '-precomposed' : '';
                    if (Ext.is.iPad && Ext.isString(config.tabletIcon)) {
                        tag = Ext.get(document.createElement('link'));
                        tag.set({
                            rel: 'apple-touch-icon' + precomposed,
                            href: config.tabletIcon
                        });
                        head.appendChild(tag);
                    } 
                    else if (!Ext.is.iPad && Ext.isString(config.phoneIcon)) {
                        tag = Ext.get(document.createElement('link'));
                        tag.set({
                            rel: 'apple-touch-icon' + precomposed,
                            href: config.phoneIcon
                        });
                        head.appendChild(tag);
                    }
                }
            }

            if (Ext.isFunction(config.onReady)) {
                Ext.onReady(function() {
                    var args = arguments;
                    if (config.fullscreen !== false) {
                        Ext.stretchEl = Ext.getBody().createChild({
                            cls: 'x-body-stretcher'
                        });                        
                        Ext.stretchEl.setSize(window.innerWidth, window.innerHeight);
                        Ext.hideAddressBar(function() {
                            if (Ext.is.Android) {
                                setInterval(function() {
                                   window.scrollTo(0, Ext.is.Android ? 1 : 0);
                                }, 250);
                            }
                            else {
                                document.body.addEventListener('touchstart', function() {
                                    Ext.hideAddressBar();
                                }, true);
                            }
                            config.onReady.apply(this, args);
                        }, this);
                    }
                    else {
                        config.onReady.apply(this, args);
                    }
                }, config.scope);
            }
        }
    },
    
    hideAddressBar : function(callback, scope) {
        setTimeout(function() {
            window.scrollTo(0, Ext.is.Android ? 1 : 0);
            if (callback) {
                setTimeout(function() {
                    callback.apply(scope || this);                
                }, 300);    
            }
        }, 100);
    },
    
     
    getDom : function(el) {
        if (!el || !document) {
            return null;
        }

        return el.dom ? el.dom : (typeof el == 'string' ? document.getElementById(el) : el);
    },
    
    
    removeNode : function(node) {
        if (node && node.parentNode && node.tagName != 'BODY') {
            Ext.EventManager.removeAll(node);
            node.parentNode.removeChild(node);
            delete Ext.cache[node.id];
        }
    }
});


(function() {
    var initExt = function() {
        
        var bd = Ext.getBody(),
            cls = [];
        if (!bd) {
            return false;
        }
        var Is = Ext.is; 
        if (Is.Phone) {
            cls.push('x-phone');
        }
        else if (Is.Tablet) {
            cls.push('x-tablet');
        }
        else if (Is.Desktop) {
            cls.push('x-desktop');
        }
        if (Is.iPad) {
            cls.push('x-ipad');
        }
        if (Is.iOS) {
            cls.push('x-ios');
        }
        if (Is.Android) {
            cls.push('x-android');
        }
        if (cls.length) {
            bd.addClass(cls);
        }
        return true;
    };

    if (!initExt()) {
        Ext.onReady(initExt);
    }
})();


Ext.util.TapRepeater = Ext.extend(Ext.util.Observable, {

    constructor: function(el, config) {
        this.el = Ext.get(el);

        Ext.apply(this, config);

        this.addEvents(
        
        "touchstart",
        
        "tap",
        
        "touchend"
        );

        this.el.on({
            touchstart: this.onTouchStart,
            touchend: this.onTouchEnd,
            scope: this
        });

        if (this.preventDefault || this.stopDefault) {
            this.el.on('tap', this.eventOptions, this);
        }

        Ext.util.TapRepeater.superclass.constructor.call(this);
    },

    interval: 10,
    delay: 250,
    preventDefault: true,
    stopDefault: false,
    timer: 0,

    
    eventOptions: function(e) {
        if (this.preventDefault) {
            e.preventDefault();
        }
        if (this.stopDefault) {
            e.stopEvent();
        }
    },

    
    destroy: function() {
        Ext.destroy(this.el);
        this.purgeListeners();
    },

    
    onTouchStart: function(e) {
        clearTimeout(this.timer);
        if (this.pressClass) {
            this.el.addClass(this.pressClass);
        }
        this.tapStartTime = new Date();

        this.fireEvent("touchstart", this, e);
        this.fireEvent("tap", this, e);

        
        if (this.accelerate) {
            this.delay = 400;
        }
        this.timer = Ext.defer(this.tap, this.delay || this.interval, this, [e]);
    },

    
    tap: function(e) {
        this.fireEvent("tap", this, e);
        this.timer = Ext.defer(this.tap, this.accelerate ? this.easeOutExpo(Ext.util.Date.getElapsed(this.tapStartTime),
            400,
            -390,
            12000) : this.interval, this, [e]);
    },

    
    
    easeOutExpo: function(t, b, c, d) {
        return (t == d) ? b + c : c * ( - Math.pow(2, -10 * t / d) + 1) + b;
    },

    
    onTouchEnd: function(e) {
        clearTimeout(this.timer);
        this.el.removeClass(this.pressClass);
        this.fireEvent("touchend", this, e);
    }
});











if (!this.JSON) {
    this.JSON = {};
}

(function () {

    function f(n) {
        
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {






        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {



        var i,          
            k,          
            v,          
            length,
            mind = gap,
            partial,
            value = holder[key];



        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }




        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }



        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':



            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':





            return String(value);




        case 'object':




            if (!value) {
                return 'null';
            }



            gap += indent;
            partial = [];



            if (Object.prototype.toString.apply(value) === '[object Array]') {




                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }




                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }



            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {



                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }




            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
        return v;
    }



    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {







            var i;
            gap = '';
            indent = '';




            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }



            } else if (typeof space === 'string') {
                indent = space;
            }




            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }




            return str('', {'': value});
        };
    }




    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {




            var j;

            function walk(holder, key) {




                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }






            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }














            if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {






                j = eval('(' + text + ')');




                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }



            throw new SyntaxError('JSON.parse');
        };
    }
}());


Ext.util.JSON = {
    encode : function(o) {
        return JSON.stringify(o);
    },

    decode : function(s) {
        return JSON.parse(s);
    }
};


Ext.encode = Ext.util.JSON.encode;

Ext.decode = Ext.util.JSON.decode;

Ext.util.JSONP = {

    
    queue: [],

    
    current: null,

    
    request : function(o) {
        o = o || {};
        if (!o.url) {
            return;
        }

        var me = this;
        o.params = o.params || {};
        if (o.callbackKey) {
            o.params[o.callbackKey] = 'Ext.util.JSONP.callback';
        }
        var params = Ext.urlEncode(o.params);

        var script = document.createElement('script');
        script.type = 'text/javascript';

        this.queue.push({
            url: o.url,
            script: script,
            callback: o.callback || function(){},
            scope: o.scope || window,
            params: params || null
        });

        if (!this.current) {
            this.next();
        }
    },

    
    next : function() {
        this.current = null;
        if (this.queue.length) {
            this.current = this.queue.shift();
            this.current.script.src = this.current.url + (this.current.params ? ('?' + this.current.params) : '');
            document.getElementsByTagName('head')[0].appendChild(this.current.script);
        }
    },

    
    callback: function(json) {
        this.current.callback.call(this.current.scope, json);
        document.getElementsByTagName('head')[0].removeChild(this.current.script);
        this.next();
    }
};


Ext.util.Scroller = Ext.extend(Ext.util.Observable, {
    
    bounces: (Ext.is.Android || Ext.is.Blackberry) ? false : true,

    momentumResetTime: (Ext.is.Android || Ext.is.Blackberry) ? 1000 : 100,

    
    friction: 0.3,
    acceleration: 25,

    
    momentum: Ext.is.Blackberry ? false : true,

    
    horizontal: false,

    
    vertical: true,

    
    snap: false,

    
    scrollbars: true,

    
    fps: 60,

    
    springTension: 0.3,

    
    ui: 'dark',

    
    scrollToEasing : 'cubic-bezier(0.4, .75, 0.5, .95)',
    
    scrollToDuration: 300,

    
    snapDuration: 150,
    
    
    preventActualScroll: false,
    
    translateOpen: (Ext.is.Android || Ext.is.Blackberry)  ? 'translate(' : 'translate3d(',
    translateClose: (Ext.is.Android || Ext.is.Blackberry) ? ')' : ', 0px)',

    
         
    
    constructor : function(el, config) {
        el = Ext.get(el);
        
        var me = this,
            scroller = Ext.ScrollManager.get(el.id);        
        if (scroller) {
            return Ext.apply(scroller, config);
        }
                
        config = config || {};
        Ext.apply(me, config);

        me.addEvents(
            
            'scrollstart',
            
            'scrollend',
            
            'scroll'
        );

        Ext.util.Scroller.superclass.constructor.call(me);

        scroller = me.scroller = this.el = el;
        this.id = el.id;
        
        Ext.ScrollManager.register(this);
        
        scroller.addClass('x-scroller');
        me.parent = scroller.parent();
        me.parent.addClass('x-scroller-parent');

        me.offset = {x: 0, y: 0};        
        me.omega = 1 - (me.friction / 10);
        
        
        
        var eventTarget = me.eventTarget ? Ext.get(me.eventTarget) : me.parent;
        eventTarget.on({
            touchstart: me.onTouchStart,
            scrollstart: me.onScrollStart,
            scroll: me.onScroll,
            scrollend: me.onScrollEnd,
            horizontal: me.horizontal,
            vertical: me.vertical,
            scope: me
        });

        if (me.bounces !== false) {
            var both = me.bounces === 'both' || me.bounces === true,
                horizontal = both || me.bounces === 'horizontal',
                vertical = both || me.bounces === 'vertical';

            me.bounces = {
                horizontal: horizontal,
                vertical: vertical
            };
        }

        if (me.scrollbars) {
            if (me.horizontal) {
                me.scrollbarX = new Ext.util.Scroller.Scrollbar(me, 'horizontal');
            }

            if (me.vertical) {
                me.scrollbarY = new Ext.util.Scroller.Scrollbar(me, 'vertical');
            }
        }
     
        me.scroller.on({
            'webkitTransitionEnd': me.onTransitionEnd,
            scope: me
        });
        return me;
    },

    
    onTouchStart : function(e) {
        var me = this,
            scroller = me.scroller,
            style = scroller.dom.style,
            transform;

        
        if (!e || e.touches.length > 1) {
            return;
        }
        
        me.updateBounds();
        me.followTouch = e.touch;

        if (me.animating) {
            clearInterval(me.scrollInterval);
            
            
            if (me.inTransition) {
                transform = new WebKitCSSMatrix(window.getComputedStyle(scroller.dom).webkitTransform);
                style.webkitTransitionDuration = '0ms';
                style.webkitTransform = me.translateOpen + transform.m41 + 'px, ' + transform.m42 + 'px' + me.translateClose;

                me.offset = {
                    x: transform.m41,
                    y: transform.m42
                };
                me.inTransition = false;
            }

            me.snapToBounds(false);

            if (me.scrollbarX) {
                me.scrollbarX.stop();
            }
            if (me.scrollbarY) {
                me.scrollbarY.stop();
            }

            me.animating = false;
            me.doScrollEnd();
        }

        if (me.momentum) {
            me.resetMomentum(e);
        }
    },

    
    onScrollStart : function(e, t) {
        var me = this;
        
        
        
        
        if (!e || e.touch != me.followTouch) {
            return;
        }

        if (me.momentum) {
            me.addMomentum(e);
        }

        me.fireEvent('scrollstart', me, e);
    },

    
    onScroll : function(e, t) {
        var me = this;
        
        if (!e || e.touch != me.followTouch) {
            return;
        }

        e.stopEvent();

        var previousDeltaX = e.previousDeltaX,
            previousDeltaY = e.previousDeltaY,
            newX = me.horizontal ? (me.offset.x + previousDeltaX) : 0,
            newY = me.vertical ? (me.offset.y + previousDeltaY) : 0,
            boundsPos = me.constrainToBounds({x: newX, y: newY}),
            pos;

        me.bouncing = {
            x: false,
            y: false
        };
        
        
        if (me.bounces) {
            if (me.bounces.horizontal && boundsPos.x != newX) {
                newX = me.offset.x + (previousDeltaX / 2);
                me.bouncing.x = true;
            }
            else {
                newX = boundsPos.x;
            }
            
            if (me.bounces.vertical && boundsPos.y != newY) {
                newY = me.offset.y + (previousDeltaY / 2);
                me.bouncing.y = true;
            }
            else {
                newY = boundsPos.y;
            }

            pos = {x: newX, y: newY};
        }
        else {
            pos = boundsPos;
        }

        
        me._scrollTo(pos);

        if (me.momentum) {
            
            me.addMomentum(e);
        }
    },

    doScrollEnd : function() {
        var me = this;
        if (me.scrollbarX) {
            me.scrollbarX.hide(true);
        }
        if (me.scrollbarY) {
            me.scrollbarY.hide(true);
        }
        me.fireEvent('scrollend', me, me.getOffset());
    },
    
    
    
    onScrollEnd : function(e, t) {
        var me = this;
        
        if (e.touch != me.followTouch) {
            return;
        }

        
        if (me.momentum) {
            me.validateMomentum(e);
            if (me.momentumPoints.length > 1) {
                var momentum = me.momentumPoints,

                    
                    oldestMomentum = momentum.shift(),
                    latestMomentum = momentum.pop(),

                    
                    distance = {
                        x: latestMomentum.offset.x - oldestMomentum.offset.x,
                        y: latestMomentum.offset.y - oldestMomentum.offset.y
                    },

                    
                    duration = (latestMomentum.time - oldestMomentum.time),

                    
                    velocity = {
                        x: distance.x / (duration / me.acceleration),
                        y: distance.y / (duration / me.acceleration)
                    };
                me.applyVelocity(velocity);
            }
        }

        
        if (!me.animating) {
            me.snapToBounds(true);
        }

        
        
        if (!me.animating) {
            me.doScrollEnd();
        }
    },

    
    onTransitionEnd : function() {
        var me = this;
        
        if (me.inTransition) {
            me.scroller.dom.style.webkitTransitionDuration = '0ms';
            me.inTransition = false;
            me.animating = false;
            me.doScrollEnd();
        }
    },

    
    scrollTo : function(pos, animate, easing) {
        var me = this;
        
        
        pos = me.constrainToBounds({x: Math.round(-pos.x || 0), y: Math.round(-pos.y || 0)});
        clearInterval(me.scrollInterval);
        
        if (me.offset.x == pos.x && me.offset.y == pos.y) {
            return false;
        }
        
        if (animate && !me.preventActualScroll) {
            me.animating = true;
            me.inTransition = true;

            
            
            var style = me.scroller.dom.style;
            style.webkitTransitionTimingFunction = easing || me.scrollToEasing;
            style.webkitTransitionDuration = (typeof animate == 'number') ? (animate + 'ms') : (me.scrollToDuration + 'ms');
            style.webkitTransform = me.translateOpen + pos.x + 'px, ' + pos.y + 'px' + me.translateClose;

            me.offset = pos;

            if (me.scrollbarX) {
                me.scrollbarX.scrollTo(pos, animate, easing || me.scrollToEasing);
            }

            if (me.scrollbarY) {
                me.scrollbarY.scrollTo(pos, animate, easing || me.scrollToEasing);
            }
        }
        else {
            me._scrollTo({x: pos.x, y: pos.y});
            me.doScrollEnd();
        }
        return me;
    },

    
    _scrollTo : function(pos) {
        var me = this;
        me.offset = {x: Math.round(pos.x), y: Math.round(pos.y)};

        if (!me.preventActualScroll) {
            var style = me.scroller.dom.style;
            style.webkitTransitionDuration = '0ms';        
            style.webkitTransform = me.translateOpen + me.offset.x + 'px, ' + me.offset.y + 'px' + me.translateClose;

            if (me.scrollbarX) {
                me.scrollbarX.scrollTo(me.offset);
            }

            if (me.scrollbarY) {
                me.scrollbarY.scrollTo(me.offset);
            }            
        }

        me.fireEvent('scroll', me, me.getOffset());
    },
    
        
    getOffset : function() {
        return {x: -this.offset.x, y: -this.offset.y};
    },

    
    applyVelocity : function(velocity) {
        velocity = velocity || {x: 0, y: 0};

        var me = this,
            offset = me.offset,
            currentTime = (new Date()).getTime(),
            deceleration = me.deceleration = {
                startTime: currentTime,
                startOffset: {
                    x: offset.x,
                    y: offset.y
                },
                logFriction: Math.log(me.omega),
                velocity: velocity
            },
            
            pos = me.constrainToBounds(offset),
            bounce = me.bounce = {};

        
        me.decelerating = true;
        me.bouncing = {x: false, y: false};
        
        if (me.bounces) {
            if (me.bounces.horizontal && pos.x != offset.x) {
                bounce.horizontal = {
                    startTime: currentTime - ((1 / me.springTension) * me.acceleration),
                    startOffset: pos.x,
                    velocity: (offset.x - pos.x) * me.springTension * Math.E
                };
                velocity.x = 0;
                me.bouncing.x = true;                
            }
            if (me.bounces.vertical && pos.y != offset.y) {
                bounce.vertical = {
                    startTime: currentTime - ((1 / me.springTension) * me.acceleration),
                    startOffset: pos.y,
                    velocity: (offset.y - pos.y) * me.springTension * Math.E
                };
                velocity.y = 0;
                me.bouncing.y = true;
            }
        }

        me.animating = true;
        me.decelerating = true;
        
        me.scrollInterval = setInterval(function() {
            me.handleScrollFrame();
        }, 1000 / this.fps);
    },

    
    handleScrollFrame : function() {        
        
        var me = this,
            deceleration = me.deceleration,
            bounce = me.bounce = me.bounce || {},
            offset = me.offset,

            currentTime = (new Date()).getTime(),
            deltaTime = (currentTime - deceleration.startTime),
            powFriction = Math.pow(me.omega, deltaTime / me.acceleration),

            currentVelocity = {
                x: deceleration.velocity.x * powFriction,
                y: deceleration.velocity.y * powFriction
            },

            newPos = {x: offset.x, y: offset.y},
            deltaOffset = {},
            powTime, startOffset, boundsPos;

        if (Math.abs(currentVelocity.x) < 1 && Math.abs(currentVelocity.y) < 1) {
            me.decelerating = false;
        }

        if (!bounce.horizontal && Math.abs(currentVelocity.x) >= 1) {
            deltaOffset.x = (
                (deceleration.velocity.x / deceleration.logFriction) -
                (deceleration.velocity.x * (powFriction / deceleration.logFriction))
            );
            newPos.x = deceleration.startOffset.x - deltaOffset.x;
        }

        if (!bounce.vertical && Math.abs(currentVelocity.y) >= 1) {
            deltaOffset.y = (
                (deceleration.velocity.y / deceleration.logFriction) -
                (deceleration.velocity.y * (powFriction / deceleration.logFriction))
            );
            newPos.y = deceleration.startOffset.y - deltaOffset.y;
        }

        boundsPos = me.constrainToBounds(newPos);

        if (boundsPos.x != newPos.x) {
            if (me.bounces && me.bounces.horizontal) {
                if (!bounce.horizontal) {
                    bounce.horizontal = {
                        startTime: currentTime,
                        startOffset: boundsPos.x,
                        velocity: currentVelocity.x
                    };
                    me.bouncing.x = true;
                }
            }
            else {
                newPos.x = boundsPos.x;
            }
            deceleration.velocity.x = 0;
        }

        if (boundsPos.y != newPos.y) {
            if (me.bounces && me.bounces.vertical) {
                if (!bounce.vertical) {
                    bounce.vertical = {
                        startTime: currentTime,
                        startOffset: boundsPos.y,
                        velocity: currentVelocity.y
                    };
                    me.bouncing.y = true;
                }
            }
            else {
                newPos.y = boundsPos.y;
            }
            deceleration.velocity.y = 0;
        }

        if (bounce.horizontal && bounce.horizontal.startTime != currentTime) {
            deltaTime = (currentTime - bounce.horizontal.startTime);
            powTime = (deltaTime / me.acceleration) * Math.pow(Math.E, -me.springTension * (deltaTime / me.acceleration));
            deltaOffset.x = bounce.horizontal.velocity * powTime;
            startOffset = bounce.horizontal.startOffset;

            if (Math.abs(deltaOffset.x) <= 1) {
                deltaOffset.x = 0;
                delete bounce.horizontal;
            }
            newPos.x = startOffset + deltaOffset.x;
        }

        if (bounce.vertical && bounce.vertical.startTime != currentTime) {
            deltaTime = (currentTime - bounce.vertical.startTime);
            powTime = (deltaTime / me.acceleration) * Math.pow(Math.E, -me.springTension * (deltaTime / me.acceleration));
            deltaOffset.y = bounce.vertical.velocity * powTime;
            startOffset = bounce.vertical.startOffset;

            if (Math.abs(deltaOffset.y) <= 1) {
                deltaOffset.y = 0;
                delete bounce.vertical;
            }
            newPos.y = startOffset + deltaOffset.y;
        }

        if (!bounce.vertical && !bounce.horizontal) {
            me.bouncing = {x: false, y: false};
        }

        me._scrollTo(newPos);
        
        if ((!me.bounces || (!me.bouncing.x && !me.bouncing.y)) && !me.decelerating) {
            clearInterval(me.scrollInterval);
            me.animating = false;
            me.snapToBounds(false);
            if (!this.animating) {
                me.doScrollEnd();
            }            
            return;
        }        
    },

    setSnap : function(snap) {
        this.snap = snap;
    },
    
    
    snapToBounds : function(animate, easing) {
        var me = this,
            pos = me.constrainToBounds(me.offset);
            
        if (me.snap) {
            if (me.snap === true) {
                me.snap = {
                    x: 50,
                    y: 50
                };
            }
            else if (Ext.isNumber(me.snap)) {
                me.snap = {
                    x: me.snap,
                    y: me.snap
                };
            }
            if (me.snap.y) {
                pos.y = Math.round(pos.y / me.snap.y) * me.snap.y;
            }
            if (me.snap.x) {
                pos.x = Math.round(pos.x / me.snap.x) * me.snap.x;
            }
        }

        if (pos.x != me.offset.x || pos.y != me.offset.y) {
            if (me.snap) {
                me.scrollTo({x: -pos.x, y: -pos.y}, me.snapDuration, 'ease-in-out');
            }
            else if (animate) {
                me.applyVelocity();
            }
            else {
                me._scrollTo(pos);
            }
        }
    },

    
    updateBounds : function(scrollIntoView) {
        var me = this;
        
        me.parentSize = {
            width: me.parent.getWidth(true),
            height: me.parent.getHeight(true)
        };

        me.contentSize = {
            width: me.scroller.dom.scrollWidth,
            height: me.scroller.dom.scrollHeight
        };

        
        me.size = {
            width: Math.max(me.contentSize.width, me.parentSize.width),
            height: Math.max(me.contentSize.height, me.parentSize.height)
        };

        
        me.bounds = {
            x: me.parentSize.width - me.size.width,
            y: me.parentSize.height - me.size.height
        };        

                
        if (scrollIntoView) {
            if (this.scrollTo(me.getOffset()) !== false) {
                me.doScrollEnd();
            }            
        }
        
        if (me.scrollbarX) {
            me.scrollbarX.update();
        }
        
        if (me.scrollbarY) {
            me.scrollbarY.update();
        }
    },

    
    constrainToBounds : function(pos) {
        if (!this.bounds) {
            this.updateBounds();
        }
        return {
            x: Math.min(Math.max(this.bounds.x, pos.x), 0),
            y: Math.min(Math.max(this.bounds.y, pos.y), 0)
        };
    },

    
    resetMomentum : function(e) {
        this.momentumPoints = [];
        if (e) {
            this.addMomentum(e);
        }
    },

    
    addMomentum : function(e) {
        var me = this;
        me.validateMomentum(e);
        me.momentumPoints.push({
            time: e.time,
            offset: {x: me.offset.x, y: me.offset.y}
        });  
    },

    
    validateMomentum : function(e) {
        var momentum = this.momentumPoints,
            time = e.time;

        while (momentum.length) {
            if (time - momentum[0].time <= this.momentumResetTime) {
                break;
            }
            momentum.shift();
        }        
    },

    destroy : function() {
        var me = this;
        
        me.scroller.removeClass('x-scroller');
        me.parent.removeClass('x-scroller-parent');

        me.parent.un({
            touchstart: me.onTouchStart,
            scrollstart: me.onScrollStart,
            scrollend: me.onScrollEnd,
            scroll: me.onScroll,
            horizontal: me.horizontal,
            vertical: me.vertical,
            scope: me
        });

        clearInterval(me.scrollInterval);

        if (me.scrollbars) {
            if (me.horizontal) {
                me.scrollbarX.destroy();
            }

            if (me.vertical) {
                me.scrollbarY.destroy();
            }
        }

        me.scroller.un({
            'DOMSubtreeModified': me.updateBounds,
            'webkitTransitionEnd': me.onTransitionEnd,
            scope: me
        });
        
        Ext.ScrollManager.unregister(this);
    }
});

Ext.ScrollManager = new Ext.AbstractManager();


Ext.util.Scroller.Scrollbar = Ext.extend(Object, {
    minSize: 4,
    size: 0,
    offset: 10,

    translateOpen: (Ext.is.Android || Ext.is.Blackberry)  ? 'translate(' : 'translate3d(',
    translateClose: (Ext.is.Android || Ext.is.Blackberry) ? ')' : ', 0px)',
    
    
    constructor : function(scroller, direction) {
        var me = this;
        
        me.scroller = scroller;
        me.container = scroller.parent;
        me.direction = direction;
        me.bar = me.container.createChild({
            cls: 'x-scrollbar x-scrollbar-' + direction + ' x-scrollbar-' + scroller.ui
        });
        me.bar.on('webkitTransitionEnd', this.onTransitionEnd, this);
        me.hide();
    },

    destroy : function() {
        this.bar.un('webkitTransitionEnd', this.onTransitionEnd, this);
        this.bar.remove();
    },

    
    update : function() {
        var me = this,
            scroller = me.scroller,
            contentSize = scroller.contentSize,
            parentSize = scroller.parentSize,
            size = scroller.size,
            height, width;
            
        if (me.direction == 'vertical') {
            
            if (contentSize.height > parentSize.height) {
                me.size = Math.round((parentSize.height * parentSize.height) / size.height);
                me.autoShow = true;
            }
            else {
                me.autoShow = false;
            }
        }
        else {
            if (contentSize.width > parentSize.width) {
                me.size = Math.round((parentSize.width * parentSize.width) / size.width);
                me.autoShow = true;
            }
            else {
                me.autoShow = false;
            }
        }
    },
    
    
    scrollTo : function(pos, animate, easing) {
        var me = this,
            scroller = me.scroller,
            style = me.bar.dom.style,
            transformX = 0,
            transformY = 0,
            size = me.size,
            boundsPos;

        if (!me.autoShow) {
            return;
        }
        
        if (me.hideTimeout) {
            clearTimeout(me.hideTimeout);
            me.hideTimeout = null;
        }
        
        if (me.hidden) {
            me.show();
        }

        if (me.direction == 'horizontal') {
            if (scroller.bouncing && scroller.bouncing.x) {
                boundsPos = scroller.constrainToBounds(pos);
                size = Math.max(size - Math.abs(pos.x - boundsPos.x), me.minSize);
                if (pos.x >= 0) {
                    transformX = boundsPos.x + me.offset;
                }
                else  {
                    transformX = scroller.parentSize.width - size - me.offset;
                }
                style.width = size + 'px';
                me.resized = true;
            }
            else {
                transformX = ((scroller.parentSize.width - size - (me.offset * 2)) / scroller.bounds.x * scroller.offset.x) + me.offset;
                if (me.resized == undefined || me.resized) {
                    style.width = size + 'px';
                    me.resized = false;
                }
            }
        }
        else {
            if (scroller.bouncing && scroller.bouncing.y) {
                boundsPos = scroller.constrainToBounds(pos);
                size = Math.max(size - Math.abs(pos.y - boundsPos.y), me.minSize);
                if (pos.y >= 0) {
                    transformY = boundsPos.y + me.offset;
                }
                else {
                    transformY = scroller.parentSize.height - size - me.offset;
                }
                style.height = size + 'px';
                me.resized = true;
            }
            else {
                transformY = ((scroller.parentSize.height - size - (me.offset * 2)) / scroller.bounds.y * scroller.offset.y) + me.offset;
                if (me.resized == undefined || me.resized) {
                    style.height = size + 'px';
                    me.resized = false;
                }
            }
        }

        if (animate) {
            style.webkitTransitionDuration = (typeof animate == 'number' ? animate : scroller.scrollToDuration) + 'ms, 0ms';
            style.webkitTransitionTimingFunction = easing;
            me.inTransition = true;
        }
        else {
            style.webkitTransitionDuration = '';
            me.inTransition = false;
        }
        style.webkitTransform = me.translateOpen + transformX + 'px, ' + transformY + 'px' + this.translateClose;
    },

    
    hide : function(delay) {
        var me = this;        
        if (delay) {
            me.hideTimeout = setTimeout(function() {
                me.bar.setStyle('opacity', '0');
                me.hidden = true;
                me.hideTimeout = null;           
            }, 1000);
        }
        else {
            me.bar.setStyle('opacity', '0');
            me.hidden = true;
        }
    },

    
    show : function() {
        this.bar.setStyle('opacity', '1');
        this.hidden = false;
    },

    onTransitionEnd: function() {
        this.inTransition = false;
    },
    
    
    stop : function() {
        var me = this,
            style = me.bar.dom.style,
            transform;

        if (this.inTransition) {
            style.webkitTransitionDuration = '';
            transform = new WebKitCSSMatrix(window.getComputedStyle(me.bar.dom).webkitTransform);
            style.webkitTransform = me.translateOpen + transform.m41 + 'px, ' + transform.m42 + 'px' + me.translateClose;
        }
    }
});


Ext.util.Draggable = Ext.extend(Ext.util.Observable, {
    baseCls: 'x-draggable',
    dragCls: 'x-dragging',
    proxyCls: 'x-draggable-proxy',

    
    direction: 'both',

    
    delay: 0,

    
    cancelSelector: null,

    
    disabled: false,

    
    revert: false,

    
    constrain: window,

    
    group: 'base',

    
    grid: null,
    snap: null,
    proxy: null,
    stack: false,


    
    
    constrainRegion: null,

    
    dragging: false,

    
    vertical: false,

    
    horizontal: false,

    
    threshold: 0,

    translateOpen: (Ext.is.Android || Ext.is.Blackberry)  ? 'translate(' : 'translate3d(',
    translateClose: (Ext.is.Android || Ext.is.Blackberry) ? ')' : ', 0px)',
    
    
    constructor : function(el, config) {
        config = config || {};
        Ext.apply(this, config);

        this.addEvents(
            
            'dragstart',
            'beforedragend',
            
            'dragend',
            
            'drag'
        );

        this.el = Ext.get(el);

        Ext.util.Draggable.superclass.constructor.call(this);

        if (this.direction == 'both') {
            this.horizontal = true;
            this.vertical = true;
        }
        else if (this.direction == 'horizontal') {
            this.horizontal = true;
        }
        else {
            this.vertical = true;
        }

        this.el.addClass(this.baseCls);

        this.tapEvent = (this.delay > 0) ? 'taphold' : 'tapstart';

        this.initialRegion = {
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
        };
        
        if (!this.disabled) {
            this.enable();
        }
    },

    
    onTapEvent : function(e, t) {
        if (this.cancelSelector && e.getTarget(this.cancelSelector)) {
            return;
        }
        if (!this.dragging) {
            this.canDrag = true;
        }
    },

    
    prepareDrag : function(e) {
        this.reset();

        if (this.constrain) {
            if (this.constrain === window) {
                var w = window.innerWidth,
                    h = window.innerHeight;
                this.constrainRegion = new Ext.util.Region(0, w, h, 0);
            }
            else {
                this.constrainRegion = Ext.fly(this.constrain).getPageBox(true);
            }
        }

        this.startRegion = this.getProxyEl().getPageBox(true);
        
        this.offsetToCorner = {
            x: e.pageX - this.startRegion.left,
            y: e.pageY - this.startRegion.top
        };
    },

    
    onDragStart : function(e) {
        this.prepareDrag(e);

        if (!this.dragging) {
            this.el.addClass(this.dragCls);
            this.dragging = true;
            this.fireEvent('dragstart', this, e);
        }
    },

    
    onTouchMove : function(e) {
        if (!this.canDrag) {
            return;
        }
        if (!this.dragging) {
            if (Math.abs(e.deltaX) >= this.threshold || Math.abs(e.deltaY) >= this.threshold) {
                this.onDragStart(e);
            }
            else {
                return;
            }
        }
        
        var x = 0,
            y = 0,
            initialRegion = this.initialRegion,
            constrainRegion = this.constrainRegion;

        if (this.horizontal) {
            x = e.pageX - this.initialRegion.left - this.offsetToCorner.x;
        }
        if (this.vertical) {
            y = e.pageY - this.initialRegion.top - this.offsetToCorner.y;
        }
        
        if (this.constrain) {
            if (initialRegion.left + x < constrainRegion.left) {
                x = constrainRegion.left - initialRegion.left;
            }
            if (initialRegion.right + x > constrainRegion.right) {
                x = constrainRegion.right - initialRegion.right;
            }
            if (initialRegion.top + y < constrainRegion.top) {
                y = constrainRegion.top - initialRegion.top;
            }
            if (initialRegion.bottom + y > constrainRegion.bottom) {
                y = constrainRegion.bottom - initialRegion.bottom;
            }
        }

        this.transformTo(x, y);
        this.fireEvent('drag', this, e);
    },

    
    transformTo : function(x, y) {
        var me = this,
            proxyEl       = me.getProxyEl(),
            initialRegion = me.initialRegion,
            startPos      = me.startPosition || {x: 0, y: 0};

        proxyEl.dom.style.webkitTransform = me.translateOpen + x + 'px, ' + y + 'px' + me.translateClose;

        me.transform = {x: x, y: y};
        me.position = {
            x: startPos.x + x,
            y: startPos.y + y
        };

        me.region = new Ext.util.Region(
            initialRegion.top + y,
            initialRegion.right + x,
            initialRegion.bottom + y,
            initialRegion.left + x
        );
    },

    
    moveTo : function(x, y) {
        this.transformTo(x - this.initialRegion.left, y - this.initialRegion.top);
    },

    
    reset : function() {
        var proxyEl = this.getProxyEl();

        this.startPosition = this.position = {
            x: proxyEl.getLeft() || 0,
            y: proxyEl.getTop() || 0
        };
        this.transformTo(0, 0);
        this.initialRegion = this.region = proxyEl.getPageBox(true);
        this.transform = {x: 0, y: 0};
    },

    
    onTouchEnd : function(e) {
        this.canDrag = false;
        this.dragging = false;
        this.fireEvent('beforedragend', this, e);

        var proxyEl = this.getProxyEl();

        if (this.revert && !this.cancelRevert && this.transform) {
            new Ext.Anim({
                from: {
                    '-webkit-transform': 'translate3d(' + this.transform.x + 'px, ' + this.transform.y + 'px, 0px)'
                },
                to: {
                    '-webkit-transform': 'translate3d(0px, 0px, 0px)'
                },
                duration: 200
            }).run(proxyEl);
        }
        else if (this.transform) {
            var style    = proxyEl.dom.style,
                position = this.position;

            style.webkitTransform = null;
            style.left = position.x + 'px';
            style.top = position.y + 'px';
        }

        this.transform = this.startPosition = null;
        this.el.removeClass(this.dragCls);

        this.fireEvent('dragend', this, e);
    },

    
    enable : function() {
        this.el.on(this.tapEvent, this.onTapEvent, this, {
            horizontal: this.horizontal,
            vertical  : this.vertical
        });
        
        this.el.on({
            touchmove: this.onTouchMove,
            touchend: this.onTouchEnd,
            scope: this
        });

        this.disabled = false;
    },

    
    disable : function() {
        this.el.un(this.tapEvent, this.onTapEvent, this);
        this.disabled = true;
    },

    
    destroy : function() {
        this.el.removeClass(this.baseCls);
        this.purgeListeners();
        this.el.un(this.tapEvent, this.onTapEvent, this, {holdThreshold: this.delay});
        this.el.un({
            touchmove: this.onTouchMove,
            touchend: this.onTouchEnd,
            scope: this
        });
    },

    
    getProxyEl: function() {
        return this.proxy || this.el;
    }
});


Ext.util.Droppable = Ext.extend(Ext.util.Observable, {
    baseCls: 'x-droppable',
    
    activeCls: 'x-drop-active',
    
    invalidCls: 'x-drop-invalid',
    
    hoverCls: 'x-drop-hover',

    
    validDropMode: 'intersect',

    
    disabled: false,

    
    group: 'base',

    
    tolerance: null,


    
    constructor : function(el, config) {
        config = config || {};
        Ext.apply(this, config);

        this.addEvents(
            
            'dropactivate',

            
            'dropdeactivate',

            
            'dropenter',

            
            'dropleave',

            
            'drop'
        );

        this.el = Ext.get(el);
        Ext.util.Droppable.superclass.constructor.call(this);

        if (!this.disabled) {
            this.enable();
        }

        this.el.addClass(this.baseCls);
    },

    
    onDragStart : function(draggable, e) {
        if (draggable.group === this.group) {
            this.monitoring = true;
            this.el.addClass(this.activeCls);
            this.region = this.el.getPageBox(true);

            draggable.on({
                drag: this.onDrag,
                beforedragend: this.onBeforeDragEnd,
                dragend: this.onDragEnd,
                scope: this
            });

            if (this.isDragOver(draggable)) {
                this.setCanDrop(true, draggable, e);
            }

            this.fireEvent('dropactivate', this, draggable, e);
        }
        else {
            draggable.on({
                dragend: function() {
                    this.el.removeClass(this.invalidCls);
                },
                scope: this,
                single: true
            });
            this.el.addClass(this.invalidCls);
        }
    },

    
    isDragOver : function(draggable, region) {
        return this.region[this.validDropMode](draggable.region);
    },

    
    onDrag : function(draggable, e) {
        this.setCanDrop(this.isDragOver(draggable), draggable, e);
    },

    
    setCanDrop : function(canDrop, draggable, e) {
        if (canDrop && !this.canDrop) {
            this.canDrop = true;
            this.el.addClass(this.hoverCls);
            this.fireEvent('dropenter', this, draggable, e);
        }
        else if (!canDrop && this.canDrop) {
            this.canDrop = false;
            this.el.removeClass(this.hoverCls);
            this.fireEvent('dropleave', this, draggable, e);
        }
    },

    
    onBeforeDragEnd: function(draggable, e) {
        draggable.cancelRevert = this.canDrop;
    },

    
    onDragEnd : function(draggable, e) {
        this.monitoring = false;
        this.el.removeClass(this.activeCls);

        draggable.un({
            drag: this.onDrag,
            beforedragend: this.onBeforeDragEnd,
            dragend: this.onDragEnd,
            scope: this
        });


        if (this.canDrop) {
            this.canDrop = false;
            this.el.removeClass(this.hoverCls);
            this.fireEvent('drop', this, draggable, e);
        }

        this.fireEvent('dropdeactivate', this, draggable, e);
    },

    
    enable : function() {
        if (!this.mgr) {
            this.mgr = Ext.util.Observable.observe(Ext.util.Draggable);
        }
        this.mgr.on({
            dragstart: this.onDragStart,
            scope: this
        });
        this.disabled = false;
    },

    
    disable : function() {
        this.mgr.un({
            dragstart: this.onDragStart,
            scope: this
        });
        this.disabled = true;
    }
});


Ext.util.Sortable = Ext.extend(Ext.util.Observable, {
    baseCls: 'x-sortable',

    
    direction: 'vertical',

    
    cancelSelector: null,

    
    
    
    

    
    constrain: window,
    
    group: 'base',

    
    revert: true,

    
    itemSelector: null,

    
    handleSelector: null,

    
    disabled: false,

    
    delay: 0,

    

    
    sorting: false,

    
    vertical: false,

    
    horizontal: false,

    constructor : function(el, config) {
        config = config || {};
        Ext.apply(this, config);

        this.addEvents(
            
            'sortstart',
            
            'sortend',
            
            'sortchange'

            
            
            
            
            
            
            
            
        );

        this.el = Ext.get(el);
        Ext.util.Sortable.superclass.constructor.call(this);

        if (this.direction == 'horizontal') {
            this.horizontal = true;
        }
        else if (this.direction == 'vertical') {
            this.vertical = true;
        }
        else {
            this.horizontal = this.vertical = true;
        }

        this.el.addClass(this.baseCls);
        this.tapEvent = (this.delay > 0) ? 'taphold' : 'tapstart';
        if (!this.disabled) {
            this.enable();
        }
    },

    
    onTapEvent : function(e, t) {
        if (this.cancelSelector && e.getTarget(this.cancelSelector)) {
            return;
        }
        if (this.handleSelector && !e.getTarget(this.handleSelector)) {
            return;
        }
        
        if (!this.sorting) {
            var item = e.getTarget(this.itemSelector);
            if (item) {
                this.onSortStart(e, item);
            }
        }
    },

    
    onSortStart : function(e, t) {
        this.sorting = true;
        var draggable = new Ext.util.Draggable(t, {
            delay: this.delay,
            revert: this.revert,
            direction: this.direction,
            constrain: this.constrain === true ? this.el : this.constrain
        });
        draggable.on({
            drag: this.onDrag,
            dragend: this.onDragEnd,
            scope: this
        });

        this.dragEl = t;
        this.calculateBoxes();
        draggable.canDrag = true;
        draggable.onDragStart(e);
        this.fireEvent('sortstart', this, e);
    },

    
    calculateBoxes : function() {
        this.items = [];
        var els = this.el.select(this.itemSelector, false),
            ln = els.length, i, item, el, box;

        for (i = 0; i < ln; i++) {
            el = els[i];
            if (el != this.dragEl) {
                item = Ext.fly(el).getPageBox(true);
                item.el = el;
                this.items.push(item);
            }
        }
    },

    
    onDrag : function(draggable, e) {
        var items = this.items,
            ln = items.length,
            region = draggable.region,
            sortChange = false,
            i, intersect, overlap, item;

        for (i = 0; i < ln; i++) {
            item = items[i];
            intersect = region.intersect(item);
            if (intersect) {
                if (this.vertical && Math.abs(intersect.top - intersect.bottom) > (region.bottom - region.top) / 2) {
                    if (region.bottom > item.top && item.top > region.top) {
                        draggable.el.insertAfter(item.el);
                    }
                    else {
                        draggable.el.insertBefore(item.el);
                    }
                    sortChange = true;
                }
                else if (this.horizontal && Math.abs(intersect.left - intersect.right) > (region.right - region.left) / 2) {
                    if (region.right > item.left && item.left > region.left) {
                        draggable.el.insertAfter(item.el);
                    }
                    else {
                        draggable.el.insertBefore(item.el);
                    }
                    sortChange = true;
                }

                if (sortChange) {
                    
                    draggable.reset();

                    
                    
                    draggable.moveTo(region.left, region.top);

                    
                    this.calculateBoxes();
                    this.fireEvent('sortchange', this, draggable.el, this.el.select(this.itemSelector, false).indexOf(draggable.el.dom));
                    return;
                }
            }
        }
    },

    
    onDragEnd : function(draggable, e) {
        draggable.destroy();
        this.sorting = false;
        this.fireEvent('sortend', this, draggable, e);
    },

    
    enable : function() {
        this.el.on(this.tapEvent, this.onTapEvent, this, {holdThreshold: this.delay});
        this.disabled = false;
    },

    
    disable : function() {
        this.el.un(this.tapEvent, this.onTapEvent, this);
        this.disabled = true;
    }
});





 (function() {

    
    Date.useStrict = false;


    
    
    
    function xf(format) {
        var args = Array.prototype.slice.call(arguments, 1);
        return format.replace(/\{(\d+)\}/g,
        function(m, i) {
            return args[i];
        });
    }


    
    Date.formatCodeToRegex = function(character, currentGroup) {
        
        var p = Date.parseCodes[character];

        if (p) {
            p = typeof p == 'function' ? p() : p;
            Date.parseCodes[character] = p;
            
        }

        return p ? Ext.applyIf({
            c: p.c ? xf(p.c, currentGroup || "{0}") : p.c
        },
        p) : {
            g: 0,
            c: null,
            s: Ext.util.Format.escapeRegex(character)
            
        };
    };

    
    var $f = Date.formatCodeToRegex;

    Ext.apply(Date, {
        
        parseFunctions: {
            "M$": function(input, strict) {
                
                
                var re = new RegExp('\\/Date\\(([-+])?(\\d+)(?:[+-]\\d{4})?\\)\\/');
                var r = (input || '').match(re);
                return r ? new Date(((r[1] || '') + r[2]) * 1) : null;
            }
        },
        parseRegexes: [],

        
        formatFunctions: {
            "M$": function() {
                
                return '\\/Date(' + this.getTime() + ')\\/';
            }
        },

        y2kYear: 50,

        
        MILLI: "ms",

        
        SECOND: "s",

        
        MINUTE: "mi",

        
        HOUR: "h",

        
        DAY: "d",

        
        MONTH: "mo",

        
        YEAR: "y",

        
        defaults: {},

        
        dayNames: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
        ],

        
        monthNames: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
        ],

        
        monthNumbers: {
            Jan: 0,
            Feb: 1,
            Mar: 2,
            Apr: 3,
            May: 4,
            Jun: 5,
            Jul: 6,
            Aug: 7,
            Sep: 8,
            Oct: 9,
            Nov: 10,
            Dec: 11
        },

        
        getShortMonthName: function(month) {
            return Date.monthNames[month].substring(0, 3);
        },

        
        getShortDayName: function(day) {
            return Date.dayNames[day].substring(0, 3);
        },

        
        getMonthNumber: function(name) {
            
            return Date.monthNumbers[name.substring(0, 1).toUpperCase() + name.substring(1, 3).toLowerCase()];
        },

        
        formatCodes: {
            d: "Ext.util.Format.leftPad(this.getDate(), 2, '0')",
            D: "Date.getShortDayName(this.getDay())",
            
            j: "this.getDate()",
            l: "Date.dayNames[this.getDay()]",
            N: "(this.getDay() ? this.getDay() : 7)",
            S: "this.getSuffix()",
            w: "this.getDay()",
            z: "this.getDayOfYear()",
            W: "Ext.util.Format.leftPad(this.getWeekOfYear(), 2, '0')",
            F: "Date.monthNames[this.getMonth()]",
            m: "Ext.util.Format.leftPad(this.getMonth() + 1, 2, '0')",
            M: "Date.getShortMonthName(this.getMonth())",
            
            n: "(this.getMonth() + 1)",
            t: "this.getDaysInMonth()",
            L: "(this.isLeapYear() ? 1 : 0)",
            o: "(this.getFullYear() + (this.getWeekOfYear() == 1 && this.getMonth() > 0 ? +1 : (this.getWeekOfYear() >= 52 && this.getMonth() < 11 ? -1 : 0)))",
            Y: "this.getFullYear()",
            y: "('' + this.getFullYear()).substring(2, 4)",
            a: "(this.getHours() < 12 ? 'am' : 'pm')",
            A: "(this.getHours() < 12 ? 'AM' : 'PM')",
            g: "((this.getHours() % 12) ? this.getHours() % 12 : 12)",
            G: "this.getHours()",
            h: "Ext.util.Format.leftPad((this.getHours() % 12) ? this.getHours() % 12 : 12, 2, '0')",
            H: "Ext.util.Format.leftPad(this.getHours(), 2, '0')",
            i: "Ext.util.Format.leftPad(this.getMinutes(), 2, '0')",
            s: "Ext.util.Format.leftPad(this.getSeconds(), 2, '0')",
            u: "Ext.util.Format.leftPad(this.getMilliseconds(), 3, '0')",
            O: "this.getGMTOffset()",
            P: "this.getGMTOffset(true)",
            T: "this.getTimezone()",
            Z: "(this.getTimezoneOffset() * -60)",

            c: function() {
                
                for (var c = "Y-m-dTH:i:sP", code = [], i = 0, l = c.length; i < l; ++i) {
                    var e = c.charAt(i);
                    code.push(e == "T" ? "'T'": Date.getFormatCode(e));
                    
                }
                return code.join(" + ");
            },
            

            U: "Math.round(this.getTime() / 1000)"
        },

        
        isValid: function(y, m, d, h, i, s, ms) {
            
            h = h || 0;
            i = i || 0;
            s = s || 0;
            ms = ms || 0;

            var dt = new Date(y, m - 1, d, h, i, s, ms);

            return y == dt.getFullYear() &&
            m == dt.getMonth() + 1 &&
            d == dt.getDate() &&
            h == dt.getHours() &&
            i == dt.getMinutes() &&
            s == dt.getSeconds() &&
            ms == dt.getMilliseconds();
        },

        
        parseDate: function(input, format, strict) {
            var p = Date.parseFunctions;
            if (p[format] == null) {
                Date.createParser(format);
            }
            return p[format](input, Ext.isDefined(strict) ? strict: Date.useStrict);
        },

        
        getFormatCode: function(character) {
            var f = Date.formatCodes[character];

            if (f) {
                f = typeof f == 'function' ? f() : f;
                Date.formatCodes[character] = f;
                
            }

            
            return f || ("'" + Ext.util.Format.escape(character) + "'");
        },

        
        createFormat: function(format) {
            var code = [],
            special = false,
            ch = '';

            for (var i = 0; i < format.length; ++i) {
                ch = format.charAt(i);
                if (!special && ch == "\\") {
                    special = true;
                } else if (special) {
                    special = false;
                    code.push("'" + Ext.util.Format.escape(ch) + "'");
                } else {
                    code.push(Date.getFormatCode(ch));
                }
            }
            Date.formatFunctions[format] = new Function("return " + code.join('+'));
        },

        
        createParser: function() {
            var code = [
            "var dt, y, m, d, h, i, s, ms, o, z, zz, u, v,",
            "def = Date.defaults,",
            "results = String(input).match(Date.parseRegexes[{0}]);",
            
            "if(results){",
            "{1}",

            "if(u != null){",
            
            "v = new Date(u * 1000);",
            
            "}else{",
            
            
            
            "dt = (new Date()).clearTime();",

            
            "y = Ext.num(y, Ext.num(def.y, dt.getFullYear()));",
            "m = Ext.num(m, Ext.num(def.m - 1, dt.getMonth()));",
            "d = Ext.num(d, Ext.num(def.d, dt.getDate()));",

            
            "h  = Ext.num(h, Ext.num(def.h, dt.getHours()));",
            "i  = Ext.num(i, Ext.num(def.i, dt.getMinutes()));",
            "s  = Ext.num(s, Ext.num(def.s, dt.getSeconds()));",
            "ms = Ext.num(ms, Ext.num(def.ms, dt.getMilliseconds()));",

            "if(z >= 0 && y >= 0){",
            
            
            
            "v = new Date(y, 0, 1, h, i, s, ms);",

            
            "v = !strict? v : (strict === true && (z <= 364 || (v.isLeapYear() && z <= 365))? v.add(Date.DAY, z) : null);",
            "}else if(strict === true && !Date.isValid(y, m + 1, d, h, i, s, ms)){",
            
            "v = null;",
            
            "}else{",
            
            "v = new Date(y, m, d, h, i, s, ms);",
            "}",
            "}",
            "}",

            "if(v){",
            
            "if(zz != null){",
            
            "v = v.add(Date.SECOND, -v.getTimezoneOffset() * 60 - zz);",
            "}else if(o){",
            
            "v = v.add(Date.MINUTE, -v.getTimezoneOffset() + (sn == '+'? -1 : 1) * (hr * 60 + mn));",
            "}",
            "}",

            "return v;"
            ].join('\n');

            return function(format) {
                var regexNum = Date.parseRegexes.length,
                currentGroup = 1,
                calc = [],
                regex = [],
                special = false,
                ch = "",
                i = 0,
                obj,
                last;

                for (; i < format.length; ++i) {
                    ch = format.charAt(i);
                    if (!special && ch == "\\") {
                        special = true;
                    } else if (special) {
                        special = false;
                        regex.push(Ext.util.Format.escape(ch));
                    } else {
                        obj = $f(ch, currentGroup);
                        currentGroup += obj.g;
                        regex.push(obj.s);
                        if (obj.g && obj.c) {
                            if (obj.last) {
                                last = obj;
                            } else {
                                calc.push(obj.c);
                            }
                        }
                    }
                }
                
                if (last) {
                    calc.push(last);
                }

                Date.parseRegexes[regexNum] = new RegExp("^" + regex.join('') + "$");
                Date.parseFunctions[format] = new Function("input", "strict", xf(code, regexNum, calc.join('')));
            };
        }(),

        
        parseCodes: {
            
            d: {
                g: 1,
                c: "d = parseInt(results[{0}], 10);\n",
                s: "(\\d{2})"
                
            },
            j: {
                g: 1,
                c: "d = parseInt(results[{0}], 10);\n",
                s: "(\\d{1,2})"
                
            },
            D: function() {
                for (var a = [], i = 0; i < 7; a.push(Date.getShortDayName(i)), ++i);
                
                return {
                    g: 0,
                    c: null,
                    s: "(?:" + a.join("|") + ")"
                };
            },
            l: function() {
                return {
                    g: 0,
                    c: null,
                    s: "(?:" + Date.dayNames.join("|") + ")"
                };
            },
            N: {
                g: 0,
                c: null,
                s: "[1-7]"
                
            },
            S: {
                g: 0,
                c: null,
                s: "(?:st|nd|rd|th)"
            },
            w: {
                g: 0,
                c: null,
                s: "[0-6]"
                
            },
            z: {
                g: 1,
                c: "z = parseInt(results[{0}], 10);\n",
                s: "(\\d{1,3})"
                
            },
            W: {
                g: 0,
                c: null,
                s: "(?:\\d{2})"
                
            },
            F: function() {
                return {
                    g: 1,
                    c: "m = parseInt(Date.getMonthNumber(results[{0}]), 10);\n",
                    
                    s: "(" + Date.monthNames.join("|") + ")"
                };
            },
            M: function() {
                for (var a = [], i = 0; i < 12; a.push(Date.getShortMonthName(i)), ++i);
                
                return Ext.applyIf({
                    s: "(" + a.join("|") + ")"
                },
                $f("F"));
            },
            m: {
                g: 1,
                c: "m = parseInt(results[{0}], 10) - 1;\n",
                s: "(\\d{2})"
                
            },
            n: {
                g: 1,
                c: "m = parseInt(results[{0}], 10) - 1;\n",
                s: "(\\d{1,2})"
                
            },
            t: {
                g: 0,
                c: null,
                s: "(?:\\d{2})"
                
            },
            L: {
                g: 0,
                c: null,
                s: "(?:1|0)"
            },
            o: function() {
                return $f("Y");
            },
            Y: {
                g: 1,
                c: "y = parseInt(results[{0}], 10);\n",
                s: "(\\d{4})"
                
            },
            y: {
                g: 1,
                c: "var ty = parseInt(results[{0}], 10);\n"
                + "y = ty > Date.y2kYear ? 1900 + ty : 2000 + ty;\n",
                
                s: "(\\d{1,2})"
            },
            a: function(){
                return $f("A");
            },
            A: {
                
                calcLast: true,
                g: 1,
                c: "if (results[{0}] == 'AM') {\n"
                    + "if (!h || h == 12) { h = 0; }\n"
                    + "} else { if (!h || h < 12) { h = (h || 0) + 12; }}",
                s: "(AM|PM)"
            },
            g: function() {
                return $f("G");
            },
            G: {
                g: 1,
                c: "h = parseInt(results[{0}], 10);\n",
                s: "(\\d{1,2})"
                
            },
            h: function() {
                return $f("H");
            },
            H: {
                g: 1,
                c: "h = parseInt(results[{0}], 10);\n",
                s: "(\\d{2})"
                
            },
            i: {
                g: 1,
                c: "i = parseInt(results[{0}], 10);\n",
                s: "(\\d{2})"
                
            },
            s: {
                g: 1,
                c: "s = parseInt(results[{0}], 10);\n",
                s: "(\\d{2})"
                
            },
            u: {
                g: 1,
                c: "ms = results[{0}]; ms = parseInt(ms, 10)/Math.pow(10, ms.length - 3);\n",
                s: "(\\d+)"
                
            },
            O: {
                g: 1,
                c: [
                "o = results[{0}];",
                "var sn = o.substring(0,1),",
                
                "hr = o.substring(1,3)*1 + Math.floor(o.substring(3,5) / 60),",
                
                "mn = o.substring(3,5) % 60;",
                
                "o = ((-12 <= (hr*60 + mn)/60) && ((hr*60 + mn)/60 <= 14))? (sn + Ext.util.Format.leftPad(hr, 2, '0') + Ext.util.Format.leftPad(mn, 2, '0')) : null;\n"
                
                ].join("\n"),
                s: "([+\-]\\d{4})"
                
            },
            P: {
                g: 1,
                c: [
                "o = results[{0}];",
                "var sn = o.substring(0,1),",
                
                "hr = o.substring(1,3)*1 + Math.floor(o.substring(4,6) / 60),",
                
                "mn = o.substring(4,6) % 60;",
                
                "o = ((-12 <= (hr*60 + mn)/60) && ((hr*60 + mn)/60 <= 14))? (sn + Ext.util.Format.leftPad(hr, 2, '0') + Ext.util.Format.leftPad(mn, 2, '0')) : null;\n"
                
                ].join("\n"),
                s: "([+\-]\\d{2}:\\d{2})"
                
            },
            T: {
                g: 0,
                c: null,
                s: "[A-Z]{1,4}"
                
            },
            Z: {
                g: 1,
                c: "zz = results[{0}] * 1;\n"
                
                + "zz = (-43200 <= zz && zz <= 50400)? zz : null;\n",
                s: "([+\-]?\\d{1,5})"
                
            },
            c: function() {
                var calc = [],
                arr = [
                $f("Y", 1),
                
                $f("m", 2),
                
                $f("d", 3),
                
                $f("h", 4),
                
                $f("i", 5),
                
                $f("s", 6),
                
                {
                    c: "ms = results[7] || '0'; ms = parseInt(ms, 10)/Math.pow(10, ms.length - 3);\n"
                },
                
                {
                    c: [
                    
                    "if(results[8]) {",
                    
                    "if(results[8] == 'Z'){",
                    "zz = 0;",
                    
                    "}else if (results[8].indexOf(':') > -1){",
                    $f("P", 8).c,
                    
                    "}else{",
                    $f("O", 8).c,
                    
                    "}",
                    "}"
                    ].join('\n')
                }
                ];

                for (var i = 0, l = arr.length; i < l; ++i) {
                    calc.push(arr[i].c);
                }

                return {
                    g: 1,
                    c: calc.join(""),
                    s: [
                    arr[0].s,
                    
                    "(?:", "-", arr[1].s,
                    
                    "(?:", "-", arr[2].s,
                    
                    "(?:",
                    "(?:T| )?",
                    
                    arr[3].s, ":", arr[4].s,
                    
                    "(?::", arr[5].s, ")?",
                    
                    "(?:(?:\\.|,)(\\d+))?",
                    
                    "(Z|(?:[-+]\\d{2}(?::)?\\d{2}))?",
                    
                    ")?",
                    ")?",
                    ")?"
                    ].join("")
                };
            },
            U: {
                g: 1,
                c: "u = parseInt(results[{0}], 10);\n",
                s: "(-?\\d+)"
                
            }
        }
    });

} ());

Ext.apply(Date.prototype, {
    
    dateFormat: function(format) {
        if (Date.formatFunctions[format] == null) {
            Date.createFormat(format);
        }
        return Date.formatFunctions[format].call(this);
    },

    
    getTimezone: function() {
        
        
        
        
        
        
        
        
        
        
        
        
        return this.toString().replace(/^.* (?:\((.*)\)|([A-Z]{1,4})(?:[\-+][0-9]{4})?(?: -?\d+)?)$/, "$1$2").replace(/[^A-Z]/g, "");
    },

    
    getGMTOffset: function(colon) {
        return (this.getTimezoneOffset() > 0 ? "-": "+")
        + Ext.util.Format.leftPad(Math.floor(Math.abs(this.getTimezoneOffset()) / 60), 2, "0")
        + (colon ? ":": "")
        + Ext.util.Format.leftPad(Math.abs(this.getTimezoneOffset() % 60), 2, "0");
    },

    
    getDayOfYear: function() {
        var num = 0,
        d = this.clone(),
        m = this.getMonth(),
        i;

        for (i = 0, d.setDate(1), d.setMonth(0); i < m; d.setMonth(++i)) {
            num += d.getDaysInMonth();
        }
        return num + this.getDate() - 1;
    },

    
    getWeekOfYear: function() {
        
        var ms1d = 864e5,
        
        ms7d = 7 * ms1d;
        
        return function() {
            
            var DC3 = Date.UTC(this.getFullYear(), this.getMonth(), this.getDate() + 3) / ms1d,
            
            AWN = Math.floor(DC3 / 7),
            
            Wyr = new Date(AWN * ms7d).getUTCFullYear();

            return AWN - Math.floor(Date.UTC(Wyr, 0, 7) / ms7d) + 1;
        };
    }(),

    
    isLeapYear: function() {
        var year = this.getFullYear();
        return !! ((year & 3) == 0 && (year % 100 || (year % 400 == 0 && year)));
    },

    
    getFirstDayOfMonth: function() {
        var day = (this.getDay() - (this.getDate() - 1)) % 7;
        return (day < 0) ? (day + 7) : day;
    },

    
    getLastDayOfMonth: function() {
        return this.getLastDateOfMonth().getDay();
    },


    
    getFirstDateOfMonth: function() {
        return new Date(this.getFullYear(), this.getMonth(), 1);
    },

    
    getLastDateOfMonth: function() {
        return new Date(this.getFullYear(), this.getMonth(), this.getDaysInMonth());
    },

    
    getDaysInMonth: function() {
        var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        return function() {
            
            var m = this.getMonth();

            return m == 1 && this.isLeapYear() ? 29: daysInMonth[m];
        };
    }(),

    
    getSuffix: function() {
        switch (this.getDate()) {
        case 1:
        case 21:
        case 31:
            return "st";
        case 2:
        case 22:
            return "nd";
        case 3:
        case 23:
            return "rd";
        default:
            return "th";
        }
    },

    
    clone: function() {
        return new Date(this.getTime());
    },

    
    isDST: function() {
        
        
        return new Date(this.getFullYear(), 0, 1).getTimezoneOffset() != this.getTimezoneOffset();
    },

    
    clearTime: function(clone) {
        if (clone) {
            return this.clone().clearTime();
        }

        
        var d = this.getDate();

        
        this.setHours(0);
        this.setMinutes(0);
        this.setSeconds(0);
        this.setMilliseconds(0);

        if (this.getDate() != d) {
            
            
            
            
            for (var hr = 1, c = this.add(Date.HOUR, hr); c.getDate() != d; hr++, c = this.add(Date.HOUR, hr));

            this.setDate(d);
            this.setHours(c.getHours());
        }

        return this;
    },

    
    add: function(interval, value) {
        var d = this.clone();
        if (!interval || value === 0) return d;

        switch (interval.toLowerCase()) {
        case Date.MILLI:
            d.setMilliseconds(this.getMilliseconds() + value);
            break;
        case Date.SECOND:
            d.setSeconds(this.getSeconds() + value);
            break;
        case Date.MINUTE:
            d.setMinutes(this.getMinutes() + value);
            break;
        case Date.HOUR:
            d.setHours(this.getHours() + value);
            break;
        case Date.DAY:
            d.setDate(this.getDate() + value);
            break;
        case Date.MONTH:
            var day = this.getDate();
            if (day > 28) {
                day = Math.min(day, this.getFirstDateOfMonth().add('mo', value).getLastDateOfMonth().getDate());
            }
            d.setDate(day);
            d.setMonth(this.getMonth() + value);
            break;
        case Date.YEAR:
            d.setFullYear(this.getFullYear() + value);
            break;
        }
        return d;
    },

    
    between: function(start, end) {
        var t = this.getTime();
        return start.getTime() <= t && t <= end.getTime();
    }
});



Date.prototype.format = Date.prototype.dateFormat;




Ext.data.Connection = Ext.extend(Ext.util.Observable, {
    method: 'post',
    url: null,

    
    disableCaching: true,

    
    disableCachingParam: '_dc',

    
    timeout : 30000,

    useDefaultHeader : true,
    defaultPostHeader : 'application/x-www-form-urlencoded; charset=UTF-8',
    useDefaultXhrHeader : true,
    defaultXhrHeader : 'XMLHttpRequest',

    requests: {},

    constructor : function(config) {
        config = config || {};
        Ext.apply(this, config);

        this.addEvents(
            
            'beforerequest',
            
            'requestcomplete',
            
            'requestexception'
        );

        Ext.data.Connection.superclass.constructor.call(this);
    },

    
    request : function(o) {
        var me = this;
        if (me.fireEvent('beforerequest', me, o) !== false) {
            var params = o.params,
                url = o.url || me.url,
                request, data, headers,
                urlParams = o.urlParams,
                method, key, xhr;

            
            if (Ext.isFunction(params)) {
                params = params.call(o.scope || window, o);
            }

            
            if (Ext.isFunction(url)) {
                url = url.call(o.scope || window, o);
            }

            
            data = o.rawData || o.xmlData || o.jsonData || null;
            if (o.jsonData && !Ext.isPrimitive(o.jsonData)) {
                data = Ext.encode(data);
            }

            
            params = Ext.isObject(params) ? Ext.urlEncode(params) : params;
            urlParams = Ext.isObject(urlParams) ? Ext.urlEncode(urlParams) : urlParams;

            
            method = (o.method || me.method || ((params || data) ? 'POST' : 'GET')).toUpperCase();

            
            if (method === 'GET' && o.disableCaching !== false && !me.disableCaching) {
                url = Ext.urlAppend(url, o.disableCachingParam || me.disableCachingParam + '=' + (new Date().getTime()));
            }

            
            if ((method == 'GET' || data) && params){
                url = Ext.urlAppend(url, params);
                params = null;
            }

            
            if (urlParams) {
                url = Ext.urlAppend(url, urlParams);
            }

            
            if(o.autoAbort === true || me.autoAbort) {
                me.abort();
            }

            
            xhr = this.getXhrInstance();

            
            xhr.open(method.toUpperCase(), url, true);

            
            headers = Ext.apply({}, o.headers || {}, me.defaultHeaders || {});
            if (!headers['Content-Type'] && (data || params)) {
                var contentType = me.defaultPostHeader,
                    jsonData    = o.jsonData,
                    xmlData     = o.xmlData;
                
                if (data) {
                    if (o.rawData) {
                        contentType = 'text/plain';
                    } else {
                        if (xmlData && xmlData.length) {
                            contentType = 'text/xml';
                        } else if (jsonData && jsonData.length) {
                            contentType = 'application/json';
                        }
                    }
                }
                headers['Content-Type'] = contentType;
            }
            if (me.useDefaultXhrHeader && !headers['X-Requested-With']) {
                headers['X-Requested-With'] = me.defaultXhrHeader;
            }
            
            for (key in headers) {
                if (headers.hasOwnProperty(key)) {
                    try {
                        xhr.setRequestHeader(key, headers[key]);
                    }
                    catch(e) {
                        me.fireEvent('exception', key, headers[key]);
                    }                    
                }
            }

            
            request = {
                id: ++Ext.data.Connection.requestId,
                xhr: xhr,
                headers: headers,
                options: o,
                timeout: setTimeout(function() {
                    request.timedout = true;
                    me.abort(request);
                }, o.timeout || me.timeout)
            };
            me.requests[request.id] = request;

            
            xhr.onreadystatechange = Ext.createDelegate(me.onStateChange, me, [request]);

            
            xhr.send(data || params || null);
            return request;
        } else {
            return o.callback ? o.callback.apply(o.scope, [o, undefined, undefined]) : null;
        }
    },

    getXhrInstance : function() {
        return new XMLHttpRequest();
    },
    
    
    isLoading : function(r) {
        
        return r && !{0:true, 4:true}[r.xhr.readyState];
    },

    
    abort : function(r) {
        if (r && this.isLoading(r)) {
            r.xhr.abort();
            clearTimeout(r.timeout);
            delete(r.timeout);
            r.aborted = true;
            this.onComplete(r);
        }
        else if (!r) {
            var id;
            for(id in this.requests) {
                if (!this.requests.hasOwnProperty(id)) {
                    continue;
                }
                this.abort(this.requests[id]);
            }
        }
    },

    
    onStateChange : function(r) {
        if (r.xhr.readyState == 4) {
            clearTimeout(r.timeout);
            delete r.timeout;
            this.onComplete(r);
        }
    },

    
    onComplete : function(r) {
        var status = r.xhr.status,
            options = r.options,
            success = true,
            response;

        if ((status >= 200 && status < 300) || status == 304) {
            response = this.createResponse(r);
            this.fireEvent('requestcomplete', this, response, options);
            if (options.success) {
                if (!options.scope) {
                    options.success(response, options);
                }
                else {
                    options.success.call(options.scope, response, options);
                }
            }
        }
        else {
            success = false;
            switch (status) {
                case 12002:
                case 12029:
                case 12030:
                case 12031:
                case 12152:
                case 13030:
                    response = this.createException(r);
                    break;
                default:
                    response = this.createResponse(r);
            }
            this.fireEvent('requestexception', this, response, options);
            if (options.failure) {
                if (!options.scope) {
                    options.failure(response, options);
                }
                else {
                    options.failure.call(options.scope, response, options);
                }
            }
        }

        if (options.callback) {
            if (!options.scope) {
                options.callback(options, success, response);
            }
            else {
                options.callback.call(options.scope, options, success, response);
            }
        }
        
        delete this.requests[r.id];
    },

    
    createResponse : function(r) {
        var xhr = r.xhr,
            headers = {},
            lines = xhr.getAllResponseHeaders().replace(/\r\n/g, '\n').split('\n'),
            count = lines.length,
            line, index, key, value;

        while (count--) {
            line = lines[count];
            index = line.indexOf(':');
            if(index >= 0) {
                key = line.substr(0, index).toLowerCase();
                if (line.charAt(index + 1) == ' ') {
                    ++index;
                }
                headers[key] = line.substr(index + 1);
            }
        }

        delete r.xhr;

        return {
            request: r,
            requestId : r.id,
            status : xhr.status,
            statusText : xhr.statusText,
            getResponseHeader : function(header){ return headers[header.toLowerCase()]; },
            getAllResponseHeaders : function(){ return headers; },
            responseText : xhr.responseText,
            responseXML : xhr.responseXML
        };
    },

    
    createException : function(r) {
        return {
            request : r,
            requestId : r.id,
            status : r.aborted ? -1 : 0,
            statusText : r.aborted ? 'transaction aborted' : 'communication failure',
            aborted: r.aborted,
            timedout: r.timedout
        };
    }
});

Ext.data.Connection.requestId = 0;


Ext.Ajax = new Ext.data.Connection({
    
    
    
    
    
    

    

    
    
    
    
    
    

    
    autoAbort : false
});


Ext.gesture.Manager = new Ext.AbstractManager({
    startEvent: 'touchstart',
    moveEvent: 'touchmove',
    endEvent: 'touchend',
    
    init : function() {
        this.targets = []; 

        if (!Ext.supports.Touch) {
            Ext.apply(this, {
                startEvent: 'mousedown',
                moveEvent: 'mousemove',
                endEvent: 'mouseup'
            });
        }
        
        this.followTouches = [];
        this.currentGestures = [];
        this.currentTargets = [];
        
        document.addEventListener(this.startEvent, this.onTouchStart, true);
        document.addEventListener(this.moveEvent, this.onTouchMove, false);
        document.addEventListener(this.endEvent, this.onTouchEnd, true);
        
        if (Ext.is.Blackberry) {
            document.addEventListener('mousedown', this.onMouseDown, false);
        }
    },
    
    onMouseDown : function(e) {
        e.stopPropagation();
        e.preventDefault();    
    },
    
    onTouchStart : function(e) {
        var me = Ext.gesture.Manager,
            targets = [],
            target;
        
        me.locks = {};
        
        target = e.target;
        
        me.currentTargets = [target];
        
        if (Ext.is.Android) {
            if (!(/input|select|textarea/i.test(target.tagName))) {
                e.preventDefault();
                e.stopPropagation();                
            }
        }
              
        while (target) {
            if (me.targets.indexOf(target) != -1) {
                targets.unshift(target);
            }
            target = target.parentNode;
            me.currentTargets.push(target);
        }
        
        me.startEvent = e;
        me.handleTargets(targets, e);
    },
    
        
    onTouchEnd : function(e) {
        var me = Ext.gesture.Manager,
            gestures = me.currentGestures.slice(0),
            ln = gestures.length,
            i, gesture;
            
        me.followTouches = [];
        me.startedChangedTouch = false;
        me.currentTargets = [];
        me.startEvent = null;
        
        for (i = 0; i < ln; i++) {
            gesture = gestures[i];
            if (!e.stopped && gesture.listenForEnd) {
                gesture.onTouchEnd(e, e.changedTouches ? e.changedTouches[0] : e);
            }
            me.stopGesture(gesture);
        }
    },
    
     
    onTouchMove : function(e) {
        e.preventDefault();
    },

    startGesture : function(gesture) {
        var me = this;
        
        if (gesture.listenForMove) {
            gesture.onTouchMoveWrap = function(e) {
                if (!e.stopped) {
                    gesture.onTouchMove(e, e.changedTouches ? e.changedTouches[0] : e);   
                }
            };
            gesture.target.addEventListener(me.moveEvent, gesture.onTouchMoveWrap, !!gesture.capture);
        }
        
        this.currentGestures.push(gesture);
    },

    stopGesture : function(gesture) {
        if (gesture.listenForMove) {
            gesture.target.removeEventListener(this.moveEvent, gesture.onTouchMoveWrap, !!gesture.capture);
        }
        this.currentGestures.remove(gesture);
    },
    
    handleTargets : function(targets, e) {
        
        
        var ln = targets.length,
            i, target;
        
        this.startedChangedTouch = false;
        this.startedTouches = Ext.supports.Touch ? e.touches : [e];

        for (i = 0; i < ln; i++) {
            if (e.stopped) {
                break;
            }
            target = targets[i];
            this.handleTarget(target, e, true);
        }
        
        for (i = ln - 1; i >= 0; i--) {
            if (e.stopped) {
                break;
            }
            target = targets[i];
            this.handleTarget(target, e, false);
        }
        
        if (this.startedChangedTouch) {
            this.followTouches = this.followTouches.concat(Ext.supports.Touch ? Ext.toArray(e.targetTouches) : [e]);
        }
    },
    
    handleTarget : function(target, e, capture) {
        var gestures = Ext.Element.data(target, 'x-gestures') || [],
            ln = gestures.length,
            i, gesture, changedTouch;


        for (i = 0; i < ln; i++) {
            gesture = gestures[i];
            if (
                (this.followTouches.length < gesture.touches) && 
                (Ext.supports.Touch ? (e.targetTouches.length === gesture.touches) : true) && 
                (!!gesture.capture === !!capture)
            ) {
                this.startedChangedTouch = true;
                if (gesture.listenForStart) {
                    gesture.onTouchStart(e, e.changedTouches ? e.changedTouches[0] : e);                
                }
                this.startGesture(gesture);
                if (e.stopped) {
                    break;
                }                
            }
        }
    },
        
    addEventListener : function(target, eventName, listener, options) {
        target = Ext.getDom(target);
        
        var targets = this.targets,
            name = this.getGestureName(eventName),
            gestures = Ext.Element.data(target, 'x-gestures') || [],
            gesture;
        
        
        if (!name) {
            throw 'Trying to subscribe to unknown event ' + eventName;
        }
        
        
        if (targets.indexOf(target) == -1) {
            this.targets.push(target);
        }
        
        gesture = this.get(target.id + '-' + name);
        
        if (!gesture) {
            gesture = this.create(Ext.apply({}, options || {}, {
                target: target,
                type: name
            })); 
            gestures.push(gesture);
            Ext.Element.data(target, 'x-gestures', gestures);
            
            
            if (this.startedChangedTouch && this.currentTargets.contains(target)) {
                if (gesture.listenForStart) {
                    gesture.onTouchStart(this.startEvent, this.startedTouches[0]);                
                }
                this.startGesture(gesture);
            }
        }
        
        gesture.addListener(eventName, listener);
    },
    
    removeEventListener : function(target, eventName, listener) {
        target = Ext.getDom(target);
        
        var targets = this.targets,
            name = this.getGestureName(eventName),
            gestures = Ext.Element.data(target, 'x-gestures') || [],
            gesture;
            
        gesture = this.get(target.id + '-' + name);
        if (gesture) {
            gesture.removeListener(eventName, listener);
            if (!gesture.listeners) {
                gesture.destroy();
                gestures.remove(gesture);
                Ext.Element.data(target, 'x-gestures', gestures);
            }
        }
    },
    
    getGestureName : function(ename) {
        return this.names && this.names[ename];
    },
        
    registerType : function(type, cls) {
        var handles = cls.prototype.handles,
            i, ln;

        this.types[type] = cls;
        cls[this.typeName] = type;
        
        if (!handles) {
            handles = cls.prototype.handles = [type];
        }
        
        this.names = this.names || {};
        for (i = 0, ln = handles.length; i < ln; i++) {
            this.names[handles[i]] = type;
        }
    }
});

Ext.regGesture = function() {
    return Ext.gesture.Manager.registerType.apply(Ext.gesture.Manager, arguments);
};
Ext.TouchEventObjectImpl = Ext.extend(Object, {
    constructor : function(e, args) {
        if (e) {
            this.setEvent(e, args);
        }
    },

    setEvent : function(e, args) {
        Ext.apply(this, {
            event: e,
            time: e.timeStamp
        });

        this.touches = e.touches || [e];
        this.changedTouches = e.changedTouches || [e];
        this.targetTouches = e.targetTouches || [e];
        
        if (args) {
            this.target = args.target;
            Ext.apply(this, args);
        }
        else {
            this.target = e.target;
        }
        return this;
    },

    stopEvent : function() {
        this.stopPropagation();
        this.preventDefault();
    },

    stopPropagation : function() {
        this.event.stopped = true;
    },

    preventDefault : function() {
        this.event.preventDefault();
    },

    getTarget : function(selector, maxDepth, returnEl) {
        if (selector) {
            return Ext.fly(this.target).findParent(selector, maxDepth, returnEl);
        }
        else {
            return returnEl ? Ext.get(this.target) : this.target;
        }
    }
});

Ext.TouchEventObject = new Ext.TouchEventObjectImpl();
Ext.gesture.Gesture = Ext.extend(Object, {    
    listenForStart: true,
    listenForEnd: true,
    listenForMove: true,
    
    touches: 1,
    
    constructor : function(config) {
        config = config || {};
        Ext.apply(this, config);
        
        this.target = Ext.getDom(this.target);
        this.listeners = {};
        
        
        if (!this.target) {
            throw 'Trying to bind a ' + this.type + ' event to element that does\'nt exist: ' + target;
        }
        
        
        this.id = this.target.id + '-' + this.type;
        
        Ext.gesture.Gesture.superclass.constructor.call(this);
        Ext.gesture.Manager.register(this);
    },
    
    addListener : function(ename, listener) {
        this.listeners[ename] = this.listeners[ename] || [];
        this.listeners[ename].push(listener);
    },
    
    removeListener : function(ename, listener) {
        var listeners = this.listeners[ename];
            
        if (listeners) {
            listeners.remove(listener);
            if (listeners.length == 0) {
                delete this.listeners[ename];
            }
            for (ename in this.listeners) {
                if (this.listeners.hasOwnProperty(ename)) {
                    return;
                }
            }
            this.listeners = null;
        }
    },
    
    fire : function(type, e, args) {
        var listeners = this.listeners[type],
            ln = listeners && listeners.length,
            lock = Ext.gesture.Manager.locks[type],
            i;
        
        if (lock && lock !== this.id) {
            return false;
        }
        
        if (ln) {
            args = Ext.apply(args || {}, {
                type: type,
                gesture: this,
                target: (e.target.nodeType == 3) ? e.target.parentNode : e.target
            });
            
            for (i = 0; i < ln; i++) {
                listeners[i](e, args);
            }
        }
        
        return true;
    },
    
    stop : function() {
        Ext.gesture.Manager.stopGesture(this);
    },
    
    lock : function() {
        var args = arguments,
            ln = args.length,
            i;
            
        for (i = 0; i < ln; i++) {
            Ext.gesture.Manager.locks[args[i]] = this.id;
        }
    },
    
    unlock : function() {
        var args = arguments,
            ln = args.length,
            i;
            
        for (i = 0; i < ln; i++) {
            if (Ext.gesture.Manager.locks[args[i]] == this.id) {
                delete Ext.gesture.Manager.locks[args[i]]; 
            }
        }        
    },
    
    onTouchStart : Ext.emptyFn,
    onTouchMove : Ext.emptyFn,
    onTouchEnd : Ext.emptyFn,
    
    destroy : function() {
        this.stop();
        this.listeners = null;
        Ext.gesture.Manager.unregister(this);
    }
});
Ext.gesture.Touch = Ext.extend(Ext.gesture.Gesture, {
    handles: ['touchstart', 'touchmove', 'touchend', 'touchdown'],
    
    touchDownInterval: 500,
    
    onTouchStart: function(e, touch) {
        var me = this;
        me.startX = me.previousX = touch.pageX;
        me.startY = me.previousY = touch.pageY;
        me.startTime = me.previousTime = e.timeStamp;

        me.fire('touchstart', e);
        me.lastEvent = e;
        
        if (me.listeners.touchdown) {
            me.touchDownIntervalId = setInterval(Ext.createDelegate(me.touchDownHandler, me), me.touchDownInterval);
        }
    },
    
    onTouchMove: function(e, touch) {
        this.fire('touchmove', e, this.getInfo(touch));
        this.lastEvent = e;
    },
    
    onTouchEnd: function(e) {
        this.fire('touchend', e, this.lastInfo);
        clearInterval(this.touchDownIntervalId);
    },
    
    touchDownHandler : function() {
        this.fire('touchdown', this.lastEvent, this.lastInfo);
    },
    
    getInfo : function(touch) {
        var me = this,
            startX = me.startX,
            startY = me.startY,
            previousX = me.previousX,
            previousY = me.previousY,
            pageX = touch.pageX,
            pageY = touch.pageY,
            deltaX = pageX - startX,
            deltaY = pageY - startY,
            startTime = me.startTime,
            previousTime = me.previousTime,
            time = (new Date()).getTime(),
            info = {
                startX: startX,
                startY: startY,
                previousX: previousX,
                previousY: previousY,
                pageX: pageX,
                pageY: pageY,
                deltaX: deltaX,
                deltaY: deltaY,
                absDeltaX: Math.abs(deltaX),
                absDeltaY: Math.abs(deltaY),
                previousDeltaX: pageX - previousX,
                previousDeltaY: pageY - previousY,
                time: time,
                startTime: startTime,
                previousTime: previousTime,
                deltaTime: time - startTime,
                previousDeltaTime: time - previousTime
            };
        
        me.previousTime = info.time;
        me.previousX = info.pageX;
        me.previousY = info.pageY;
        me.lastInfo = info;
        
        return info;
    }
});
Ext.regGesture('touch', Ext.gesture.Touch);
Ext.gesture.Tap = Ext.extend(Ext.gesture.Gesture, {
    handles: [
        'tapstart',
        'tapcancel',
        'tap', 
        'doubletap', 
        'taphold',
        'singletap'
    ],
    
    cancelThreshold: 5,
    doubleTapThreshold: 800,
    singleTapThreshold: 400,
    holdThreshold : 1000,
    
    onTouchStart : function(e, touch) {
        var me = this;
        
        me.startX = touch.pageX;
        me.startY = touch.pageY;
        me.fire('tapstart', e, me.getInfo(touch));
        
        if (this.listeners.taphold) {    
            me.timeout = setTimeout(function() {
                me.fire('taphold', e, me.getInfo(touch));
                delete me.timeout;
            }, me.holdThreshold);            
        }
        
        me.lastTouch = touch;
    },
    
    onTouchMove : function(e, touch) {
        var me = this;
        if (me.isCancel(touch)) {
            me.fire('tapcancel', e, me.getInfo(touch));
            if (me.timeout) {
                clearTimeout(me.timeout);
                delete me.timeout;
            }
            me.stop();
        }
        
        me.lastTouch = touch;
    },
    
    onTouchEnd : function(e) {
        var me = this,
            info = me.getInfo(me.lastTouch);
        
        me.fire('tap', e, info);
        
        if (me.lastTapTime && e.timeStamp - me.lastTapTime <= me.doubleTapThreshold) {
            me.lastTapTime = null;
            e.preventDefault();
            me.fire('doubletap', e, info);
        }
        else {
            me.lastTapTime = e.timeStamp;
        }
        
        if (me.listeners.singletap && me.singleTapThreshold && !me.preventSingleTap) {
            me.fire('singletap', e, info);
            me.preventSingleTap = true;
            setTimeout(function() {
                me.preventSingleTap = false;
            }, me.singleTapThreshold);
        }
        
        if (me.timeout) {
            clearTimeout(me.timeout);
            delete me.timeout;
        }
    },
    
    getInfo : function(touch) {
        return {
            pageX: touch.pageX,
            pageY: touch.pageY
        };
    },
    
    isCancel : function(touch) {
        var me = this;
        return (
            Math.abs(touch.pageX - me.startX) >= me.cancelThreshold ||
            Math.abs(touch.pageY - me.startY) >= me.cancelThreshold
        );
    }
});
Ext.regGesture('tap', Ext.gesture.Tap);
Ext.gesture.Swipe = Ext.extend(Ext.gesture.Gesture, {    
    listenForEnd: false,
   
    swipeThreshold: 35,
    swipeTime: 1000,
    
    onTouchStart : function(e, touch) {
        this.startTime = e.timeStamp;
        this.startX = touch.pageX;
        this.startY = touch.pageY;
        this.lock('scroll', 'scrollstart', 'scrollend');
    },
   
    onTouchMove : function(e, touch) {
        var deltaY = touch.pageY - this.startY,
            deltaX = touch.pageX - this.startX,
            absDeltaY = Math.abs(deltaY),
            absDeltaX = Math.abs(deltaX),
            deltaTime = e.timeStamp - this.startTime;

        
        if (absDeltaY - absDeltaX > 3 || deltaTime > this.swipeTime) {
            this.unlock('scroll', 'scrollstart', 'scrollend');
            this.stop();
        }
        else if (absDeltaX > this.swipeThreshold && absDeltaX > absDeltaY) {
           
           this.fire('swipe', e, {
               direction: (deltaX < 0) ? 'left' : 'right',
               distance: absDeltaX,
               deltaTime: deltaTime,
               deltaX: deltaX
           });
   
           this.stop();
        }
    }
});
Ext.regGesture('swipe', Ext.gesture.Swipe);
Ext.gesture.Scroll = Ext.extend(Ext.gesture.Touch, {
    handles: ['scrollstart', 'scroll', 'scrollend'],
    
    scrollThreshold: 35,
    horizontal: true,
    vertical: true,
    
    onTouchStart : function(e, touch) {
        this.startX = this.previousX = touch.pageX;
        this.startY = this.previousY = touch.pageY;
        this.startTime = this.previousTime = e.timeStamp;
        this.scrolling = false;
    },    
    
    onTouchMove : function(e, touch) {
        var info = this.getInfo(touch);
        if (!this.scrolling) {
            if (this.isScrolling(info) && this.fire('scrollstart', e, info)) {
                this.scrolling = true;
                this.lock('scroll', 'scrollstart', 'scrollend');
            }
        }
        else {
            this.fire('scroll', e, info);
        }
    },

    onTouchEnd : function(e) {
        if (this.scrolling) {
            this.fire('scrollend', e, this.lastInfo);
        }
    },
    
    isScrolling : function(info) {
        return (
            (this.horizontal && info.absDeltaX >= this.scrollThreshold) ||
            (this.vertical && info.absDeltaY >= this.scrollThreshold)
        );
    }
});

Ext.regGesture('scroll', Ext.gesture.Scroll);
Ext.gesture.Pinch = Ext.extend(Ext.gesture.Gesture, {
    handles: [
        'pinchstart',
        'pinch',
        'pinchend'
    ],
    
    touches: 2,
    
    onTouchStart : function(e) {
        var me = this;
        
        if (Ext.supports.Touch && e.targetTouches.length >= 2) {
            me.lock('swipe', 'scroll', 'scrollstart', 'scrollend', 'touchmove', 'touchend', 'touchstart', 'tap', 'tapstart', 'taphold', 'tapcancel', 'doubletap');
            me.pinching = true;
            
            var targetTouches = e.targetTouches,
                firstTouch = me.firstTouch = targetTouches[0],
                secondTouch = me.secondTouch = targetTouches[1];
            
            me.previousDistance = me.startDistance = me.getDistance();
            me.previousScale = 1;
            
            me.fire('pinchstart', e, {
                distance: me.startDistance,
                scale: me.previousScale
            });
        }
        else if (me.pinching) {
            me.unlock('swipe', 'scroll', 'scrollstart', 'scrollend', 'touchmove', 'touchend', 'touchstart', 'tap', 'tapstart', 'taphold', 'tapcancel', 'doubletap');
            me.pinching = false;
        }
    },
    
    onTouchMove : function(e) {
        if (this.pinching) {
            this.fire('pinch', e, this.getPinchInfo());
        }
    },
    
    onTouchEnd : function(e) {
        if (this.pinching) {
            this.fire('pinchend', e, this.getPinchInfo());
        }
    },
    
    getPinchInfo : function() {
        var me = this,
            distance = me.getDistance(),
            scale = distance / me.startDistance,
            firstTouch = me.firstTouch,
            secondTouch = me.secondTouch,
            info = {
                scale: scale,
                deltaScale: scale - 1,
                previousScale: me.previousScale,
                previousDeltaScale: scale - me.previousScale,
                distance: distance,
                deltaDistance: distance - me.startDistance,
                startDistance: me.startDistance,
                previousDistance: me.previousDistance,
                previousDeltaDistance: distance - me.previousDistance,
                firstTouch: firstTouch,
                secondTouch: secondTouch,
                firstPageX: firstTouch.pageX,
                firstPageY: firstTouch.pageY,
                secondPageX: secondTouch.pageX,
                secondPageY: secondTouch.pageY,
                
                midPointX: (firstTouch.pageX + secondTouch.pageX) / 2,
                midPointY: (firstTouch.pageY + secondTouch.pageY) / 2
            };
        
        me.previousScale = scale;
        me.previousDistance = distance;
        
        return info;  
    },
    
    getDistance : function() {
        var me = this;
        return Math.sqrt(
            Math.pow(Math.abs(me.firstTouch.pageX - me.secondTouch.pageX), 2) +
            Math.pow(Math.abs(me.firstTouch.pageY - me.secondTouch.pageY), 2)
        );        
    }
});

Ext.regGesture('pinch', Ext.gesture.Pinch);


Ext.lib.Component = Ext.extend(Ext.util.Observable, {
    isComponent: true,

    
    renderTpl: null,

    

    

    

    

    
    tplWriteMode: 'overwrite',

    
    baseCls: 'x-component',

    

    

    
    disabledCls: 'x-item-disabled',

    

   
    
    
    
    
    
    
    
    
    
    

    
    hidden: false,

    
    disabled: false,

    

    
    draggable: false,

    
    floatable: false,

    

    

    
    styleHtmlContent: false,

    
    styleHtmlCls: 'x-html',

    
    
    
    

     
     allowDomMove: true,
     autoShow: false,
     
     autoRender: false,

     needsLayout: false,

    

    
    rendered: false,

    constructor : function(config) {
        config = config || {};
        this.initialConfig = config;
        Ext.apply(this, config);

        this.addEvents(
            
             'beforeactivate',
            
             'activate',
            
             'beforedeactivate',
            
             'deactivate',
            
             'added',
            
             'disable',
            
             'enable',
            
             'beforeshow',
            
             'show',
            
             'beforehide',
            
             'hide',
            
             'removed',
            
             'beforerender',
            
             'render',
            
             'afterrender',
            
             'beforedestroy',
            
             'destroy',
            
             'resize',
            
             'move',

             'beforestaterestore',
             'staterestore',
             'beforestatesave',
             'statesave'
        );

        this.getId();

        this.mons = [];
        this.renderData = this.renderData || {};
        this.renderSelectors = this.renderSelectors || {};

        this.initComponent();

        
        Ext.ComponentMgr.register(this);

        
        Ext.lib.Component.superclass.constructor.call(this);

        
        if (this.plugins) {
            this.plugins = [].concat(this.plugins);
            for (var i = 0, len = this.plugins.length; i < len; i++) {
                this.plugins[i] = this.initPlugin(this.plugins[i]);
            }
        }

        
        if (this.applyTo) {
            this.applyToMarkup(this.applyTo);
            delete this.applyTo;
        }
        else if (this.renderTo) {
            this.render(this.renderTo);
            delete this.renderTo;
        }
    },

    initComponent: Ext.emptyFn,
    applyToMarkup: Ext.emptyFn,
    
    show: Ext.emptyFn,

    onShow : function() {
        
        var needsLayout = this.needsLayout;
        if (Ext.isObject(needsLayout)) {
            this.doComponentLayout(needsLayout.width, needsLayout.height, needsLayout.isSetSize);
        }
    },
    
    
    initPlugin : function(plugin) {
        if (plugin.ptype && typeof plugin.init != 'function') {
            plugin = Ext.PluginMgr.create(plugin);
        }
        else if (typeof plugin == 'string') {
            plugin = Ext.PluginMgr.create({
                ptype: plugin
            });
        }

        plugin.init(this);

        return plugin;
    },

    
    render : function(container, position) {
        if (!this.rendered && this.fireEvent('beforerender', this) !== false) {
            
            
            if (this.el) {
                this.el = Ext.get(this.el);
            }

            container = this.initContainer(container);

            this.onRender(container, position);
            this.fireEvent('render', this);

            this.initContent();

            this.afterRender(container);
            this.fireEvent('afterrender', this);

            this.initEvents();

            if (this.autoShow) {
                this.show();
            }

            if (this.hidden) {
                
                this.onHide(false); 
            }

            if (this.disabled) {
                
                this.disable(true);
            }
        }

        return this;
    },

    
    onRender : function(container, position) {
        var el = this.el,
            cls = [],
            renderTpl,
            renderData;

        position = this.getInsertPosition(position);

        if (!el) {
            if (position) {
                el = Ext.DomHelper.insertBefore(position, this.getElConfig(), true);
            }
            else {
                el = Ext.DomHelper.append(container, this.getElConfig(), true);
            }
        }
        else if (this.allowDomMove !== false) {
            container.dom.insertBefore(el.dom, position);
        }

        cls.push(this.baseCls);
        if (this.cmpCls) {
            cls.push(this.cmpCls);
        }
        else {
            this.cmpCls = this.baseCls;
        }
        if (this.cls) {
            cls.push(this.cls);
            delete this.cls;
        }
        if (this.ui) {
            cls.push(this.cmpCls + '-' + this.ui);
        }
        el.addClass(cls);
        el.setStyle(this.initStyles());

        
        
        
        
        
        
        
        
        
        

        renderTpl = this.initRenderTpl();
        if (renderTpl) {
            renderData = this.initRenderData();
            renderTpl.append(el, renderData);
        }

        this.el = el;
        this.applyRenderSelectors();
        this.rendered = true;
    },

    
    afterRender : function() {
        this.getComponentLayout();

        if (this.x || this.y) {
            this.setPosition(this.x, this.y);
        }

        if (this.styleHtmlContent) {
            this.getTargetEl().addClass(this.styleHtmlCls);
        }

        
        
        if (!this.ownerCt) {
            this.setSize(this.width, this.height);
        }
    },

    getElConfig : function() {
        return {tag: 'div', id: this.id};
    },

    
    getInsertPosition: function(position) {
        
        if (position !== undefined) {
            if (Ext.isNumber(position)) {
                position = this.container.dom.childNodes[position];
            }
            else {
                position = Ext.getDom(position);
            }
        }

        return position;
    },

    
    initContainer: function(container) {
        
        
        
        if (!container && this.el) {
            container = this.el.dom.parentNode;
            this.allowDomMove = false;
        }

        this.container = Ext.get(container);

        if (this.ctCls) {
            this.container.addClass(this.ctCls);
        }

        return this.container;
    },

    
    initRenderData: function() {
        return Ext.applyIf(this.renderData, {
            baseCls: this.baseCls,
            cmpCls: this.cmpCls
        });
    },

    
    initRenderTpl: function() {
        var renderTpl = this.renderTpl;
        if (renderTpl) {
            if (this.proto.renderTpl !== renderTpl) {
                if (Ext.isArray(renderTpl) || typeof renderTpl === "string") {
                    renderTpl = new Ext.XTemplate(renderTpl);
                }
            }
            else if (Ext.isArray(this.proto.renderTpl)){
                renderTpl = this.proto.renderTpl = new Ext.XTemplate(renderTpl);
            }
        }
        return renderTpl;
    },

    
    initStyles: function() {
        var style = {},
            Element = Ext.Element,
            i, ln, split, prop;

        if (Ext.isString(this.style)) {
            split = this.style.split(';');
            for (i = 0, ln = split.length; i < ln; i++) {
                if (!Ext.isEmpty(split[i])) {
                    prop = split[i].split(':');
                    style[Ext.util.Format.trim(prop[0])] = Ext.util.Format.trim(prop[1]);
                }
            }
        } else {
            style = Ext.apply({}, this.style);
        }

        
        
        if (this.padding != undefined) {
            style.padding = Element.unitizeBox((this.padding === true) ? 5 : this.padding);
        }

        if (this.margin != undefined) {
            style.margin = Element.unitizeBox((this.margin === true) ? 5 : this.margin);
        }

        if (this.border != undefined) {
            style.borderWidth = Element.unitizeBox((this.border === true) ? 1 : this.border);
        }

        delete this.style;
        return style;
    },

    
    initContent: function() {
        var target = this.getTargetEl();

        if (this.html) {
            target.update(Ext.DomHelper.markup(this.html));
            delete this.html;
        }

        if (this.contentEl) {
            var contentEl = Ext.get(this.contentEl);
            contentEl.show();
            target.appendChild(contentEl.dom);
        }

        if (this.tpl) {
            
            if (!this.tpl.isTemplate) {
                this.tpl = new Ext.XTemplate(this.tpl);
            }

            if (this.data) {
                this.tpl[this.tplWriteMode](target, this.data);
                delete this.data;
            }
        }
    },

    
    initEvents : function() {
        var afterRenderEvents = this.afterRenderEvents,
            property, listeners;
        if (afterRenderEvents) {
            for (property in afterRenderEvents) {
                if (!afterRenderEvents.hasOwnProperty(property)) {
                    continue;
                }
                listeners = afterRenderEvents[property];
                if (this[property] && this[property].on) {
                    this.mon(this[property], listeners);
                }
            }
        }
    },

    
    applyRenderSelectors: function() {
        var selectors = this.renderSelectors || {},
            el = this.el.dom,
            selector;

        for (selector in selectors) {
            if (!selectors.hasOwnProperty(selector)) {
                continue;
            }
            this[selector] = Ext.get(Ext.DomQuery.selectNode(selectors[selector], el));
        }
    },

    
    getId : function() {
        return this.id || (this.id = 'ext-comp-' + (++Ext.lib.Component.AUTO_ID));
    },

    getItemId : function() {
        return this.itemId || this.id;
    },

    
    getEl : function() {
        return this.el;
    },

    
    getTargetEl: function() {
        return this.el;
    },

    
    isXType: function(xtype, shallow) {
        
        if (Ext.isFunction(xtype)) {
            xtype = xtype.xtype;
            
        } else if (Ext.isObject(xtype)) {
            xtype = xtype.constructor.xtype;
            
        }

        return !shallow ? ('/' + this.getXTypes() + '/').indexOf('/' + xtype + '/') != -1: this.constructor.xtype == xtype;
    },

    
    getXTypes: function() {
        var constructor = this.constructor,
            xtypes      = [],
            superclass  = this,
            xtype;

        if (!constructor.xtypes) {
            while (superclass) {
                xtype = superclass.constructor.xtype;

                if (xtype != undefined) {
                    xtypes.unshift(xtype);
                }

                superclass = superclass.constructor.superclass;
            }

            constructor.xtypeChain = xtypes;
            constructor.xtypes = xtypes.join('/');
        }

        return constructor.xtypes;
    },

    
    update : function(htmlOrData, loadScripts, cb) {
        if (this.tpl && !Ext.isString(htmlOrData)) {
            this.data = htmlOrData;
            if (this.rendered) {
                this.tpl[this.tplWriteMode](this.getTargetEl(), htmlOrData || {});
            }
        }
        else {
            this.html = Ext.isObject(htmlOrData) ? Ext.DomHelper.markup(htmlOrData) : htmlOrData;
            if (this.rendered) {
                this.getTargetEl().update(this.html, loadScripts, cb);
            }
        }

        if (this.rendered) {
            this.doComponentLayout();
        }
    },

    
    setVisible : function(visible) {
        return this[visible ? 'show': 'hide']();
    },

    
    isVisible: function() {
        var visible = !this.hidden,
            cmp     = this.ownerCt;

        
        this.hiddenOwnerCt = false;
        if (this.destroyed) {
            return false;
        };

        if (visible && this.rendered && cmp) {
            while (cmp) {
                if (cmp.hidden || cmp.collapsed) {
                    
                    this.hiddenOwnerCt = cmp;
                    visible = false;
                    break;
                }
                cmp = cmp.ownerCt;
            }
        }
        return visible;
    },

    
    enable : function(silent) {
        if (this.rendered) {
            this.el.removeClass(this.disabledCls);
            this.el.dom.disabled = false;
            this.onEnable();
        }

        this.disabled = false;

        if (silent !== true) {
            this.fireEvent('enable', this);
        }

        return this;
    },

    
    disable : function(silent) {
        if (this.rendered) {
            this.el.addClass(this.disabledCls);
            this.el.dom.disabled = true;
            this.onDisable();
        }

        this.disabled = true;

        if (silent !== true) {
            this.fireEvent('disable', this);
        }

        return this;
    },

    
    setDisabled : function(disabled) {
        return this[disabled ? 'disable': 'enable']();
    },

    
    addClass : function(cls) {
        if (this.rendered) {
            this.el.addClass(cls);
        }
        else {
            this.cls = this.cls ? this.cls + ' ' + cls: cls;
        }
        return this;
    },

    
    removeClass : function(cls) {
        if (this.rendered) {
            this.el.removeClass(cls);
        }
        else if (this.cls) {
            this.cls = this.cls.split(' ').remove(cls).join(' ');
        }
        return this;
    },

    addListener : function(element, listeners, scope, options) {
        if (Ext.isString(element) && (Ext.isObject(listeners) || options && options.element)) {
            if (options.element) {
                var fn = listeners,
                    option;

                listeners = {};
                listeners[element] = fn;
                element = options.element;
                if (scope) {
                    listeners.scope = scope;
                }

                for (option in options) {
                    if (!options.hasOwnProperty(option)) {
                        continue;
                    }
                    if (this.eventOptionsRe.test(option)) {
                        listeners[option] = options[option];
                    }
                }
            }

            
            
            if (this[element] && this[element].on) {
                this.mon(this[element], listeners);
            }
            else {
                this.afterRenderEvents = this.afterRenderEvents || {};
                this.afterRenderEvents[element] = listeners;
            }
        }

        return Ext.lib.Component.superclass.addListener.apply(this, arguments);
    },

    

    
    getBubbleTarget : function() {
        return this.ownerCt;
    },

    isFloatable : Ext.emptyFn,
    isDraggable : Ext.emptyFn,
    isDroppable : Ext.emptyFn,

    
    onAdded : function(container, pos) {
        this.ownerCt = container;
        this.fireEvent('added', this, container, pos);
    },

    
    onRemoved : function() {
        this.fireEvent('removed', this, this.ownerCt);
        delete this.ownerCt;
    },

    
    onEnable : Ext.emptyFn,
    
    onDisable : Ext.emptyFn,
    
    beforeDestroy : Ext.emptyFn,
    
    
    onResize : Ext.emptyFn,

    
    setSize : function(width, height) {
        
        if (Ext.isObject(width)) {
            height = width.height;
            width  = width.width;
        }
        if (!this.rendered || !this.isVisible()) {
            
            if (this.hiddenOwnerCt) {
                var layoutCollection = this.hiddenOwnerCt.layoutOnShow;
                layoutCollection.remove(this);
                layoutCollection.add(this);
            }
            this.needsLayout = {
                width: width,
                height: height,
                isSetSize: true
            };
            if (!this.rendered) {
                this.width  = (width !== undefined) ? width : this.width;
                this.height = (height !== undefined) ? height : this.height;
            }
            return this;
        }
        this.doComponentLayout(width, height, true);

        return this;
    },

    setCalculatedSize : function(width, height) {
        
        if (Ext.isObject(width)) {
            height = width.height;
            width  = width.width;
        }
        if (!this.rendered || !this.isVisible()) {
            
            if (this.hiddenOwnerCt) {
                var layoutCollection = this.hiddenOwnerCt.layoutOnShow;
                layoutCollection.remove(this);
                layoutCollection.add(this);
            }
            this.needsLayout = {
                width: width,
                height: height,
                isSetSize: false
            };
            return this;
        }
        this.doComponentLayout(width, height);

        return this;
    },

    
    doComponentLayout : function(width, height, isSetSize) {
        var componentLayout = this.getComponentLayout();
        if (this.rendered && componentLayout) {
            width = (width !== undefined || this.collapsed === true) ? width : this.width;
            height = (height !== undefined || this.collapsed === true) ? height : this.height;
            if (isSetSize) {
                this.width = width;
                this.height = height;
            }

            componentLayout.layout(width, height);
        }
        return this;
    },

    
    setComponentLayout : function(layout) {
        var currentLayout = this.componentLayout;
        if (currentLayout && currentLayout.isLayout && currentLayout != layout) {
            currentLayout.setOwner(null);
        }
        this.componentLayout = layout;
        layout.setOwner(this);
    },
    
    getComponentLayout : function() {
        if (!this.componentLayout || !this.componentLayout.isLayout) {
            this.setComponentLayout(Ext.layout.LayoutManager.create(this.componentLayout, 'autocomponent'));
        }
        return this.componentLayout;
    },

    afterComponentLayout: Ext.emptyFn,

    
    setPosition : function(x, y) {
        if (Ext.isObject(x)) {
            y = x.y;
            x = x.x;
        }

        if (!this.rendered) {

            return this;
        }

        if (x !== undefined || y !== undefined) {
            this.el.setBox(x, y);
            this.onPosition(x, y);
            this.fireEvent('move', this, x, y);
        }
        return this;
    },

    
    onPosition: Ext.emptyFn,

    
    setWidth : function(width) {
        return this.setSize(width);
    },

    
    setHeight : function(height) {
        return this.setSize(undefined, height);
    },

    
    getSize : function() {
        return this.el.getSize();
    },

    
    getWidth : function() {
        return this.el.getWidth();
    },

    
    getHeight : function() {
        return this.el.getHeight();
    },

    
    setDocked : function(dock, layoutParent) {
        this.dock = dock;
        if (layoutParent && this.ownerCt && this.rendered) {
            this.ownerCt.doComponentLayout();
        }
        return this;
    },

    onDestroy : function() {
        if (this.monitorResize && Ext.EventManager.resizeEvent) {
            Ext.EventManager.resizeEvent.removeListener(this.setSize, this);
        }
    },

    
    destroy : function() {
        if (!this.isDestroyed) {
            if (this.fireEvent('beforedestroy', this) !== false) {
                this.destroying = true;
                this.beforeDestroy();

                if (this.ownerCt && this.ownerCt.remove) {
                    this.ownerCt.remove(this, false);
                }

                if (this.rendered) {
                    this.el.remove();
                }

                this.onDestroy();

                Ext.ComponentMgr.unregister(this);
                this.fireEvent('destroy', this);

                this.purgeListeners();
                this.destroying = false;
                this.isDestroyed = true;
            }
        }
    }
});

Ext.lib.Component.prototype.on = Ext.lib.Component.prototype.addListener;


Ext.lib.Component.AUTO_ID = 1000;

Ext.Component = Ext.extend(Ext.lib.Component, {
    
    showAnimation: null,

    
    monitorOrientation: false,

    
    floatingCls: 'x-floating',

    
    hideOnMaskTap: true,
    
        
    stopMaskTapEvent: true,

    
    centered: false,

    
    modal: false,

    

    
    initComponent : function() {
        this.addEvents(
            
            'beforeorientationchange',
            
            'orientationchange'
        );

        if (this.fullscreen || this.floating) {
            this.monitorOrientation = true;
            this.autoRender = true;
        }

        if (this.fullscreen) {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.cls = (this.cls || '') + ' x-fullscreen';
            this.renderTo = document.body;
        }
    },

    onRender : function() {
        Ext.Component.superclass.onRender.apply(this, arguments);

        if (this.monitorOrientation) {
            this.el.addClass('x-' + Ext.orientation);
        }

        if (this.floating) {
            this.setFloating(true);
        }

        if (this.draggable) {
            this.setDraggable(this.draggable);
        }

        if (this.scroll) {
            this.setScrollable(this.scroll);
        }
    },

    afterRender : function() {
        if (this.fullscreen) {
            this.layoutOrientation(Ext.orientation, this.width, this.height);
        }
        Ext.Component.superclass.afterRender.call(this);
    },

    initEvents : function() {
        Ext.Component.superclass.initEvents.call(this);

        if (this.monitorOrientation) {
            Ext.EventManager.onOrientationChange(this.setOrientation, this);
        }
    },

    
    
    afterComponentLayout : function() {
        var scrollEl = this.scrollEl,
            scroller = this.scroller,
            parentEl;

        if (scrollEl) {
            parentEl = scrollEl.parent();

            if (scroller.horizontal) {
                scrollEl.setStyle('min-width', parentEl.getWidth(true) + 'px');
                scrollEl.setHeight(parentEl.getHeight(true) || null);
            }
            else {
                scrollEl.setStyle('min-height', parentEl.getHeight(true) + 'px');
                scrollEl.setWidth(parentEl.getWidth(true) || null);
            }
            scroller.updateBounds(true);
        }

        if (this.fullscreen && Ext.is.iPad) {
            Ext.repaint();
        }
    },

    layoutOrientation: Ext.emptyFn,

    
    update: function(){
        
        Ext.Component.superclass.update.apply(this, arguments);
        var scroller = this.scroller;
        if (scroller && scroller.updateBounds){
            scroller.updateBounds(true);
        }
    },

    
    show : function(animation) {
        var rendered = this.rendered;
        if ((this.hidden || !rendered) && this.fireEvent('beforeshow', this) !== false) {
            if (this.anchorEl) {
                this.anchorEl.hide();
            }
            if (!rendered && this.autoRender) {
                this.render(Ext.isBoolean(this.autoRender) ? Ext.getBody() : this.autoRender);
            }
            this.hidden = false;
            if (this.rendered) {
                this.onShow(animation);
                this.fireEvent('show', this);
            }
        }
        return this;
    },

    
    showBy : function(alignTo, animation, allowSides, anchor) {
        if (!this.floating) {
            return this;
        }
        
        if (alignTo.isComponent) {
            alignTo = alignTo.el;
        }
        else {
            alignTo = Ext.get(alignTo);
        }

        this.x = 0;
        this.y = 0;

        this.show(animation);

        if (anchor !== false) {
            if (!this.anchorEl) {
                this.anchorEl = this.el.createChild({
                    cls: 'x-anchor'
                });
            }
            this.anchorEl.show();            
        }
        
        this.alignTo(alignTo, allowSides, 20);
    },
    
    alignTo : function(alignTo, allowSides, offset) {
        
        var alignBox = alignTo.getPageBox(),
            constrainBox = {
                width: window.innerWidth,
                height: window.innerHeight
            },
            size = this.getSize(),
            newSize = {
                width: Math.min(size.width, constrainBox.width),
                height: Math.min(size.height, constrainBox.height)
            },
            position,
            index = 2,
            positionMap = [
                'tl-bl',
                't-b',
                'tr-br',
                'l-r',
                'l-r',
                'r-l',
                'bl-tl',
                'b-t',
                'br-tr'
            ],
            anchorEl = this.anchorEl,
            offsets = [0, offset],
            targetBox, cls,
            onSides = false,
            arrowOffsets = [0, 0],
            alignCenterX = alignBox.left + (alignBox.width / 2),
            alignCenterY = alignBox.top + (alignBox.height / 2);

        if (alignCenterX <= constrainBox.width * (1/3)) {
            index = 1;
            arrowOffsets[0] = 25;
        }
        else if (alignCenterX >= constrainBox.width * (2/3)) {
            index = 3;
            arrowOffsets[0] = -30;
        }
        
        if (alignCenterY >= constrainBox.height * (2/3)) {
            index += 6;
            offsets = [0, -offset];
            arrowOffsets[1] = -10;
        }
        
        
        else if (allowSides !== false && alignCenterY >= constrainBox.height * (1/3)) {
            index += 3;
            offsets = (index <= 5) ? [offset, 0] : [-offset, 0];
            arrowOffsets = (index <= 5) ? [10, 0] : [-10, 0];
            onSides = true;
        }
        else {
            arrowOffsets[1] = 10;
        }
        
        position = positionMap[index-1];
        targetBox = this.el.getAlignToXY(alignTo, position, offsets);

        
        
        if (onSides) {
            if (targetBox[0] < 0) {
                newSize.width = alignBox.left - offset;
            }
            else if (targetBox[0] + newSize.width > constrainBox.width) {
                newSize.width = constrainBox.width - alignBox.right - offset;
            }
        }
        else {
            if (targetBox[1] < 0) {
                newSize.height = alignBox.top - offset;
            }
            else if (targetBox[1] + newSize.height > constrainBox.height) {
                newSize.height = constrainBox.height - alignBox.bottom - offset;
            }
        }
        
        if (newSize.width != size.width) {
            this.setSize(newSize.width);
        }
        else if (newSize.height != size.height) {
            this.setSize(undefined, newSize.height);
        }

        targetBox = this.el.getAlignToXY(alignTo, position, offsets);                
        this.setPosition(targetBox[0], targetBox[1]);
        
        if (anchorEl) {
            
            anchorEl.removeClass(['x-anchor-bottom', 'x-anchor-left', 'x-anchor-right', 'x-anchor-top']);
            if (offsets[1] == offset) {
                cls = 'x-anchor-top';
            }
            else if (offsets[1] == -offset) {
                cls = 'x-anchor-bottom';
            }
            else if (offsets[0] == offset) {
                cls = 'x-anchor-left';
            }
            else {
                cls = 'x-anchor-right';
            }
            targetBox = anchorEl.getAlignToXY(alignTo, position, arrowOffsets);
            anchorEl.setXY(targetBox);
            anchorEl.addClass(cls);
        }
        
        return position;
    },

    
    setCentered : function(centered, update) {
        this.centered = centered;

        if (this.rendered && update) {
            var x, y;
            if (!this.ownerCt) {
                x = (Ext.Element.getViewportWidth() / 2) - (this.getWidth() / 2);
                y = (Ext.Element.getViewportHeight() / 2) - (this.getHeight() / 2);
            }
            else {
                x = (this.ownerCt.getTargetEl().getWidth() / 2) - (this.getWidth() / 2);
                y = (this.ownerCt.getTargetEl().getHeight() / 2) - (this.getHeight() / 2);
            }
            this.setPosition(x, y);
        }

        return this;
    },

    
    hide : function(animation) {
        if (!this.hidden && this.fireEvent('beforehide', this) !== false) {
            this.hidden = true;
            if (this.rendered) {
                this.onHide(animation, true);
            }
        }
        return this;
    },

    
    onShow : function(animation) {
        this.el.show();
        
        Ext.Component.superclass.onShow.call(this, animation);
        
        if (animation === undefined || animation === true) {
            animation = this.showAnimation;
        }

        if (this.floating) {
            this.el.dom.parentNode || this.el.appendTo(document.body);

            if (animation) {
                this.el.setStyle('opacity', 0.01);
            }

            if (this.centered) {
                this.setCentered(true, true);
            }
            else {
                this.setPosition(this.x, this.y);
            }

            if (this.modal) {
                this.el.parent().mask();
            }
            if (this.hideOnMaskTap) {
                Ext.getDoc().on('touchstart', this.onFloatingTouchStart, this, {capture: true});
            }
        }
        
        if (animation) {
            

            Ext.Anim.run(this, animation, {
                out: false,
                autoClear: true
            });

            this.showAnimation = animation;
        }
    },

    
    onFloatingTouchStart : function(e, t) {
        var doc = Ext.getDoc();
        if (!this.el.contains(t)) {
            doc.on('touchend', function(e) {
                this.hide();
                if (this.stopMaskTapEvent || Ext.fly(t).hasClass('x-mask')) {
                    e.stopEvent();
                }
            }, this, {single: true, capture: true});

            e.stopEvent();
        }
    },

    
    onHide : function(animation, fireHideEvent) {
        if (animation === undefined || animation === true) {
            animation = this.showAnimation;
        }

        if (this.hideOnMaskTap && this.floating) {
            Ext.getDoc().un('touchstart', this.onFloatingTouchStart, this);
        }

        if (animation) {
            Ext.Anim.run(this, animation, {
                out: true,
                reverse: true,
                autoClear: true,
                scope: this,
                fireHideEvent: fireHideEvent,
                after: this.doHide
            });
        } else {
            this.doHide(null, {fireHideEvent: fireHideEvent});
        }
    },

    
    doHide : function(el, options) {
        this.el.hide();
        if (this.floating && this.modal) {
            this.el.parent().unmask();
        }
        if (options && options.fireHideEvent) {
            this.fireEvent('hide', this);
        }
    },

    
    setScrollable : function(config) {
        if (!this.rendered) {
            this.scroll = config;
            return;
        }

        Ext.destroy(this.scroller);
        if (config !== false) {
            var direction = Ext.isObject(config) ? config.direction: config,
                both = direction === 'both',
                horizontal = both || direction === 'horizontal',
                vertical = both || direction === true || direction === 'vertical';

            config = Ext.apply({},
            Ext.isObject(config) ? config: {}, {
                momentum: true,
                horizontal: horizontal,
                vertical: vertical
            });

            if (!this.scrollEl) {
                this.scrollEl = this.getTargetEl().createChild();
                this.originalGetTargetEl = this.getTargetEl;
                this.getTargetEl = function() {
                    return this.scrollEl;
                };
            }

            this.scroller = new Ext.util.Scroller(this.scrollEl, config);
        }
        else {
            this.getTargetEl = this.originalGetTargetEl;
        }
    },

    
    setFloating : function(floating, autoShow) {
        this.floating = !!floating;
        this.hidden = true;
        if (this.rendered) {
            if (floating !== false) {
                this.el.addClass(this.floatingCls);
                if (autoShow) {
                    this.show();
                }
            }
            else {
                this.el.removeClass(this.floatingCls);
                Ext.getDoc().un('touchstart', this.onFloatingTouchStart, this);
            }
        }
        else if (floating !== false) {
            this.autoRender = true;
        }
    },

    
    setDraggable : function(draggable, autoShow) {
        this.draggable = draggable;

        if (this.rendered) {
            if (draggable === false) {
                if (this.dragObj) {
                    this.dragObj.disable();
                }
            } else {
                if (autoShow) {
                    this.show();
                }
                if (this.dragObj) {
                    this.dragObj.enable();
                } else {
                    this.dragObj = new Ext.util.Draggable(this.el, Ext.apply({}, this.draggable || {}));
                    this.relayEvents(this.dragObj, ['dragstart', 'beforedragend' ,'drag', 'dragend']);
                }
            }
        }
    },

    
    setOrientation : function(orientation, w, h) {
        if (this.fireEvent('beforeorientationchange', this, orientation, w, h) !== false) {
            if (this.orientation != orientation) {
                this.el.removeClass('x-' + this.orientation);
                this.el.addClass('x-' + orientation);
            }

            this.orientation = orientation;
            this.layoutOrientation(orientation, w, h);

            if (this.fullscreen) {
                this.setSize(w, h);
            }

            if (this.floating && this.centered) {
                this.setCentered(true, true);
            }

            this.onOrientationChange(orientation, w, h);
            this.fireEvent('orientationchange', this, orientation, w, h);
        }
    },

    
    onOrientationChange : Ext.emptyFn,

    beforeDestroy : function() {
        if (this.floating && this.modal && !this.hidden) {
            this.el.parent().unmask();
        }
        Ext.Component.superclass.beforeDestroy.call(this);
    },
    
    onDestroy : function() {
        if (this.monitorOrientation && Ext.EventManager.orientationEvent) {
            Ext.EventManager.orientationEvent.removeListener(this.setOrientation, this);
        }
        
        Ext.Component.superclass.onDestroy.call(this);
    }
});


Ext.BoxComponent = Ext.Component;

Ext.reg('component', Ext.Component);
Ext.reg('box', Ext.BoxComponent);

Ext.lib.Container = Ext.extend(Ext.Component, {
    
    


    
    
    


    
    autoDestroy : true,

     
    defaultType: 'panel',

    isContainer : true,

    baseCls: 'x-container',

    
    initComponent : function(){
        this.addEvents(
            
            'afterlayout',
            
            'beforeadd',
            
            'beforeremove',
            
            'add',
            
            'remove',
            
            'beforecardswitch',
            
            'cardswitch'
        );

        
        this.layoutOnShow = new Ext.util.MixedCollection();
        Ext.lib.Container.superclass.initComponent.call(this);
        this.initItems();
    },

    
    initItems : function(){
        var items = this.items;
        
        this.items = new Ext.util.MixedCollection(false, this.getComponentId);

        if (items) {
            if (!Ext.isArray(items)) {
                items = [items];
            }

            this.add(items);
        }
    },

    
    afterRender : function() {
        this.getLayout();
        Ext.lib.Container.superclass.afterRender.apply(this, arguments);
    },

    
    setLayout : function(layout) {
        var currentLayout = this.layout;
        if (currentLayout && currentLayout.isLayout && currentLayout != layout) {
            currentLayout.setOwner(null);
        }
        this.layout = layout;
        layout.setOwner(this);
    },

    getLayout : function() {
        if (!this.layout || !this.layout.isLayout) {
            this.setLayout(Ext.layout.LayoutManager.create(this.layout, 'autocontainer'));
        }
        return this.layout;
    },

    
    doLayout : function() {
        var layout = this.getLayout();
        if (this.rendered && layout) {
            layout.layout();
        }
        return this;
    },

    
    afterLayout : function(layout) {
        this.fireEvent('afterlayout', this, layout);
    },

    
    prepareItems : function(items, applyDefaults) {
        if (!Ext.isArray(items)) {
            items = [items];
        }
        
        var item, i, ln;
        for (i = 0, ln = items.length; i < ln; i++) {
            item = items[i];
            if (applyDefaults) {
                item = this.applyDefaults(item);
            }
            items[i] = this.lookupComponent(item);
        }
        return items;
    },

    
    applyDefaults : function(config) {
        var defaults = this.defaults;
        if (defaults) {
            if (Ext.isFunction(defaults)) {
                defaults = defaults.call(this, config);
            }
            if (Ext.isString(config)) {
                config = Ext.ComponentMgr.get(config);
                Ext.apply(config, defaults);
            }
            else if (!config.isComponent) {
                Ext.applyIf(config, defaults);
            }
            else {
                Ext.apply(config, defaults);
            }
        }
        return config;
    },

    
    lookupComponent : function(comp) {
        if (Ext.isString(comp)) {
            return Ext.ComponentMgr.get(comp);
        }
        else {
            return this.createComponent(comp);
        }
        return comp;
    },

    
    createComponent : function(config, defaultType) {
        if (config.isComponent) {
            return config;
        }

        
        
        
        
        
        

        return Ext.create(config, defaultType || this.defaultType);
    },

    
    getComponentId : function(comp) {
        return comp.getItemId();
    },

    
    add : function() {
        var args = Array.prototype.slice.call(arguments),
            index = -1;

        if (typeof args[0] == 'number') {
            index = args.shift();
        }

        var hasMultipleArgs = args.length > 1;
        if (hasMultipleArgs || Ext.isArray(args[0])) {
            var items = hasMultipleArgs ? args : args[0],
                results = [],
                i, ln, item;

            for (i = 0, ln = items.length; i < ln; i++) {
                item = items[i];
                if (!item) {
                    throw "Trying to add a null item as a child of Container with itemId/id: " + this.getItemId();
                }
                if (index != -1) {
                    item = this.add(index + i, item);
                }
                else {
                    item = this.add(item);
                }
                results.push(item);
            }

            return results;
        }

        var cmp = this.prepareItems(args[0], true)[0];
        index = (index !== -1) ? index : this.items.length;

        if (this.fireEvent('beforeadd', this, cmp, index) !== false && this.onBeforeAdd(cmp) !== false) {
            this.items.insert(index, cmp);
            cmp.onAdded(this, index);
            this.onAdd(cmp);
            this.fireEvent('add', this, cmp, index);
        }

        return cmp;
    },

    onAdd : Ext.emptyFn,
    onRemove : Ext.emptyFn,

    
    insert : function(index, comp){
        return this.add(index, comp);
    },

    
    onBeforeAdd : function(item) {
        if (item.ownerCt) {
            item.ownerCt.remove(item, false);
        }
        if (this.hideBorders === true){
            item.border = (item.border === true);
        }
    },

    
    remove : function(comp, autoDestroy) {
        var c = this.getComponent(comp);
        if (c && this.fireEvent('beforeremove', this, c) !== false) {
            this.doRemove(c, autoDestroy);
            this.fireEvent('remove', this, c);
        }
        return c;
    },

    
    doRemove : function(component, autoDestroy) {
        var layout = this.layout,
            hasLayout = layout && this.rendered;

        this.items.remove(component);
        component.onRemoved();
        if (hasLayout) {
            layout.onRemove(component);
        }
        this.onRemove(component);

        if (autoDestroy === true || (autoDestroy !== false && this.autoDestroy)) {
            component.destroy();
        }

        if (hasLayout) {
            layout.afterRemove(component);
        }
    },

    
    removeAll : function(autoDestroy) {
        var item,
            removeItems = this.items.items.slice(),
            items = [],
            ln = removeItems.length,
            i;
        for (i = 0; i < ln; i++) {
            item = removeItems[i];
            this.remove(item, autoDestroy);
            if (item.ownerCt !== this) {
                items.push(item);
            }
        }
        return items;
    },

    
    
    
    
    getRefItems : function(deep) {
        var items = this.items.items.slice(),
            ln = items.length,
            i, item;

        if (deep) {
            for (i = 0; i < ln; i++) {
                item = items[i];
                if (item.getRefItems) {
                    items = items.concat(item.getRefItems(true));
                }
            }
        }

        return items;
    },

    
    getComponent : function(comp) {
        if (Ext.isObject(comp)) {
            comp = comp.getItemId();
        }
        return this.items.get(comp);
    },

    query : function(selector) {
        return Ext.ComponentQuery.query(selector, this);
    },

    child : function(selector) {
        return this.query('> ' + selector)[0] || null;
    },

    down : function(selector) {
        return this.query(selector)[0] || null;
    },

    show : function() {
        Ext.lib.Container.superclass.show.call(this);
        var layoutCollection = this.layoutOnShow,
            ln = layoutCollection.getCount(),
            i = 0,
            needsLayout,
            item;
        for (; i < ln; i++) {
            item = layoutCollection.get(i);
            needsLayout = item.needsLayout;
            if (Ext.isObject(needsLayout)) {
                item.doComponentLayout(needsLayout.width, needsLayout.height, needsLayout.isSetSize);
            }
        }
        layoutCollection.clear();
    },

    
    beforeDestroy : function() {
        var c;
        if (this.items) {
            c = this.items.first();
            while (c) {
                this.doRemove(c, true);
                c = this.items.first();
            }
        }
        Ext.destroy(this.layout);
        Ext.lib.Container.superclass.beforeDestroy.call(this);
    }
});

Ext.Container = Ext.extend(Ext.lib.Container, {
    
    animation: null,

    
    afterLayout : function(layout) {
        if (this.floating && this.centered) {
            this.setCentered(true, true);
        }

        if (this.scroller) {
            this.scroller.updateBounds();
        }
        Ext.Container.superclass.afterLayout.call(this, layout);
    },

    
    getActiveItem : function() {
        if (this.layout && this.layout.type == 'card') {
            return this.layout.activeItem;
        }
        else {
            return null;
        }
    },

    
    setCard : function(card, animation) {
        this.layout.setActiveItem(card, animation);
        return this;
    },

    
    onBeforeCardSwitch : function(newCard, oldCard, newIndex, animated) {
        return this.fireEvent('beforecardswitch', this, newCard, oldCard, newIndex, animated);
    },

    
    onCardSwitch : function(newCard, oldCard, newIndex, animated) {
        return this.fireEvent('cardswitch', this, newCard, oldCard, newIndex, animated);
    },

    
    disable: function() {
        Ext.Container.superclass.disable.call(this);
        this.el.mask();
    },

    
    enable: function() {
        Ext.Container.superclass.enable.call(this);
        this.el.unmask();
    }
});

Ext.reg('container', Ext.Container);


Ext.lib.Panel = Ext.extend(Ext.Container, {
    
    baseCls : 'x-panel',

    

    

    

    isPanel: true,

    componentLayout: 'dock',

    renderTpl: ['<div class="{baseCls}-body<tpl if="bodyCls"> {bodyCls}</tpl>"<tpl if="bodyStyle"> style="{bodyStyle}"</tpl>></div>'],

    

    initComponent : function() {
        this.addEvents(
            
            'bodyresize'
            
            
            
            
        );

        Ext.applyIf(this.renderSelectors, {
            body: '.' + this.baseCls + '-body'
        });

        Ext.lib.Panel.superclass.initComponent.call(this);
    },

    
    initItems : function() {
        Ext.lib.Panel.superclass.initItems.call(this);

        var items = this.dockedItems;
        this.dockedItems = new Ext.util.MixedCollection(false, this.getComponentId);
        if (items) {
            this.addDocked(items);
        }
    },

    
    getDockedComponent: function(comp) {
        if (Ext.isObject(comp)) {
            comp = comp.getItemId();
        }
        return this.dockedItems.get(comp);
    },

    
    getComponent: function(comp) {
        var component = Ext.lib.Panel.superclass.getComponent.call(this, comp);
        if (component == undefined) {
            component = this.getDockedComponent(comp);
        }
        return component;
    },

    
    initBodyStyles: function() {
        var bodyStyle = Ext.isString(this.bodyStyle) ? this.bodyStyle.split(';') : [],
            Element = Ext.Element;

        if (this.bodyPadding != undefined) {
            bodyStyle.push('padding: ' + Element.unitizeBox((this.bodyPadding === true) ? 5 : this.bodyPadding));
        }
        if (this.bodyMargin != undefined) {
            bodyStyle.push('margin: ' + Element.unitizeBox((this.bodyMargin === true) ? 5 : this.bodyMargin));
        }
        if (this.bodyBorder != undefined) {
            bodyStyle.push('border-width: ' + Element.unitizeBox((this.bodyBorder === true) ? 1 : this.bodyBorder));
        }
        delete this.bodyStyle;
        return bodyStyle.length ? bodyStyle.join(';') : undefined;
    },

    
    initRenderData: function() {
        return Ext.applyIf(Ext.lib.Panel.superclass.initRenderData.call(this), {
            bodyStyle: this.initBodyStyles(),
            bodyCls: this.bodyCls
        });
    },

    
    addDocked : function(items, pos) {
        items = this.prepareItems(items);

        var item, i, ln;
        for (i = 0, ln = items.length; i < ln; i++) {
            item = items[i];
            if (pos !== undefined) {
                this.dockedItems.insert(pos+i, item);
            }
            else {
                this.dockedItems.add(item);
            }
            item.onAdded(this, i);
            this.onDockedAdd(item);
        }
        if (this.rendered) {
            this.doComponentLayout();
        }
    },

    
    onDockedAdd : Ext.emptyFn,
    onDockedRemove : Ext.emptyFn,

    
    insertDocked : function(pos, items) {
        this.addDocked(items, pos);
    },

    
    removeDocked : function(item, autoDestroy) {
        if (!this.dockedItems.contains(item)) {
            return item;
        }

        var layout = this.componentLayout,
            hasLayout = layout && this.rendered;

        if (hasLayout) {
            layout.onRemove(item);
        }

        this.dockedItems.remove(item);
        item.onRemoved();
        this.onDockedRemove(item);

        if (autoDestroy === true || (autoDestroy !== false && this.autoDestroy)) {
            item.destroy();
        }

        if (hasLayout) {
            layout.afterRemove(item);
        }
        this.doComponentLayout();

        return item;
    },

    
    getDockedItems : function() {
        if (this.dockedItems && this.dockedItems.items.length) {
            return this.dockedItems.items.slice();
        }
        return [];
    },

    
    getTargetEl : function() {
        return this.body;
    },


    getRefItems: function(deep) {
        var refItems    = Ext.lib.Panel.superclass.getRefItems.call(this, deep),
            
            dockedItems = this.getDockedItems(),
            ln          = dockedItems.length,
            i           = 0,
            item;

        refItems = refItems.concat(dockedItems);

        if (deep) {
            for (; i < ln; i++) {
                item = dockedItems[i];
                if (item.getRefItems) {
                    refItems = refItems.concat(item.getRefItems(true));
                }
            }
        }

        return refItems;
    }
});

Ext.Panel = Ext.extend(Ext.lib.Panel, {
    
    scroll: false,

    
    fullscreen: false
});

Ext.reg('panel', Ext.Panel);



Ext.Button = Ext.extend(Ext.Component, {
    

    initComponent: function(){
        this.addEvents(
            
            'tap',
            
            
            'beforetap'
        );
        Ext.Button.superclass.initComponent.call(this);

        this.createAutoHandler();
    },

    
    hidden : false,
    
    disabled : false,

    
     
    
     iconAlign: 'left',

    

    
     
    
    iconAlign: 'left',
    
    

    

    

    

    
    baseCls: 'x-button',

    
    pressedCls: 'x-button-pressed',

    
    badgeText: '',

    
    badgeCls: 'x-badge',

    hasBadgeCls: 'x-hasbadge',

    labelCls: 'x-button-label',

    
    ui: 'normal',

    isButton: true,

    

    
    pressedDelay: 0,
    
    
    iconMaskCls: 'x-icon-mask',
    
    
    iconMask: false,

    
    afterRender : function(ct, position) {
        var me = this;
        
        Ext.Button.superclass.afterRender.call(me, ct, position);

        var text = me.text,
            icon = me.icon,
            iconCls = me.iconCls,
            badgeText = me.badgeText;

        me.text = me.icon = me.iconCls = me.badgeText = null;

        me.setText(text);
        me.setIcon(icon);
        me.setIconClass(iconCls);
        
        if (me.iconMask && me.iconEl) {
            me.iconEl.addClass(me.iconMaskCls);
        }
        me.setBadge(badgeText);
    },

    
    initEvents : function() {
        var me = this;
        
        Ext.Button.superclass.initEvents.call(me);

        me.mon(me.el, {
            scope: me,
            
            tap      : me.onPress,
            tapstart : me.onTapStart,
            tapcancel: me.onTapCancel
        });
    },

    
    onTapStart : function() {
        var me = this;
        if (!me.disabled) {
            if (me.pressedDelay) {
                me.pressedTimeout = setTimeout(function() {
                    me.el.addClass(me.pressedCls);
                }, Ext.isNumber(me.pressedDelay) ? me.pressedDelay : 100);
            }
            else {
                me.el.addClass(me.pressedCls);
            }
        }
    },

    
    onTapCancel : function() {
        var me = this;
        if (me.pressedTimeout) {
            clearTimeout(me.pressedTimeout);
            delete me.pressedTimeout;
        }
        me.el.removeClass(me.pressedCls);
    },

    
    setHandler : function(handler, scope) {
        this.handler = handler;
        this.scope = scope;
        return this;
    },

    
    setText: function(text) {
        var me = this;
        
        if (me.rendered) {
            if (!me.textEl && text) {
                me.textEl = me.el.createChild({
                    tag: 'span',
                    html: text,
                    cls: this.labelCls
                });
            }
            else if (me.textEl && text != me.text) {
                if (text) {
                    me.textEl.setHTML(text);
                }
                else {
                    me.textEl.remove();
                    me.textEl = null;
                }
            }
        }
        me.text = text;
        return me;
    },

    
    setIcon: function(icon) {
        var me = this;
        
        if (me.rendered) {
            if (!me.iconEl && icon) {
                me.iconEl = me.el.createChild({
                    tag: 'img',
                    src: Ext.BLANK_IMAGE_URL,
                    style: 'background-image: ' + (icon ? 'url(' + icon + ')' : '')
                });
                
                me.setIconAlign(me.iconAlign);
            }
            else if (me.iconEl && icon != me.icon) {
                if (icon) {
                    me.iconEl.setStyle('background-image', icon ? 'url(' + icon + ')' : '');
                    me.setIconAlign(me.iconAlign);
                }
                else {
                    me.setIconAlign(false);
                    me.iconEl.remove();
                    me.iconEl = null;
                }
            }
        }
        me.icon = icon;
        return me;
    },

    
    setIconClass: function(cls) {
        var me = this;
        
        if (me.rendered) {
            if (!me.iconEl && cls) {
                me.iconEl = me.el.createChild({
                    tag: 'img',
                    src: Ext.BLANK_IMAGE_URL,
                    cls: cls
                });
                
                me.setIconAlign(me.iconAlign);
            }
            else if (me.iconEl && cls != me.iconCls) {
                if (cls) {
                    if (me.iconCls) {
                        me.iconEl.removeClass(me.iconCls);
                    }
                    me.iconEl.addClass(cls);
                    me.setIconAlign(me.iconAlign);
                }
                else {
                    me.setIconAlign(false);
                    me.iconEl.remove();
                    me.iconEl = null;
                }
            }
        }
        me.iconCls = cls;
        return me;
    },
    
    
    setIconAlign: function(alignment) {
        var me         = this,
            alignments = ['top', 'right', 'bottom', 'left'],
            alignment  = ((alignments.indexOf(alignment) == -1 || !alignment) && alignment !== false) ? me.iconAlign : alignment,
            i;
        
        if (me.rendered && me.iconEl) {
            me.el.removeClass('x-iconalign-' + me.iconAlign);
            
            if (alignment) me.el.addClass('x-iconalign-' + alignment);
        }
        me.iconAlign = (alignment === false) ? me.iconAlign : alignment;
        return me;
    },

    
    setBadge : function(text) {
        var me = this;
        
        if (me.rendered) {
            if (!me.badgeEl && text) {
                me.badgeEl = me.el.createChild({
                    tag: 'span',
                    cls: me.badgeCls,
                    html: text
                });
                me.el.addClass(me.hasBadgeCls);
            }
            else if (me.badgeEl && text != me.badgeText) {
                if (text) {
                    me.badgeEl.setHTML(text);
                    me.el.addClass(me.hasBadgeCls);
                }
                else {
                    me.badgeEl.remove();
                    me.badgeEl = null;
                    me.el.removeClass(me.hasBadgeCls);
                }
            }
        }
        me.badgeText = text;
        return me;
    },

    
    getText : function() {
        return this.text;
    },

    
    getBadgeText : function() {
        return this.badgeText;
    },

    
    onDisable : function() {
        this.onDisableChange(true);
    },

    
    onEnable : function() {
        this.onDisableChange(false);
    },

    
    onDisableChange : function(disabled) {
        var me = this;
        if (me.el) {
            me.el[disabled ? 'addClass' : 'removeClass'](me.disabledClass);
            me.el.dom.disabled = disabled;
        }
        me.disabled = disabled;
    },

    
    onPress : function(e) {
        var me = this;
        if (!me.disabled && this.fireEvent('beforetap') !== false) {
            setTimeout(function() {
                if (!me.preventCancel) {
                    me.onTapCancel();
                }
                me.callHandler(e);
                me.fireEvent('tap', me, e);                
            }, 10);
        }
    },

    
    callHandler: function(e) {
        var me = this;
        if (me.handler) {
            me.handler.call(me.scope || me, me, e);
        }
    },

    
    createAutoHandler: function() {
        var me = this,
            autoEvent = me.autoEvent;

        if (autoEvent) {
            if (typeof autoEvent == 'string') {
                autoEvent = {
                    name: autoEvent,
                    scope: me.scope || me
                };
            }

            me.addEvents(autoEvent.name);

            me.setHandler(function() {
                autoEvent.scope.fireEvent(autoEvent.name, me);
            }, autoEvent.scope);
        }
    }
});

Ext.reg('button', Ext.Button);


Ext.SegmentedButton = Ext.extend(Ext.Container, {
    defaultType: 'button',
    cmpCls: 'x-segmentedbutton',
    pressedCls: 'x-button-pressed',

    
    allowMultiple: false,

    
    
    
    initComponent : function() {
        this.layout = Ext.apply({}, this.layout || {}, {
            type: 'hbox',
            align: 'stretch'
        });
        
        Ext.SegmentedButton.superclass.initComponent.call(this);
        
        if (this.allowDepress === undefined) {
            this.allowDepress = this.allowMultiple;
        }
        
        this.addEvents(
            
            'toggle'
        );
    },

    
    initEvents : function() {
        Ext.SegmentedButton.superclass.initEvents.call(this);

        this.mon(this.el, {
            tap: this.onTap,
            capture: true,
            scope: this
        });
    },

    
    afterLayout : function(layout) {
        var me = this;
        
        Ext.SegmentedButton.superclass.afterLayout.call(me, layout);

        if (!me.initialized) {
            me.items.each(function(item, index) {
                me.setPressed(item, !!item.pressed, true); 
            });
            if (me.allowMultiple) {
                me.pressedButtons = me.getPressedButtons();
            }
            me.initialized = true;
        }
    },

    
    onTap : function(e, t) {
        if (!this.disabled && (t = e.getTarget('.x-button'))) {
            this.setPressed(t.id, this.allowDepress ? undefined : true);
        }
    },
    
    
    getPressed : function() {
        return this.allowMultiple ? this.getPressedButtons() : this.pressedButton;
    },

    
    setPressed : function(btn, pressed, suppressEvents) {
        var me = this;
        
        btn = me.getComponent(btn);
        if (!btn || !btn.isButton || btn.disabled) {
            if (!me.allowMultiple && me.pressedButton) {
                me.setPressed(me.pressedButton, false);
            }
            return;
        }
        
        if (!Ext.isBoolean(pressed)) {
            pressed = !btn.pressed;
        }
        
        if (pressed) {
            if (!me.allowMultiple) {
                if (me.pressedButton && me.pressedButton !== btn) {
                    me.pressedButton.el.removeClass(me.pressedCls);
                    me.pressedButton.pressed = false;
                    if (suppressEvents !== true) {
                        me.fireEvent('toggle', me, me.pressedButton, false);
                    }               
                }
                me.pressedButton = btn;
            }

            btn.el.addClass(me.pressedCls);
            btn.pressed = true;
            btn.preventCancel = true;
            if (me.initialized && suppressEvents !== true) {
                me.fireEvent('toggle', me, btn, true);
            }
        }
        else if (!pressed) {
            if (!me.allowMultiple && btn === me.pressedButton) {
                me.pressedButton = null;
            }
            
            if (btn.pressed) {
                btn.el.removeClass(me.pressedCls);
                btn.pressed = false;
                if (suppressEvents !== true) {
                    me.fireEvent('toggle', me, btn, false);
                }
            }
        }
        
        if (me.allowMultiple && me.initialized) {
            me.pressedButtons = me.getPressedButtons();
        }
    },
    
    
    getPressedButtons : function(toggleEvents) {
        var pressed = this.items.filterBy(function(item) {
            return item.isButton && !item.disabled && item.pressed;
        });
        return pressed.items;
    },

    
    disable : function() {
        this.items.each(function(item) {
            item.disable();
        });

        Ext.SegmentedButton.superclass.disable.apply(this, arguments);
    },

    
    enable : function() {
        this.items.each(function(item) {
            item.enable();
        }, this);

        Ext.SegmentedButton.superclass.enable.apply(this, arguments);
    }
});

Ext.reg('segmentedbutton', Ext.SegmentedButton);

Ext.DataPanel = Ext.extend(Ext.Panel, {
    

    

    
    
    
    
    
    blockRefresh: false,

    
    initComponent: function() {
        if (Ext.isString(this.tpl) || Ext.isArray(this.tpl)) {
            this.tpl = new Ext.XTemplate(this.tpl);
        }

        this.store = Ext.StoreMgr.lookup(this.store);
        this.all = new Ext.CompositeElementLite();
        this.instances = new Ext.util.MixedCollection();

        if (this.components) {
            if (Ext.isFunction(this.components)) {
                this.components = [{config: this.components}];
            }
            else if (Ext.isObject(this.components)) {
                this.components = [this.components];
            }     
            if (!this.tpl) {
                this.tpl = new Ext.XTemplate('<tpl for="."><div class="x-list-item"></div></tpl>', {compiled: true});
                this.itemSelector = '.x-list-item';
            }         
        }
        
        this.addEvents('refresh');
        
        Ext.DataPanel.superclass.initComponent.call(this);
    },


    
    afterRender: function(){
        Ext.DataPanel.superclass.afterRender.call(this);

        var components = this.components,
            ln, i, component, delegate;        
        if (components) {
            for (i = 0, ln = components.length; i < ln; i++) {
                component = components[i];
                if (component.listeners) {
                    component.delegateCls = Ext.id(null, 'x-cmp-');
                    component.listeners.delegate = (component.targetSelector || this.itemSelector) + ' > .' + component.delegateCls;
                    this.mon(this.getTemplateTarget(), component.listeners);                    
                }
            }
        }
        
        if (this.store) {
            this.bindStore(this.store, true);
        }
    },

    
    getStore: function(){
        return this.store;
    },

    
    refresh: function(force) {
        if (force == undefined)
            force = true;

        if (!force && this.blockRefresh === true)
            return;

        if (!this.rendered) {
            return;
        }

        var el = this.getTemplateTarget(),
            records = this.getRenderRecords();
        if (records.length < 1) {
            this.all.clear();
        }
        else {
            this.tpl.overwrite(el, this.collectData(records, 0));
            this.all.fill(Ext.query(this.itemSelector, el.dom));
        }
        this.updateItems(0);
        this.fireEvent('refresh', this, records);
    },

    
    getRenderRecords : function() {
        return this.store.getRange();
    },
    
    
    getTemplateTarget: function() {
        return this.scrollEl || this.body;
    },

    
    prepareData: function(data, index, record) {
        var addRecordToData = this.addRecordToData,
            shouldAdd       = !!addRecordToData,
            recordKey       = Ext.isString(addRecordToData) ? addRecordToData : 'record';
        
        if (shouldAdd) {
            data[recordKey] = record;
        }
        
        return data;
    },

    
    collectData: function(records, startIndex) {
        var results = [],
            i, ln = records.length;
        for (i = 0; i < ln; i++) {
            results[results.length] = this.prepareData(records[i].data, startIndex + i, records[i]);
        }
        return results;
    },

    
    bindStore: function(store, initial) {
        if (!this.rendered) {
            this.store = store;
            return;
        }

        if (!initial && this.store) {
            if (store !== this.store && this.store.autoDestroy) {
                this.store.destroyStore();
            }
            else {
                this.store.un({
                    scope: this,
                    beforeload: this.onBeforeLoad,
                    datachanged: this.onDataChanged,
                    add: this.onAdd,
                    remove: this.onRemove,
                    update: this.onUpdate,
                    clear: this.refresh
                });
            }
            if (!store) {
                this.store = null;
            }
        }
        if (store) {
            store = Ext.StoreMgr.lookup(store);
            store.on({
                scope: this,
                beforeload: this.onBeforeLoad,
                datachanged: this.onDataChanged,
                add: this.onAdd,
                remove: this.onRemove,
                update: this.onUpdate,
                clear: this.refresh
            });
        }
        this.store = store;
        if (store) {
            this.refresh(false);
        }
    },

    
    onBeforeLoad: Ext.emptyFn,

    
    bufferRender: function(records, index) {
        var div = document.createElement('div');
        this.tpl.overwrite(div, this.collectData(records, index));
        return Ext.query(this.itemSelector, div);
    },

    
    onUpdate: function(ds, record) {
        var index = this.store.indexOf(record),
            sel, original, node;
        
        if (index > -1) {
            sel = this.isSelected(index);
            original = this.all.elements[index];
            node = this.bufferRender([record], index)[0];

            this.all.replaceElement(index, node, true);
            if (sel) {
                this.selected.replaceElement(original, node);
                this.all.item(index).addClass(this.selectedClass);
            }
            this.updateItems(index, index);
        }
    },

    
    onAdd: function(ds, records, index) {
        if (this.all.getCount() === 0) {
            this.refresh(false);
            return;
        }
        var nodes = this.bufferRender(records, index), n, a = this.all.elements;
        if (index < this.all.getCount()) {
            n = this.all.item(index).insertSibling(nodes, 'before', true);
            a.splice.apply(a, [index, 0].concat(nodes));
        }
        else {
            n = this.all.last().insertSibling(nodes, 'after', true);
            a.push.apply(a, nodes);
        }
        this.updateItems(index);
    },

    
    onRemove: function(ds, record, index) {
        this.deselect(index);
        this.onRemoveItem(this.all.item(index), index);
        this.all.removeElement(index, true);
        if (this.store.getCount() === 0){
            this.refresh(false);
        }
        if (this.components) {
            this.cleanInstances();
        }
    },

    
    refreshNode: function(index){
        this.onUpdate(this.store, this.store.getAt(index));
    },

    
    updateItems: function(startIndex, endIndex) {
        var ns = this.all.elements;
        startIndex = startIndex || 0;
        endIndex = endIndex || ((endIndex === 0) ? 0 : (ns.length - 1));
        for(var i = startIndex; i <= endIndex; i++){
            ns[i].viewIndex = i;
            if (this.components) {
                this.createInstances(ns[i]);
            }
            this.onUpdateItem(ns[i], i);
        }
        if (this.components) {
            this.cleanInstances();
        }
        
    },

    
    onUpdateItem: Ext.emptyFn,

    
    onRemoveItem: Ext.emptyFn,
    
    createInstances : function(node) {
        var id = Ext.id(node),
            components = this.components,
            ln = components.length,
            i, component, instance, target;

        for (i = 0; i < ln; i++) {
            component = components[i];
            target = component.targetSelector ? Ext.fly(node).down(component.targetSelector, true) : node;
            if (target) {
                if (Ext.isObject(component.config)) {
                    instance = Ext.create(component.config, 'button');
                }
                else if (Ext.isFunction(component.config)) {
                    instance = component.config.call(this, this.getRecord(node), node, node.viewIndex);
                }
                if (instance) {
                    this.instances.add(instance);
                    instance.addClass(component.delegateCls);
                    instance.render(target);
                    instance.doComponentLayout();              
                }
            }            
        }
    },
    
    cleanInstances : function() {
        this.instances.each(function(instance) {
            if (!document.getElementById(instance.id)) {
                this.instances.remove(instance);
                instance.destroy();
            }
        }, this);
    },

    
    onDataChanged: function() {
        this.refresh(false);
    },

    
    findItemFromChild: function(node) {
        return Ext.fly(node).findParent(this.itemSelector, this.getTemplateTarget());
    },

    
    getRecords: function(nodes) {
        var r = [],
            s = nodes,
            len = s.length,
            i;
        for (i = 0; i < len; i++) {
            r[r.length] = this.store.getAt(s[i].viewIndex);
        }
        return r;
    },

    
    getRecord: function(node) {
        return this.store.getAt(node.viewIndex);
    },

    
    getNode: function(nodeInfo) {
        if (Ext.isString(nodeInfo)) {
            return document.getElementById(nodeInfo);
        }
        else if (Ext.isNumber(nodeInfo)) {
            return this.all.elements[nodeInfo];
        }
        else if (nodeInfo instanceof Ext.data.Model) {
            var idx = this.store.indexOf(nodeInfo);
            return this.all.elements[idx];
        }
        return nodeInfo;
    },

    
    getNodes: function(start, end) {
        var ns = this.all.elements,
            nodes = [],
            i;
        start = start || 0;
        end = !Ext.isDefined(end) ? Math.max(ns.length - 1, 0) : end;
        if (start <= end) {
            for (i = start; i <= end && ns[i]; i++) {
                nodes.push(ns[i]);
            }
        }
        else {
            for (i = start; i >= end && ns[i]; i--) {
                nodes.push(ns[i]);
            }
        }
        return nodes;
    },

    
    indexOf: function(node) {
        node = this.getNode(node);
        if (Ext.isNumber(node.viewIndex)) {
            return node.viewIndex;
        }
        return this.all.indexOf(node);
    },

    
    onDestroy: function() {
        this.all.clear();
        Ext.DataPanel.superclass.onDestroy.call(this);
        this.bindStore(null);
    }
});

Ext.reg('datapanel', Ext.DataPanel);


Ext.DataView = Ext.extend(Ext.DataPanel, {
    scroll: 'vertical',

    
    
    
    
    selectedCls : "x-item-selected",
    
    pressedCls : "x-item-pressed",

    
    pressedDelay: 100,

    
    emptyText : "",

    
    deferEmptyText: true,


    
    tapEvent: 'singletap',

    
    last: false,

    
    initComponent: function() {

        this.selected = new Ext.CompositeElementLite();

        Ext.DataView.superclass.initComponent.call(this);

        this.addEvents(
            
            'itemtap',

            
            'itemdoubletap',

            
            'itemswipe',

            
            "containertap",

            
            "selectionchange",

            
            "beforeselect"
        );

    },

    
    afterRender: function() {
        var me = this;

        Ext.DataView.superclass.afterRender.call(me);

        var eventHandlers = {
            tapstart : me.onTapStart,
            tapcancel: me.onTapCancel,
            touchend : me.onTapCancel,
            doubletap: me.onDoubleTap,
            swipe    : me.onSwipe,
            scope    : me
        };
        eventHandlers[this.tapEvent] = me.onTap;
        me.mon(me.getTemplateTarget(), eventHandlers);
    },

    
    refresh: function() {
        if (!this.rendered) {
            return;
        }

        var el = this.getTemplateTarget();
        el.update('');

        this.clearSelections(false, true);
        if (this.store.getRange().length < 1 && (!this.deferEmptyText || this.hasSkippedEmptyText)) {
            el.update(this.emptyText);
        }
        this.hasSkippedEmptyText = true;
        Ext.DataView.superclass.refresh.call(this);
    },

    
    findTarget: function(e){
        return e.getTarget(this.itemSelector, this.getTemplateTarget());
    },

    
    onTap: function(e) {
        var item = this.findTarget(e);
        if (item) {
            Ext.fly(item).removeClass(this.pressedCls);
            var index = this.indexOf(item);
            if (this.onItemTap(item, index, e) !== false) {
                this.fireEvent("itemtap", this, index, item, e);
            }
        }
        else {
            if(this.fireEvent("containertap", this, e) !== false) {
                this.onContainerTap(e);
            }
        }
    },

    
    onTapStart: function(e, t) {
        var me = this,
            item = this.findTarget(e);

        if (item) {
            if (me.pressedDelay) {
                if (me.pressedTimeout) {
                    clearTimeout(me.pressedTimeout);
                }
                me.pressedTimeout = setTimeout(function() {
                    Ext.fly(item).addClass(me.pressedCls);
                }, Ext.isNumber(me.pressedDelay) ? me.pressedDelay : 100);
            }
            else {
                Ext.fly(item).addClass(me.pressedCls);
            }
        }
    },

    
    onTapCancel: function(e, t) {
        var me = this,
            item = this.findTarget(e);

        if (me.pressedTimeout) {
            clearTimeout(me.pressedTimeout);
            delete me.pressedTimeout;
        }

        if (item) {
            Ext.fly(item).removeClass(me.pressedCls);
        }
    },

    
    onContainerTap: function(e) {
        this.clearSelections();
    },

    
    onDoubleTap: function(e) {
        var item = this.findTarget(e);
        if (item) {
            this.fireEvent("itemdoubletap", this, this.indexOf(item), item, e);
        }
    },

    
    onSwipe: function(e) {
        var item = this.findTarget(e);
        if (item) {
            this.fireEvent("itemswipe", this, this.indexOf(item), item, e);
        }
    },

    
    onItemTap: function(item, index, e) {
        if (this.pressedTimeout) {
            clearTimeout(this.pressedTimeout);
            delete this.pressedTimeout;
        }

        if (this.multiSelect) {
            this.doMultiSelection(item, index, e);
            e.preventDefault();
        }
        else if (this.singleSelect) {
            this.doSingleSelection(item, index, e);
            e.preventDefault();
        }
        return true;
    },

    
    doSingleSelection: function(item, index, e) {
        if (this.isSelected(index)) {
            this.deselect(index);
        }
        else {
            this.select(index, false);
        }
    },

    
    doMultiSelection: function(item, index, e) {
        if (this.isSelected(index)) {
            this.deselect(index);
        }
        else {
            this.select(index, true);
        }
    },

    
    getSelectionCount: function() {
        return this.selected.elements.length;
    },

    
    getSelectedNodes: function() {
        return this.selected.elements;
    },

    
    getSelectedIndexes: function() {
        var indexes = [],
            s = this.selected.elements,
            len = s.length,
            i;
        for (i = 0; i < len; i++) {
            indexes.push(s[i].viewIndex);
        }
        return indexes;
    },

    
    getSelectedRecords: function() {
        var r = [],
            s = this.selected.elements,
            len = s.length,
            i;
        for (i = 0; i < len; i++) {
            r[r.length] = this.store.getAt(s[i].viewIndex);
        }
        return r;
    },

    
    clearSelections: function(suppressEvent, skipUpdate) {
        if ((this.multiSelect || this.singleSelect) && this.getSelectionCount() > 0) {
            if (!skipUpdate) {
                this.selected.removeClass(this.selectedCls);
            }
            this.selected.clear();
            this.last = false;
            if (!suppressEvent) {
                this.fireEvent("selectionchange", this, this.selected.elements, this.getSelectedRecords());
            }
        }
    },

    
    isSelected: function(node) {
        return this.selected.contains(this.getNode(node));
    },

    
    deselect: function(node) {
        if (this.isSelected(node)) {
            node = this.getNode(node);
            this.selected.removeElement(node);
            if (this.last == node.viewIndex) {
                this.last = false;
            }
            Ext.fly(node).removeClass(this.selectedCls);
            this.fireEvent("selectionchange", this, this.selected.elements, []);
        }
    },

    
    select: function(nodeInfo, keepExisting, suppressEvent) {
        if (Ext.isArray(nodeInfo)) {
            if(!keepExisting){
                this.clearSelections(true);
            }
            for (var i = 0, len = nodeInfo.length; i < len; i++) {
                this.select(nodeInfo[i], true, true);
            }
            if (!suppressEvent) {
                this.fireEvent("selectionchange", this, this.selected.elements, this.getSelectedRecords());
            }
        } else{
            var node = this.getNode(nodeInfo);
            if (!keepExisting) {
                this.clearSelections(true);
            }
            if (node && !this.isSelected(node)) {
                if (this.fireEvent("beforeselect", this, node, this.selected.elements) !== false) {
                    Ext.fly(node).addClass(this.selectedCls);
                    this.selected.add(node);
                    this.last = node.viewIndex;
                    if (!suppressEvent) {
                        this.fireEvent("selectionchange", this, this.selected.elements, this.getSelectedRecords());
                    }
                }
            }
        }
    },

    
    selectRange: function(start, end, keepExisting) {
        if (!keepExisting) {
            this.clearSelections(true);
        }
        this.select(this.getNodes(start, end), true);
    },

    
    onBeforeLoad: function() {
        if (this.loadingText) {
            this.clearSelections(false, true);
            this.getTemplateTarget().update('<div class="loading-indicator">'+this.loadingText+'</div>');
            this.all.clear();
        }
    },

    onDataChanged: function() {
        Ext.DataView.superclass.onDataChanged.apply(this, arguments);
        if (this.scroller) {
            this.scroller.updateBounds(true);
        }
    },

    
    onDestroy: function() {
        this.selected.clear();
        Ext.DataView.superclass.onDestroy.call(this);
    }
});


Ext.DataView.prototype.setStore = Ext.DataView.prototype.bindStore;

Ext.reg('dataview', Ext.DataView);


Ext.List = Ext.extend(Ext.DataView, {
    cmpCls: 'x-list',

    
    pinHeaders: (Ext.is.Android || Ext.is.Blackberry) ? false : true,

    
    indexBar: false,

    
    grouped: false,

    
    clearSelectionOnDeactivate: true,


    renderTpl: [
        '<div class="{baseCls}-body"<tpl if="bodyStyle"> style="{bodyStyle}"</tpl>>',
            '<tpl if="grouped"><h3 class="x-list-header x-list-header-swap x-hidden-display"></h3></tpl>',
        '</div>'
    ],

    groupTpl : [
        '<tpl for=".">',
            '<div class="x-list-group x-group-{id}">',
                '<h3 class="x-list-header">{group}</h3>',
                '<div class="x-list-group-items">',
                    '{items}',
                '</div>',
            '</div>',
        '</tpl>'
    ],

    
    disclosure : false,

    
    initComponent : function() {
        if (this.scroll !== false) {
            this.scroll = {
                direction: 'vertical',
                scrollbars: false
            };
        }

        if (this.grouped) {
            this.itemTpl = this.tpl;
            if (Ext.isString(this.itemTpl) || Ext.isArray(this.itemTpl)) {
                this.itemTpl = new Ext.XTemplate(this.itemTpl);
            }
            if (Ext.isString(this.groupTpl) || Ext.isArray(this.groupTpl)) {
                this.tpl = new Ext.XTemplate(this.groupTpl);
            }
        }
        else {
            this.indexBar = false;
        }

        if (this.indexBar) {
            var indexBarConfig = Ext.apply({}, Ext.isObject(this.indexBar) ? this.indexBar : {}, {
                xtype: 'indexbar',
                dock: 'right',
                overlay: true,
                stretch: true,
                alphabet: true
            });
            this.indexBar = new Ext.IndexBar(indexBarConfig);
            this.dockedItems = this.dockedItems || [];
            this.dockedItems.push(this.indexBar);
            this.cls = this.cls || '';
            this.cls += ' x-list-indexed';
        } else if (this.scroll) {
            this.scroll.scrollbars = true;
        }

        Ext.List.superclass.initComponent.call(this);

        if (this.disclosure) {
            
            
            if (Ext.isFunction(this.disclosure)) {
                this.disclosure = {
                    scope: this,
                    handler: this.disclosure
                };
            }
            this.components = this.components || [];
            
            
            this.components.push({
                config: Ext.apply({}, this.disclosure.config || {}, {
                    xtype: 'button',
                    baseCls: 'x-disclosure'
                }),
                listeners: {
                    tap: this.onDisclosureTap,
                    scope: this
                }
            });
        }

        this.on('deactivate', this.onDeactivate, this);

        this.addEvents(
            
            
            
            
            
            
            
            
            

            
            'disclose'
        );
    },

    
    onRender : function() {
        if (this.grouped) {
            Ext.applyIf(this.renderData, {
                grouped: true
            });

            Ext.applyIf(this.renderSelectors, {
                header: '.x-list-header-swap'
            });
        }

        Ext.List.superclass.onRender.apply(this, arguments);
    },

    
    onDeactivate : function() {
        if (this.clearSelectionOnDeactivate) {
            this.clearSelections();
        }
    },

    
    afterRender : function() {
        if (!this.grouped) {
            this.el.addClass('x-list-flat');
        }
        this.getTemplateTarget().addClass('x-list-parent');

        Ext.List.superclass.afterRender.call(this);
    },

    
    initEvents : function() {
        Ext.List.superclass.initEvents.call(this);

        if (this.grouped) {
            if (this.pinHeaders && this.scroll) {
                this.mon(this.scroller, {
                    scrollstart: this.onScrollStart,
                    scroll: this.onScroll,
                    scope: this
                });
            }

            if (this.indexBar) {
                this.mon(this.indexBar, {
                    index: this.onIndex,
                    scope: this
                });
            }
        }
    },

    
    onDisclosureTap : function(e, t) {
        var node = this.findItemFromChild(t);
        if (node) {
            var record = this.getRecord(node),
                index = this.indexOf(node);

            this.fireEvent('disclose', record, node, index);

            if (Ext.isObject(this.disclosure) && this.disclosure.handler) {
                this.disclosure.handler.call(this, record, node, index);
            }
        }
    },

    
    setActiveGroup : function(group) {
        var me = this;
        if (group) {
            if (!me.activeGroup || me.activeGroup.header != group.header) {
                me.header.setHTML(group.header.getHTML());
                me.header.show();
            }            
        }
        else {
            me.header.hide();
        }

        this.activeGroup = group;
    },

    
    getClosestGroups : function(pos) {
        var groups = this.groupOffsets,
            ln = groups.length,
            group, i,
            current, next;

        for (i = 0; i < ln; i++) {
            group = groups[i];
            if (group.offset > pos.y) {
                next = group;
                break;
            }
            current = group;
        }

        return {
            current: current,
            next: next
        };
    },

    updateItems : function() {
        Ext.List.superclass.updateItems.apply(this, arguments);
        this.updateOffsets();
    },

    afterLayout : function() {
        Ext.List.superclass.afterLayout.apply(this, arguments);
        this.updateOffsets();
    },

    updateOffsets : function() {
        if (this.grouped) {
            this.groupOffsets = [];

            var headers = this.body.query('h3.x-list-header'),
                ln = headers.length,
                header, i;

            for (i = 0; i < ln; i++) {
                header = Ext.get(headers[i]);
                header.setDisplayMode(Ext.Element.VISIBILITY);
                this.groupOffsets.push({
                    header: header,
                    offset: header.dom.offsetTop
                });
            }
        }
    },

    
    onScrollStart : function() {
        var offset = this.scroller.getOffset();
        this.closest = this.getClosestGroups(offset);
        this.setActiveGroup(this.closest.current);
    },

    
    onScroll : function(scroller, pos, options) {
        if (!this.closest) {
            this.closest = this.getClosestGroups(pos);
        }

        if (!this.headerHeight) {
            this.headerHeight = this.header.getHeight();
        }

        if (pos.y <= 0) {
            if (this.activeGroup) {
                this.setActiveGroup(false);
                this.closest.next = this.closest.current;
            }
            return;
        }
        else if (
            (this.closest.next && pos.y > this.closest.next.offset) ||
            (pos.y < this.closest.current.offset)
        ) {
            this.closest = this.getClosestGroups(pos);
            this.setActiveGroup(this.closest.current);
        }
        if (this.closest.next && pos.y > 0 && this.closest.next.offset - pos.y <= this.headerHeight) {
            var transform = this.headerHeight - (this.closest.next.offset - pos.y);
            this.header.setStyle('-webkit-transform', 'translate3d(0, -' + transform + 'px, 0)');
            this.transformed = true;
        }
        else if (this.transformed) {
            this.header.setStyle('-webkit-transform', null);
            this.transformed = false;
        }
    },

    
    onIndex : function(record, target, index) {
        var key = record.get('key').toLowerCase(),
            groups = this.store.getGroups(),
            ln = groups.length,
            group, i, closest, id;

        for (i = 0; i < ln; i++) {
            group = groups[i];
            id = this.getGroupId(group);

            if (id == key || id > key) {
                closest = id;
                break;
            }
            else {
                closest = id;
            }
        }

        closest = this.body.down('.x-group-' + id);
        if (closest) {
            this.scroller.scrollTo({x: 0, y: closest.getOffsetsTo(this.scrollEl)[1]}, false, null, true);
        }
    },

    getGroupId : function(group) {
        return group.name.toLowerCase();
    },

    
    collectData : function(records, startIndex) {
        if (!this.grouped) {
            return Ext.List.superclass.collectData.call(this, records, startIndex);
        }

        var results = [],
            groups = this.store.getGroups(),
            ln = groups.length,
            children, cln, c,
            group, i;

        for (i = 0, ln = groups.length; i < ln; i++) {
            group = groups[i];
            children = group.children;
            for (c = 0, cln = children.length; c < cln; c++) {
                children[c] = children[c].data;
            }
            results.push({
                group: group.name,
                id: this.getGroupId(group),
                items: this.itemTpl.apply(children)
            });
        }

        return results;
    },

    
    
    
    onUpdate : function(ds, record) {
        if (this.grouped) {
            this.refresh();
        }
        else {
            Ext.List.superclass.onUpdate.apply(this, arguments);
        }
    },

    
    onAdd : function(ds, records, index) {
        if (this.grouped) {
            this.refresh();
        }
        else {
            Ext.List.superclass.onAdd.apply(this, arguments);
        }
    },

    
    onRemove : function(ds, record, index) {
        if (this.grouped) {
            this.refresh();
        }
        else {
            Ext.List.superclass.onRemove.apply(this, arguments);
        }
    }
});

Ext.reg('list', Ext.List);


Ext.IndexBar = Ext.extend(Ext.DataPanel, {
    
    cmpCls: 'x-indexbar',

    
    direction: 'vertical',

    
    tpl: '<tpl for="."><span class="x-indexbar-item">{value}</span></tpl>',

    
    itemSelector: 'span.x-indexbar-item',
    
    
    letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],

    
    listPrefix: '',
    
    
    
    

    
    componentLayout: 'autocomponent',
    
    
    initComponent : function() {
        
        this.componentLayout = this.getComponentLayout();

        if (!this.store) {
            this.store = new Ext.data.Store({
                model: 'IndexBarModel'
            });
        }

        if (this.alphabet == true) {
            this.ui = this.ui || 'alphabet';
        }

        if (this.direction == 'horizontal') {
            this.horizontal = true;
        }
        else {
            this.vertical = true;
        }
        
        this.addEvents(
          
          'index'
        );

        Ext.IndexBar.superclass.initComponent.call(this);
    },

    
    afterRender : function() {
        Ext.IndexBar.superclass.afterRender.call(this);

        if (this.alphabet === true) {
            this.loadAlphabet();
        }

        if (this.vertical) {
            this.el.addClass(this.cmpCls + '-vertical');
        }
        else if (this.horizontal) {
            this.el.addClass(this.cmpCls + '-horizontal');
        }
    },

    
    loadAlphabet : function() {
        var letters = this.letters,
            len = letters.length,
            data = [],
            i, letter;

        for (i = 0; i < len; i++) {
            letter = letters[i];
            data.push({key: letter.toLowerCase(), value: letter});
        }

        this.store.loadData(data);
    },

    
    refresh: function() {
        if (!this.rendered) {
            return;
        }

        var el = this.getTemplateTarget(),
            records = this.getRenderRecords();
        if (records.length < 1) {
            this.all.clear();
        } else {
            var tplData = this.collectData(records, 0);

            if (this.listPrefix.length > 0) {
                tplData.unshift({
                    key: '',
                    value: this.listPrefix
                });
            }
            
            this.tpl.overwrite(el, tplData);
            this.all.fill(Ext.query(this.itemSelector, el.dom));
        }

        this.updateItems(0);
        this.fireEvent('refresh', this, records);
    },

    
    initEvents : function() {
        Ext.IndexBar.superclass.initEvents.call(this);

        this.mon(this.body, {
            touchstart: this.onTouchStart,
            touchend: this.onTouchEnd,
            touchmove: this.onTouchMove,
            scope: this
        });
    },

    
    onTouchStart : function(e, t) {
        this.el.addClass(this.cmpCls + '-pressed');
        this.pageBox = this.body.getPageBox();
        this.onTouchMove(e);
    },

    
    onTouchEnd : function(e, t) {
        this.el.removeClass(this.cmpCls + '-pressed');
    },

    
    onTouchMove : function(e) {
        var target,
            record,
            pageBox = this.pageBox;
            
        if (!pageBox) {
            pageBox = this.pageBox = this.body.getPageBox();
        }

        if (this.vertical) {
            if (e.pageY > pageBox.bottom || e.pageY < pageBox.top) {
                return;
            }
            target = Ext.Element.fromPoint(pageBox.left + (pageBox.width / 2), e.pageY);
        }
        else if (this.horizontal) {
            if (e.pageX > pageBox.right || e.pageX < pageBox.left) {
                return;
            }
            target = Ext.Element.fromPoint(e.pageX, pageBox.top + (pageBox.height / 2));
        }

        if (target) {
            record = this.getRecord(target.dom);
            if (record) {
                this.fireEvent('index', record, target, this.indexOf(target));
            }
        }
    }
});

Ext.reg('indexbar', Ext.IndexBar);

Ext.regModel('IndexBarModel', {
    fields: ['key', 'value']
});


Ext.Toolbar = Ext.extend(Ext.Container, {
    
    isToolbar: true,
    
    
    defaultType: 'button',

    
    baseCls: 'x-toolbar',

    
    titleCls: 'x-toolbar-title',

    
    ui: 'dark',

    
    layout: null,

    

    

    
    titleEl: null,

    initComponent : function() {
        this.layout = Ext.apply({}, this.layout || {}, {
            type: 'hbox',
            align: 'center'
        });
        Ext.Toolbar.superclass.initComponent.call(this);
    },

    afterRender : function() {
        Ext.Toolbar.superclass.afterRender.call(this);

        if (this.title) {
            this.titleEl = this.el.createChild({
                cls: this.titleCls,
                html: this.title
            });
        }
    },

    
    setTitle : function(title) {
        this.title = title;
        if (this.rendered) {
            if (!this.titleEl) {
                this.titleEl = this.el.createChild({
                    cls: this.titleCls,
                    html: this.title
                });
            }
            this.titleEl.setHTML(title);
        }
    },

    
    showTitle : function() {
        if (this.titleEl) {
            this.titleEl.show();
        }
    },

    
    hideTitle : function() {
        if (this.titleEl) {
            this.titleEl.hide();
        }
    }
});

Ext.reg('toolbar', Ext.Toolbar);



Ext.Spacer = Ext.extend(Ext.Component, {
    initComponent : function() {
        if (!this.width) {
            this.flex = 1;
        }

        Ext.Spacer.superclass.initComponent.call(this);
    },

    onRender : function() {
        Ext.Spacer.superclass.onRender.apply(this, arguments);

        if (this.flex) {
            this.el.setStyle('-webkit-box-flex', this.flex);
        }
    }
});

Ext.reg('spacer', Ext.Spacer);

Ext.Sheet = Ext.extend(Ext.Panel, {
    baseCls : 'x-sheet',
    centered : false,
    floating : true,
    modal    : true,
    hideOnMaskTap : false,
    draggable : false,
    monitorOrientation : true,
    hidden    : true,

    

    

    
    arrive : 'bottom',

    
    depart : 'bottom',


    
    arrivalEffect : 'slide',

    
    departEffect : 'slide',

    
    transitions : {
        bottom : 'up',
        top    : 'down',
        right  : 'left',
        left   : 'right'
    },

    //@private

    animSheet : function(animate) {
      var anim = null,
          me = this,
          tr = me.transitions,
          opposites = Ext.Anim.prototype.opposites || {};

      if (animate && this[animate]) {
         if (animate == 'arrive') {
             anim = (typeof me.arrivalEffect == 'string') ?
                 {
                     type : me.arrivalEffect || 'slide',
                     direction : tr[me.arrive] || 'up'
                 } : me.arrivalEffect;

         }
         else if (animate == 'depart') {
            anim = (typeof me.departEffect == 'string') ?
                 {
                     type : me.departEffect || 'slide',
                     direction : tr[me.depart] || 'down'
                 } :  me.departEffect;
         }
      }
      return anim;
    },

    
    orient : function(orientation, w, h) {
        if(!this.container || this.centered || !this.floating){
            return this;
        }

        var me = this,
            cfg = me.initialConfig || {},
            
            size = {width : cfg.width, height : cfg.height},
            pos  = {x : cfg.x, y : cfg.y},
            box  = me.el.getPageBox(),
            pageBox, scrollTop = 0;

        if (me.container.dom == document.body) {
            pageBox = {
                width: window.innerWidth,
                height: window.innerHeight
            };
            scrollTop = document.body.scrollTop;
        }
        else {
            pageBox = me.container.getPageBox();
        }

        pageBox.centerY = pageBox.height / 2;
        pageBox.centerX = pageBox.width / 2;

        if(pos.x != undefined || pos.y != undefined){
            pos.x = pos.x || 0;
            pos.y = pos.y || 0;
        }
        else {
            if (/^(bottom|top)/i.test(me.arrive)) {
                size.width  = me.stretchX ? pageBox.width : Math.min(200,Math.max(size.width || box.width || pageBox.width, pageBox.width));
                size.height = Math.min(size.height || 0, pageBox.height) || undefined;
                size = me.setSize(size).getSize();
                pos.x = pageBox.centerX - size.width / 2;
                pos.y = me.arrive == 'top' ? 0 : pageBox.height - size.height + scrollTop;

            } else if (/^(left|right)/i.test(me.arrive)) {
                size.height = me.stretchY ? pageBox.height : Math.min(200, Math.max(size.height || box.height || pageBox.height, pageBox.height));
                size.width  = Math.min(size.width || 0, pageBox.width) || undefined;
                size = me.setSize(size).getSize();
                pos.y = 0;
                pos.x = me.arrive == 'left' ? 0 : pageBox.width - size.width;
            }
        }
        me.setPosition(pos);
        return this;
    },

     
    afterRender : function() {
        Ext.Sheet.superclass.afterRender.apply(this, arguments);
        this.el.setDisplayMode(Ext.Element.OFFSETS);
    },

    
    onShow : function(animation) {
        this.orient();
        return Ext.Sheet.superclass.onShow.call(this, animation || this.animSheet('arrive'));
    },

    
    onOrientationChange : function(orientation, w, h) {
        this.orient();
        Ext.Sheet.superclass.onOrientationChange.apply(this, arguments);
    },

    
    beforeDestroy : function() {
        delete this.showAnimation;
        this.hide(false);
        Ext.Sheet.superclass.beforeDestroy.call(this);
    }
});

Ext.reg('sheet', Ext.Sheet);



Ext.ActionSheet = Ext.extend(Ext.Sheet, {
    cmpCls: 'x-sheet-action',

    stretchY: true,
    stretchX: true,

    defaultType: 'button',

    constructor : function(config) {
        config = config || {};

        Ext.ActionSheet.superclass.constructor.call(this, Ext.applyIf({
            floating : true
        }, config));
    }
});

Ext.reg('actionsheet', Ext.ActionSheet);

Ext.TabBar = Ext.extend(Ext.Panel, {
    cmpCls: 'x-tabbar',

    
    activeTab: null,

    
    defaultType: 'tab',

    
    sortable: false,

    
    sortHoldThreshold: 350,

    
    initComponent : function() {
        
        this.addEvents('change');

        this.layout = Ext.apply({}, this.layout || {}, {
            type: 'hbox',
            align: 'middle'
        });

        Ext.TabBar.superclass.initComponent.call(this);

        var cardLayout = this.cardLayout;
        if (cardLayout) {
            this.cardLayout = null;
            this.setCardLayout(cardLayout);
        }
    },

    
    initEvents : function() {
        if (this.sortable) {
            this.sortable = new Ext.util.Sortable(this.el, {
                itemSelector: '.x-tab',
                direction: 'horizontal',
                delay: this.sortHoldThreshold,
                constrain: true
            });
            this.mon(this.sortable, 'sortchange', this.onSortChange, this);
        }

        this.mon(this.el, {
            touchstart: this.onTouchStart,
            scope: this
        });

        Ext.TabBar.superclass.initEvents.call(this);
    },

    
    onTouchStart : function(e, t) {
        t = e.getTarget('.x-tab');
        if (t) {
            this.onTabTap(Ext.getCmp(t.id));
        }
    },

    
    onSortChange : function(sortable, el, index) {
    },

    
    onTabTap : function(tab) {
        if (!tab.disabled) {
            if (this.cardLayout) {
                if (this.animation) {
                    var animConfig = {
                        reverse: (this.items.indexOf(tab) < this.items.indexOf(this.activeTab)) ? true : false
                    };

                    if (Ext.isObject(this.animation)) {
                        Ext.apply(animConfig, this.animation);
                    } else {
                        Ext.apply(animConfig, {
                            type: this.animation
                        });
                    }
                }
                
                this.cardLayout.setActiveItem(tab.card, animConfig || this.animation);
            }
            this.activeTab = tab;
            this.fireEvent('change', this, tab, tab.card);
        }
    },

    
    setCardLayout : function(layout) {
        if (this.cardLayout) {
            this.mun(this.cardLayout.owner, {
                add: this.onCardAdd,
                remove: this.onCardRemove,
                scope: this
            });
        }
        this.cardLayout = layout;
        if (layout) {
            this.mon(layout.owner, {
                add: this.onCardAdd,
                remove: this.onCardRemove,
                scope: this
            });
        }
    },

    
    onCardAdd : function(panel, card, idx) {
        card.tab = this.insert(idx, {
            xtype: 'tab',
            card: card
        });
    },

    
    onCardRemove : function(panel, card) {
        var items = this.items.items,
            ln = items.length,
            i, item;

        for (i = 0; i < ln; i++) {
            item = items[i];
            if (item.card === card) {
                item.card = null;
                this.remove(item, true);
                return;
            }
        }
    },

    getCardLayout : function() {
        return this.cardLayout;
    }
});

Ext.reg('tabbar', Ext.TabBar);



Ext.Tab = Ext.extend(Ext.Button, {
    
    isTab: true,
    baseCls: 'x-tab',

    
    pressedCls: 'x-tab-pressed',

    
    activeCls: 'x-tab-active',

    
    active: false,

    
    initComponent : function() {
        this.addEvents(
            
            'activate',
            
            'deactivate'
        );

        Ext.Tab.superclass.initComponent.call(this);

        var card = this.card;
        if (card) {
            this.card = null;
            this.setCard(card);
        }
    },

    
    setCard : function(card) {
        if (this.card) {
            this.mun(this.card, {
                activate: this.activate,
                deactivate: this.deactivate,
                scope: this
            });
        }
        this.card = card;
        if (card) {
            Ext.apply(this, card.tab || {});
            this.setText(this.title || card.title || this.text );
            this.setIconClass(this.iconCls || card.iconCls);
            this.setBadge(this.badgeText || card.badgeText);

            this.mon(card, {
                beforeactivate: this.activate,
                beforedeactivate: this.deactivate,
                scope: this
            });
        }
    },

    onRender: function() {
        Ext.Tab.superclass.onRender.apply(this, arguments);
        if (this.active) {
            this.el.addClass(this.activeCls);
        }
    },

    
    getCard : function() {
        return this.card;
    },

    
    activate : function() {
        this.active = true;
        if (this.el) {
            this.el.addClass(this.activeCls);
        }
        this.fireEvent('activate', this);
    },

    
    deactivate : function() {
        this.active = false;
        if (this.el) {
            this.el.removeClass(this.activeCls);
        }
        this.fireEvent('deactivate', this);
    }
});

Ext.reg('tab', Ext.Tab);


Ext.TabPanel = Ext.extend(Ext.Panel, {
    
    animation: 'slide',

    
    tabBarPosition: 'top',
    cmpCls: 'x-tabpanel',

    
    ui: 'dark',

    

    

    

    
    initComponent : function() {
        var layout = new Ext.layout.CardLayout(this.layout || {});
        this.layout = null;
        this.setLayout(layout);

        this.tabBar = new Ext.TabBar(Ext.apply({}, this.tabBar || {}, {
            cardLayout: layout,
            animation: this.animation,
            dock: this.tabBarPosition,
            ui: this.ui,
            sortable: this.sortable
        }));

        if (this.dockedItems && !Ext.isArray(this.dockedItems)) {
            this.dockedItems = [this.dockedItems];
        }
        else if (!this.dockedItems) {
            this.dockedItems = [];
        }
        this.dockedItems.push(this.tabBar);

        Ext.TabPanel.superclass.initComponent.call(this);
    },

    
    getTabBar : function() {
        return this.tabBar;
    }
    
    
    
    
    
});

Ext.reg('tabpanel', Ext.TabPanel);


Ext.Carousel = Ext.extend(Ext.Panel, {
    

    
    baseCls: 'x-carousel',

    
    indicator: true,

    
    ui: 'dark',

    
    direction: 'horizontal',

    
    initComponent: function() {
        this.layout = {
            type: 'card',
            
            sizeAllCards: true,
            
            hideInactive: false,
            extraCls: 'x-carousel-item',
            targetCls: 'x-carousel-body',
            setOwner : function(owner) {
                Ext.layout.CardLayout.superclass.setOwner.call(this, owner);
            }
        };
         
        if (this.indicator) {
            var cfg = Ext.isObject(this.indicator) ? this.indicator : {};
            this.indicator = new Ext.Carousel.Indicator(Ext.apply({}, cfg, {
                direction: this.direction,
                carousel: this,
                ui: this.ui
            }));
        }

        Ext.Carousel.superclass.initComponent.call(this);
    },

    
    afterRender: function() {
        Ext.Carousel.superclass.afterRender.call(this);

        
        this.mon(this.body, {
            scroll: this.onScroll,
            scrollend: this.onScrollEnd,
            horizontal: this.direction == 'horizontal',
            vertical: this.direction == 'vertical',
            scope: this
        });
        
        this.el.addClass(this.baseCls + '-' + this.direction);
    },
    
        
    afterLayout : function() {
        Ext.Carousel.superclass.afterLayout.apply(this, arguments);
        
        this.currentSize = this.body.getSize();
        this.currentScroll = {x: 0, y: 0};
        
        this.updateCardPositions();
        
        var activeItem = this.layout.getActiveItem();        
        if (activeItem && this.indicator) {  
            this.indicator.onBeforeCardSwitch(this, activeItem, null, this.items.indexOf(activeItem));
        }
    },

        
    onScroll : function(e) {
        this.currentScroll = {
            x: e.deltaX,
            y: e.deltaY
        };

        
        var activeIndex = this.items.items.indexOf(this.layout.activeItem);    
        
        
        if (this.direction == 'horizontal' && (
            
            (activeIndex == 0 && e.deltaX > 0) || 
            
            (activeIndex == this.items.length - 1 && e.deltaX < 0)
        )) {
            
            this.currentScroll.x = e.deltaX / 2;
        }
        
        else if (this.direction == 'vertical' && (
            
            (activeIndex == 0 && e.deltaY > 0) || 
            
            (activeIndex == this.items.length - 1 && e.deltaY < 0)
        )) {
            
            this.currentScroll.y = e.deltaY / 2;           
        }
        
        this.updateCardPositions();
    },

    
    updateCardPositions : function(animate) {
        var cards = this.items.items,
            ln = cards.length,
            i, card, el, style;
        
        
        
        
        for (i = 0; i < ln; i++) {
            card = cards[i];  
            
            
            if (this.isCardInRange(card)) {
                if (card.hidden) {
                    card.show();
                }
                
                el = card.el;
                style = el.dom.style;
                
                if (animate) {
                    if (card === this.layout.activeItem) {
                        el.on('webkitTransitionEnd', this.onTransitionEnd, this, {single: true});
                    }
                    style.webkitTransitionDuration = '300ms';
                }
                else {
                    style.webkitTransitionDuration = '0ms';
                }

                if (this.direction == 'horizontal') {
                    style.webkitTransform = 'translate3d(' + this.getCardOffset(card) + 'px, 0, 0)';
                }
                else {
                    style.webkitTransform = 'translate3d(0, ' + this.getCardOffset(card) + 'px, 0)';
                }
            }
            else if (!card.hidden) {
                
                card.hide();
            }
        }
    },

        
    getCardOffset : function(card) {
        var cardOffset = this.getCardIndexOffset(card),
            currentSize = this.currentSize,
            currentScroll = this.currentScroll;
            
        return this.direction == 'horizontal' ?
            (cardOffset * currentSize.width) + currentScroll.x :
            (cardOffset * currentSize.height) + currentScroll.y;
    },

            
    getCardIndexOffset : function(card) {
        return this.items.items.indexOf(card) - this.getActiveIndex();
    },

        
    isCardInRange : function(card) {
        return Math.abs(this.getCardIndexOffset(card)) <= 2;
    },

        
    getActiveIndex : function() {
        return this.items.indexOf(this.layout.activeItem);
    },

            
    onScrollEnd : function(e, t) {
        var previousDelta, deltaOffset; 
            
        if (this.direction == 'horizontal') {
            deltaOffset = e.deltaX;
            previousDelta = e.previousDeltaX;
        }
        else {
            deltaOffset = e.deltaY;
            previousDelta = e.previousDeltaY;
        }
            
        
        if (deltaOffset < 0 && Math.abs(deltaOffset) > 3 && previousDelta <= 0 && this.layout.getNext()) {
            this.next();
        }
        
        else if (deltaOffset > 0 && Math.abs(deltaOffset) > 3 && previousDelta >= 0 && this.layout.getPrev()) {
            this.prev();
        }
        else {
            
            this.scrollToCard(this.layout.activeItem);
        }
    },

    
    onBeforeCardSwitch : function(newCard) {
        if (!this.customScroll && this.items.indexOf(newCard) != -1) {
            var style = newCard.el.dom.style;
            style.webkitTransitionDuration = null;
            style.webkitTransform = null;
        }
        return Ext.Carousel.superclass.onBeforeCardSwitch.apply(this, arguments);
    },

        
    scrollToCard : function(newCard) {
        this.currentScroll = {x: 0, y: 0};
        this.oldCard = this.layout.activeItem;
        
        if (newCard != this.oldCard && this.isCardInRange(newCard) && this.onBeforeCardSwitch(newCard, this.oldCard, this.items.indexOf(newCard), true) !== false) {
            this.layout.activeItem = newCard;
            if (this.direction == 'horizontal') {
                this.currentScroll.x = -this.getCardOffset(newCard);
            }
            else {
                this.currentScroll.y = -this.getCardOffset(newCard);
            }
        }
        
        this.updateCardPositions(true);
    },    

    
    onTransitionEnd : function(e, t) {
        this.customScroll = false;
        this.currentScroll = {x: 0, y: 0};
        if (this.oldCard && this.layout.activeItem != this.oldCard) {
            this.onCardSwitch(this.layout.activeItem, this.oldCard, this.items.indexOf(this.layout.activeItem), true);
        }
        delete this.oldCard;
    },
        
    
    onCardSwitch : function(newCard, oldCard, index, animated) {
        this.currentScroll = {x: 0, y: 0};
        this.updateCardPositions();
        Ext.Carousel.superclass.onCardSwitch.apply(this, arguments);
        newCard.fireEvent('activate', newCard);
    },

    
    next: function() {
        var next = this.layout.getNext();
        if (next) {
            this.customScroll = true;
            this.scrollToCard(next);
        }
        return this;
    },

    
    prev: function() {
        var prev = this.layout.getPrev();
        if (prev) {
            this.customScroll = true;
            this.scrollToCard(prev);
        }
        return this;
    }
});

Ext.reg('carousel', Ext.Carousel);


Ext.Carousel.Indicator = Ext.extend(Ext.Component, {
    baseCls: 'x-carousel-indicator',

    initComponent: function() {
        if (this.carousel.rendered) {
            this.render(this.carousel.body);
            this.onBeforeCardSwitch(null, null, this.carousel.items.indexOf(this.carousel.layout.getActiveItem()));
        }
        else {
            this.carousel.on('render', function() {
                this.render(this.carousel.body);
            }, this, {single: true});
        }
        Ext.Carousel.Indicator.superclass.initComponent.call(this);
    },

    
    onRender: function() {
        Ext.Carousel.Indicator.superclass.onRender.apply(this, arguments);

        for (var i = 0, ln = this.carousel.items.length; i < ln; i++) {
            this.createIndicator();
        }

        this.mon(this.carousel, {
            beforecardswitch: this.onBeforeCardSwitch,
            add: this.onCardAdd,
            remove: this.onCardRemove,
            scope: this
        });

        this.mon(this.el, {
            tap: this.onTap,
            scope: this
        });
        
        this.el.addClass(this.baseCls + '-' + this.direction);
    },

    
    onTap: function(e, t) {
        var box = this.el.getPageBox(),
            centerX = box.left + (box.width / 2),
            centerY = box.top + (box.height / 2);

        if (
            (this.carousel.direction == 'horizontal' && e.pageX > centerX) || 
            (this.carousel.direction == 'vertical' && e.pageY > centerY)
        ) {
            this.carousel.next();
        }
        else {
            this.carousel.prev();
        }
    },

    
    createIndicator: function() {
        this.indicators = this.indicators || [];
        this.indicators.push(this.el.createChild({
            tag: 'span'
        }));
    },

    
    onBeforeCardSwitch: function(carousel, card, old, index) {
        if (Ext.isNumber(index) && index != -1 && this.indicators[index]) {
            this.indicators[index].radioClass('x-carousel-indicator-active');
        }
    },

    
    onCardAdd: function() {
        this.createIndicator();
    },

    
    onCardRemove: function() {
        this.indicators.pop().remove();
    }
});

Ext.reg('carouselindicator', Ext.Carousel.Indicator);


Ext.Map = Ext.extend(Ext.Component, {

    

    
    baseCls: 'x-map',

    
    getLocation: false,
    
    monitorResize : true,

    

    
    map: null,

    
    geo: null,

    maskMap: false,


    initComponent : function() {
        this.mapOptions = this.mapOptions || {};
        
        this.scroll = false;
        
        if(!(window.google || {}).maps){
            this.html = 'Google Maps API is required';   
        }
        else if (this.getLocation) {
            this.geo = this.geo || new Ext.util.GeoLocation({autoLoad: false});
            this.geo.on({
                locationupdate : this.onGeoUpdate,
                locationerror : this.onGeoError, 
                scope : this
            });
        }
        
        Ext.Map.superclass.initComponent.call(this);
                
        this.addEvents ( 
                 
            'maprender',
        
                 
            'centerchange',
            
                 
            'typechange',
            
                 
            'zoomchange'
        );
        
        if (this.geo){
            this.on({
                activate: this.onUpdate,
                scope: this,
                single: true
            });
            this.geo.updateLocation();
        }
        
    },
    
    
    onRender : function(container, position) {
        Ext.Map.superclass.onRender.apply(this, arguments);
        this.el.setDisplayMode(Ext.Element.OFFSETS);        
    },
    
     
    afterRender : function() {
        Ext.Map.superclass.afterRender.apply(this, arguments);
        this.renderMap();
    },
    
    
    onResize : function( w, h) {
        Ext.Map.superclass.onResize.apply(this, arguments);
        if (this.map) {
            google.maps.event.trigger(this.map, 'resize');
        }
    },
    
    afterComponentLayout : function() {
        if (this.maskMap) {
            this.el.mask(true);
            this.mask = true;
        }
    },
    
    renderMap : function(){
        var me = this,
            gm = (window.google || {}).maps;
        
        if (gm) {
            if (Ext.is.iPad) {
	            Ext.applyIf(me.mapOptions, {
	                navigationControlOptions: {
	                    style: gm.NavigationControlStyle.ZOOM_PAN
	                }
	            });
	        }
	        
	        Ext.applyIf(me.mapOptions, {
	            center: new gm.LatLng(37.381592, -122.135672), 
	            zoom: 12,
	            mapTypeId: gm.MapTypeId.ROADMAP
	        });
            
	        if (me.maskMap && !me.mask) {
	            me.el.mask(true);
	            me.mask = true;
	        }
	
	        if (me.el && me.el.dom && me.el.dom.firstChild) {
	            Ext.fly(me.el.dom.firstChild).remove();
	        }
            
	        if (me.map) {
	            gm.event.clearInstanceListeners(me.map);
	        }
	        
	        me.map = new gm.Map(me.el.dom, me.mapOptions);
	        
	        var event = gm.event;
	        
	        event.addListener(me.map, 'zoom_changed', Ext.createDelegate(me.onZoom, me));
	        event.addListener(me.map, 'maptypeid_changed', Ext.createDelegate(me.onTypeChange, me));
	        event.addListener(me.map, 'center_changed', Ext.createDelegate(me.onCenterChange, me));
	        
	        me.fireEvent('maprender', me, me.map);
        }
        
    },

    onGeoUpdate : function(coords) {
        var center;
        if (coords) {
            center = this.mapOptions.center = new google.maps.LatLng(coords.latitude, coords.longitude);
        }
        
        if (this.rendered) {
            this.update(center);
        }
        else {
            this.on('activate', this.onUpdate, this, {single: true, data: center});
        }
    },
    
    onGeoError : function(geo){
          
    },

    onUpdate : function(map, e, options) {
        this.update((options || {}).data);
    },
    
    
    
    update : function(coordinates) {
        var me = this, 
            gm = (window.google || {}).maps;

        if (gm) {
	        coordinates = coordinates || me.coords || new gm.LatLng(37.381592, -122.135672);
	        
	        if (coordinates && !(coordinates instanceof gm.LatLng) && 'longitude' in coordinates) {
                coordinates = new gm.LatLng(coordinates.latitude, coordinates.longitude);
	        }
	        
	        if (!me.hidden && me.rendered) {
		        me.map || me.renderMap();
		        if (me.map && coordinates instanceof gm.LatLng) {
		           me.map.panTo(coordinates);
		        }
	        }
	        else {
	            me.on('activate', me.onUpdate, me, {single: true, data: coordinates});
	        }
        }
    },
    
    
    onZoom  : function() {
        this.mapOptions.zoom = (this.map && this.map.getZoom 
            ? this.map.getZoom() 
            : this.mapOptions.zoom) || 10 ;
            
        this.fireEvent('zoomchange', this, this.map, this.mapOptions.zoom);
    },
    
    
    onTypeChange  : function() {
        this.mapOptions.mapTypeId = this.map && this.map.getMapTypeId 
            ? this.map.getMapTypeId() 
            : this.mapOptions.mapTypeId;
        
        this.fireEvent('typechange', this, this.map, this.mapOptions.mapTypeId);
    },

    
    onCenterChange : function(){
       this.mapOptions.center = this.map && this.map.getCenter 
            ? this.map.getCenter() 
            : this.mapOptions.center;
        
       this.fireEvent('centerchange', this, this.map, this.mapOptions.center);
       
    },
    
    getState : function(){
        return this.mapOptions;  
    },
    
    
    onDestroy : function() {
        Ext.destroy(this.geo);
        if (this.maskMap && this.mask) {
            this.el.unmask();
        }
        if (this.map && (window.google || {}).maps) {
            google.maps.event.clearInstanceListeners(this.map);
        }
        Ext.Map.superclass.onDestroy.call(this);
    }
});

Ext.reg('map', Ext.Map);

Ext.NestedList = Ext.extend(Ext.Panel, {
    cmpCls: 'x-nested-list',
    
    layout: 'card',

    

    

    
    
    

    
    animation: 'slide',

    
    backButton: null,

    
    backText: 'Back',

    
    useTitleAsBackText: true,

    
    updateTitleText: true,

    
    displayField: 'text',

    
    loadingText: 'Loading...',

    
    emptyText: 'No items available.',

    
    disclosure: false,

    
    clearSelectionDefer: 200,

    
    getItemTextTpl: function(node) {
        return '{' + this.displayField + '}';
    },

    
    getTitleTextTpl: function(node) {
        return '{' + this.displayField + '}';
    },

    
    renderTitleText: function(node) {
        
        
        
        if (!node.titleTpl) {
            node.titleTpl = new Ext.XTemplate(this.getTitleTextTpl(node));
        }
        var record = node.getRecord();
        if (record) {
            return node.titleTpl.applyTemplate(record.data);
        } else if (node.isRoot) {
            return this.title || this.backText;
        
        } else {
            throw "No RecordNode passed into renderTitleText";
        }
        
    },

    
    useToolbar: true,

    

    

    
    getDetailCard: function(recordNode, parentNode) {
        return false;
    },

    initComponent : function() {
        var store    = Ext.StoreMgr.lookup(this.store),
            rootNode = store.getRootNode(),
            title    = rootNode.getRecord() ? this.renderTitleText(rootNode) : this.title || '';

        this.store = store;

        if (this.useToolbar) {
            
            this.backButton = new Ext.Button({
                text: this.backText,
                ui: 'back',
                handler: this.onBackTap,
                scope: this,
                
                hidden: true
            });
            if (!this.toolbar || !this.toolbar.isComponent) {
                
                this.toolbar = Ext.apply({}, this.toolbar || {}, {
                    dock: 'top',
                    xtype: 'toolbar',
                    ui: 'light',
                    title: title,
                    items: []
                });
                this.toolbar.items.unshift(this.backButton);
                this.toolbar = new Ext.Toolbar(this.toolbar);

                this.dockedItems = this.dockedItems || [];
                this.dockedItems.push(this.toolbar);
            } else {
                this.toolbar.insert(0, this.backButton);
            }
        }

        this.items = [this.getSubList(rootNode)];

        Ext.NestedList.superclass.initComponent.call(this);
        this.on('itemtap', this.onItemTap, this);


        this.addEvents(
            

            

            

            

            

            
            
            'listchange',

            
            'leafitemtap'
        );
    },

    
    getListConfig: function(node) {
        var itemId = node.internalId,
            emptyText = this.emptyText;

        return {
            itemId: itemId,
            xtype: 'list',
            autoDestroy: true,
            recordNode: node,
            store: this.store.getSubStore(node),
            loadingText: this.loadingText,
            disclosure: this.disclosure,
            displayField: this.displayField,
            singleSelect: true,
            clearSelectionOnDeactivate: false,
            bubbleEvents: [
                'itemtap',
                'containertap',
                'beforeselect',
                'itemdoubletap',
                'selectionchange'
            ],
            itemSelector: '.x-list-item',
            tpl: new Ext.XTemplate(
                '<tpl for="."><div class="x-list-item <tpl if="leaf == true">x-list-item-leaf</tpl>"><span>',
                    this.getItemTextTpl(node),
                '</span></div></tpl>'
            ),

            
            emptyText: this.loadingText,
            deferEmptyText: false,
            refresh: function() {
                if (this.hasSkippedEmptyText) {
                    this.emptyText = emptyText;
                }
                Ext.List.prototype.refresh.apply(this, arguments);
            }
        };
    },

    
    getSubList: function(node) {
        var items  = this.items,
            list,
            itemId = node.internalId;

        
        
        if (items && items.get) {
            list = items.get(itemId);
        }

        if (list) {
            return list;
        } else {
            return this.getListConfig(node);
        }
    },

    addNextCard: function(recordNode, swapTo) {
        var nextList,
            parentNode   = recordNode ? recordNode.parentNode : null,
            card;

        if (recordNode.leaf) {
            card = this.getDetailCard(recordNode, parentNode);
            if (card) {
                nextList = this.add(card);
            }
        } else {
            nextList = this.getSubList(recordNode);
            nextList = this.add(nextList);
        }
        return nextList;
    },

    setActivePath: function(path) {
        
        
        
        var gotoRoot = path.substr(0, 1) === "/",
            j        = 0,
            ds       = this.store,
            tree     = ds.tree,
            node, card, lastCard,
            pathArr, pathLn;

        if (gotoRoot) {
            path = path.substr(1);
        }

        pathArr = Ext.toArray(path.split('/'));
        pathLn  = pathArr.length;


        if (gotoRoot) {
            
            var items      = this.items,
                itemsArray = this.items.items,
                i          = items.length;

            for (; i > 1; i--) {
                this.remove(itemsArray[i - 1], true);
            }

            
            
            var rootNode = itemsArray[0].recordNode;
            if (rootNode.id !== pathArr[0]) {
                throw "rootNode doesn't match!";
            }
            

            
            j = 1;
        }


        
        for (; j < pathLn; j++) {
            if (pathArr[j] !== "") {
                node = tree.getNodeById(pathArr[j]);

                
                
                
                card = this.addNextCard(node);

                
                
                if (card) {
                    lastCard = card;
                }
            }
        }

        
        if (!lastCard) {
            throw "Card was not found when trying to add to NestedList.";
        }
        

        this.setCard(lastCard, false);
        this.syncToolbar();
    },

    syncToolbar: function(card) {
        var list          = card || this.getActiveItem(),
            depth         = this.items.indexOf(list),
            recordNode    = list.recordNode,
            parentNode    = recordNode.parentNode,
            backBtn       = this.backButton,
            backBtnText   = this.useTitleAsBackText && parentNode ? this.renderTitleText(parentNode) : this.backText,
            backToggleMth = (depth !== 0) ? 'show' : 'hide';


            if (backBtn) {
                backBtn[backToggleMth]();
                if (parentNode) {
                    backBtn.setText(backBtnText);
                }
            }


            if (this.toolbar && this.updateTitleText) {
                this.toolbar.setTitle(recordNode && recordNode.getRecord() ? this.renderTitleText(recordNode) : this.title || '');
                this.toolbar.doLayout();
            }
    },

    
    onItemTap: function(subList, subIdx, el, e) {
        var store        = subList.getStore(),
            record       = store.getAt(subIdx),
            recordNode   = record.node,
            parentNode   = recordNode ? recordNode.parentNode : null,
            displayField = this.displayField,
            backToggleMth,
            nextDepth,
            nextList;

        nextList = this.addNextCard(recordNode);

        if (recordNode.leaf) {
            this.fireEvent("leafitemtap", subList, subIdx, el, e, nextList);
        }

        if (nextList) {
            
            
            nextDepth = this.items.indexOf(nextList);

            this.setCard(nextList, {
                type: this.animation
            });
            this.syncToolbar(nextList);
        }
    },

    
    onBackTap: function() {
        var currList      = this.getActiveItem(),
            currIdx       = this.items.indexOf(currList);

        if (currIdx != 0) {
            var prevDepth     = currIdx - 1,
                prevList      = this.items.itemAt(prevDepth),
                recordNode    = prevList.recordNode,
                record        = recordNode.getRecord(),
                parentNode    = recordNode ? recordNode.parentNode : null,
                backBtn       = this.backButton,
                backToggleMth = (prevDepth !== 0) ? 'show' : 'hide',
                backBtnText;

            this.setCard(prevList, {
                type: this.animation,
                reverse: true,
                after: function(el, opts) {
                    this.remove(currList);
                    if (this.clearSelectionDefer) {
                        Ext.defer(prevList.clearSelections, this.clearSelectionDefer, prevList);
                    }
                },
                scope: this
            });
            this.syncToolbar(prevList);
        }
    }
});
Ext.reg('nestedlist', Ext.NestedList);

Ext.Picker = Ext.extend(Ext.Sheet, {
    
    cmpCls: 'x-picker',
    
    stretchX: true,
    stretchY: true,
    hideOnMaskTap: false,
    
    
    doneText: 'Done',
    
    
    showDoneButton : true,
    
    
    height: 220,
    
    
    useTitles: false,

    
    

    
    
    
    
    
    defaultType: 'pickerslot',
    
    
    initComponent : function() {
        this.layout = {
            type: 'hbox',
            align: 'stretch'
        };

        if (this.slots) {
            this.items = this.items ? (Ext.isArray(this.items) ? this.items : [this.items]) : [];
            this.items = this.items.concat(this.slots);
        }
        
        if (this.useTitles) {
            this.defaults = Ext.applyIf(this.defaults || {}, {
                title: ''
            });            
        }

        this.on('slotpick', this.onSlotPick, this);
        this.addEvents('pick', 'change');

        if (this.showDoneButton) {
            this.toolbar = new Ext.Toolbar(Ext.applyIf(this.buttonBar || {
                dock: 'top'
            }));

            this.toolbar.add([
                {xtype: 'spacer'},
                {
                    xtype: 'button',
                    ui: 'action',
                    text: this.doneText,
                    handler: this.onDoneTap,
                    scope: this
                }
            ]);

            this.dockedItems = this.dockedItems ? (Ext.isArray(this.dockedItems) ? this.dockedItems : [this.dockedItems]) : [];
            this.dockedItems.push(this.toolbar);
        }

        Ext.Picker.superclass.initComponent.call(this);

        if (this.value) {
            this.setValue(this.value, false);
        }
    },
    
    
    onDoneTap : function() {
        var anim = this.animSheet('depart');
        Ext.apply(anim, {
            after: function() {
                this.fireEvent('change', this, this.getValue());
            },
            scope: this
        });
        this.hide(anim);
    },
    
    
    onSlotPick : function(slot, value, node) {
        this.fireEvent('pick', this, this.getValue(), slot);
        return false;
    },
    
    
    setValue : function(values, animated) {
        var key, slot,
            items = this.items.items,
            ln = items.length;

        
        if (!values) {
            for (i = 0; i < ln; i++) {
                items[i].setValue(0);
            }
            return this;
        }

        for (key in values) {
            slot = this.child('[name=' + key + ']');
            if (slot) {
                slot.setValue(values[key], animated);
            }
        }

        return this;
    },
    
    
    getValue : function() {
        var value = {},
            items = this.items.items,
            ln = items.length, item, i;

        for (i = 0; i < ln; i++) {
            item = items[i];
            value[item.name] = item.getValue();
        }

        return value;
    }
});

Ext.regModel('x-textvalue', {
    fields: ['text', 'value']
});


Ext.Picker.Slot = Ext.extend(Ext.DataView, {
    isSlot: true,
    flex: 1,

    
    name: null,

    
    displayField: 'text',

    
    valueField: 'value',

    
    align: 'center',
    
    
    itemSelector: 'li.x-picker-item',
    
    
    cmpCls: 'x-picker-slot',
    
    
    renderTpl : [
        '<div class="{baseCls}-body"<tpl if="bodyStyle"> style="{bodyStyle}"</tpl>>',
            '<div class="x-picker-mask">',
                '<div class="x-picker-bar"></div>',
            '</div>',
        '</div>'
    ],
    
    
    selectedIndex: 0,
    
    
    getElConfig : function() {
        return {
            tag: 'div',
            id: this.id,
            cls: 'x-picker-' + this.align
        };
    },
    
    
    initComponent : function() {
        
        if (!this.name) {
            throw 'Each picker slot is required to have a name.';
        }
        

        Ext.apply(this.renderSelectors, {
            mask: '.x-picker-mask',
            bar: '.x-picker-bar'
        });

        this.scroll = {
            direction: 'vertical',
            scrollbars: false,
            snapDuration: 200,
            friction: 0.9,
            acceleration: 20,
            scrollToDuration: 150,
            scrollToEasing: 'ease-in'
        };

        this.tpl = new Ext.XTemplate([
            '<tpl for=".">',
                '<li class="x-picker-item {cls} <tpl if="extra">x-picker-invalid</tpl>">{' + this.displayField + '}</li>',
            '</tpl>'
        ]);

        var data = this.data,
            parsedData = [],
            ln = data && data.length,
            i, item, obj;

        if (data && Ext.isArray(data) && ln) {
            for (i = 0; i < ln; i++) {
                item = data[i];
                obj = {};
                if (Ext.isArray(item)) {
                    obj[this.valueField] = item[0];
                    obj[this.displayField] = item[1];
                }
                else if (Ext.isString(item)) {
                    obj[this.valueField] = item;
                    obj[this.displayField] = item;
                }
                else if (Ext.isObject(item)) {
                    obj = item;
                }
                parsedData.push(obj);
            }

            this.store = new Ext.data.Store({
                model: 'x-textvalue',
                data: parsedData
            });
            this.tempStore = true;
        }
        else if (this.store) {
            this.store = Ext.StoreMgr.lookup(this.store);
        }

        this.enableBubble('slotpick');

        if (this.title) {
            this.title = new Ext.Component({
                dock: 'top',
                cmpCls: 'x-picker-slot-title',
                html: this.title
            });
            this.dockedItems = this.title;
        }

        Ext.Picker.Slot.superclass.initComponent.call(this);

        if (this.value !== undefined) {
            this.setValue(this.value, false);
        }
    },
    
    
    setupBar: function() {
        this.body.setStyle({padding: ''});

        var padding = this.bar.getY() - this.body.getY();
        this.barHeight = this.bar.getHeight();

        this.body.setStyle({
            padding: padding + 'px 0'
        });
        this.slotPadding = padding;
        this.scroller.updateBounds();
        this.scroller.setSnap(this.barHeight);
        this.setSelectedNode(this.selectedIndex, false);
    },
    
    
    afterComponentLayout : function() {
        
        
        Ext.defer(this.setupBar, 200, this);
    },
    
    
    initEvents : function() {
        this.mon(this.scroller, {
            scrollend: this.onScrollEnd,
            scope: this
        });
    },
    
    
    onScrollEnd : function(scroller, offset) {
        this.selectedNode = this.getNode(Math.round(offset.y / this.barHeight));
        this.selectedIndex = this.indexOf(this.selectedNode);
        this.fireEvent('slotpick', this, this.getValue(), this.selectedNode);
    },
    
    
    scrollToNode: function(node, animate) {
        var offsetsToBody = Ext.fly(node).getOffsetsTo(this.scrollEl)[1];
        this.scroller.scrollTo({
            y: offsetsToBody
        }, animate !== false ? true : false);
    },
    
    
    onItemTap : function(node) {
        Ext.Picker.Slot.superclass.onItemTap.apply(this, arguments);
        this.setSelectedNode(node);
    },
    
    
    getSelectedNode : function() {
        return this.selectedNode;
    },
    
    
    setSelectedNode : function(selected, animate) {
        
        if (Ext.isNumber(selected)) {
            selected = this.getNode(selected);
        }
        else if (selected.isModel) {
            selected = this.getNode(this.store.indexOf(selected));
        }

        
        if (selected) {
            this.selectedNode = selected;
            this.selectedIndex = this.indexOf(selected);
            this.scrollToNode(selected, animate);
        }
    },
    
    
    getValue : function() {
        var record = this.store.getAt(this.selectedIndex);
        return record ? record.get(this.valueField) : null;
    },

    
    setValue : function(value, animate) {
        var index = this.store.find(this.valueField, value);
        if (index != -1) {
            if (!this.rendered) {
                this.selectedIndex = index;
                return;
            }
            this.setSelectedNode(index, animate);
        }
    },

    onDestroy : function() {
        if (this.tempStore) {
            this.store.destroyStore();
            this.store = null;
        }
        Ext.Picker.Slot.superclass.onDestroy.call(this);
    }
});

Ext.reg('pickerslot', Ext.Picker.Slot);


Ext.DatePicker = Ext.extend(Ext.Picker, {
    
    yearFrom: 1980,

    
    yearTo: new Date().getFullYear(),

    
    monthText: 'Month',

    
    dayText: 'Day',

    
    yearText: 'Year',
    
    
    
    
    slotOrder: ['month', 'day', 'year'],

    initComponent: function() {
        var yearsFrom = this.yearFrom,
            yearsTo = this.yearTo,
            years = [],
            days = [],
            months = [],
            ln, tmp, i,
            daysInMonth;

        
        if (yearsFrom > yearsTo) {
            tmp = yearsFrom;
            yearsFrom = yearsTo;
            yearsTo = tmp;
        }

        for (i = yearsFrom; i <= yearsTo; i++) {
            years.push({
                text: i,
                value: i
            });
        }

        daysInMonth = this.getDaysInMonth(1, new Date().getFullYear());
        for (i = 0; i < daysInMonth; i++) {
            days.push({
                text: i + 1,
                value: i + 1
            });
        }

        for (i = 0, ln = Date.monthNames.length; i < ln; i++) {
            months.push({
                text: Date.monthNames[i],
                value: i + 1
            });
        }

        this.slots = [];
        Ext.each(this.slotOrder, function(item){
            this.slots.push(this.createSlot(item, days, months, years));
        }, this);

        
        
        if (this.value) {
            var value = this.value;
            
            if (Ext.isDate(value)) {
                this.value = {
                    day : value.getDay(),
                    year: value.getFullYear(),
                    month: value.getMonth() + 1
                };
            } else if (Ext.isObject(value)) {
                this.value = value;
            };
        }
        Ext.DatePicker.superclass.initComponent.call(this);
    },
    
    createSlot: function(name, days, months, years){
        switch(name){
            case 'year':
                return {
                    name: 'year',
                    align: 'center',
                    data: years,
                    title: this.useTitles ? this.yearText : false,
                    flex: 3
                };
            case 'month':
                return {
                    name: name,
                    align: 'right',
                    data: months,
                    title: this.useTitles ? this.monthText : false,
                    flex: 4
                };
            case 'day':
                return {
                    name: 'day',
                    align: 'center',
                    data: days,
                    title: this.useTitles ? this.dayText : false,
                    flex: 2
                };
        }
    },

    
    onSlotPick: function(slot, value) {
        var name = slot.name,
            date, daysInMonth, daySlot;

        if (name === "month" || name === "year") {
            daySlot = this.child('[name=day]');
            date = this.getValue();
            daysInMonth = this.getDaysInMonth(date.getMonth()+1, date.getFullYear());
            daySlot.store.clearFilter();
            daySlot.store.filter({
                fn: function(r) {
                    return r.get('extra') === true || r.get('value') <= daysInMonth;
                }
            });
            daySlot.scroller.updateBounds(true);
        }

        Ext.DatePicker.superclass.onSlotPick.call(this, slot, value);
    },

    
    getValue: function() {
        var value = Ext.DatePicker.superclass.getValue.call(this),
            daysInMonth = this.getDaysInMonth(value.month, value.year),
            day = Math.min(value.day, daysInMonth);

        return new Date(value.year, value.month-1, day);
    },

    
    getDaysInMonth: function(month, year) {
        var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        return month == 2 && this.isLeapYear(year) ? 29 : daysInMonth[month-1];
    },

    
    isLeapYear: function(year) {
        return !!((year & 3) === 0 && (year % 100 || (year % 400 === 0 && year)));
    }
});

Ext.reg('datepicker', Ext.DatePicker);

Ext.Media = Ext.extend(Ext.Container, {
    

    
    url: '',

    
    enableControls: true,
    
    
    autoResume: false,

    
    autoPause: true,

    
    preload: true,

    
    playing: false,

    
    afterRender : function() {
        var cfg = this.getConfiguration();
        Ext.apply(cfg, {
            src: this.url,
            preload: this.preload ? 'auto' : 'none'
        });
        if(this.enableControls){
            cfg.controls = 'controls';
        }
        if(this.loop){
            cfg.loop = 'loop';
        }
        
        this.media = this.el.createChild(cfg);
        Ext.Media.superclass.afterRender.call(this);
        
        this.on({
            scope: this,
            activate: this.onActivate,
            beforedeactivate: this.onDeactivate
        });
    },
    
    
    onActivate: function(){
        if (this.autoResume && !this.playing) {
            this.play();
        }
    },
    
    
    onDeactivate: function(){
        if (this.autoPause && this.playing) {
            this.pause();
        }
    },

    
    play : function() {
        this.media.dom.play();
        this.playing = true;
    },

    
    pause : function() {
        this.media.dom.pause();
        this.playing = false;
    },

    
    toggle : function() {
        if(this.playing){
            this.pause();    
        }else{
            this.play();
        }
    }
});

Ext.reg('media', Ext.Media);

Ext.Video = Ext.extend(Ext.Media, {
    

    

    
    poster: '',
    
    
    cmpCls: 'x-video',

    afterRender : function() {
        Ext.Video.superclass.afterRender.call(this);
        if (this.poster) {
            this.media.hide();
            this.ghost = this.el.createChild({
                cls: 'x-video-ghost',
                style: 'width: 100%; height: 100%; background: #000 url(' + this.poster + ') center center no-repeat; -webkit-background-size: 100% auto;'
            });
            this.ghost.on('tap', this.onGhostTap, this, {single: true});
        }
    },
    
    onGhostTap: function(){
        this.media.show();
        this.ghost.hide();
        this.play();
    },
    
    
    getConfiguration: function(){
        return {
            tag: 'video',
            width: '100%',
            height: '100%'
        };
    }    
});

Ext.reg('video', Ext.Video);

Ext.Audio = Ext.extend(Ext.Media, {
    

    

    cmpCls: 'x-audio',
    
    
    onActivate: function(){
        Ext.Audio.superclass.onActivate.call(this);
        if (Ext.is.Phone) {
            this.media.show();
        }    
    },
    
    
    onDeactivate: function(){
        Ext.Audio.superclass.onDeactivate.call(this);
        if (Ext.is.Phone) {
            this.media.hide();
        }
    },
    
    
    getConfiguration: function(){
        var hidden = !this.enableControls;
        if (!Ext.supports.AudioTag) {
            return {
                tag: 'embed',
                type: 'audio/mpeg',
                target: 'myself',
                controls: 'true',
                hidden: hidden
            };
        } else {
            return {
                tag: 'audio',
                hidden: hidden
            };
        }    
    }
});

Ext.reg('audio', Ext.Audio);

Ext.MessageBox = Ext.extend(Ext.Sheet, {
    
    centered         : true,

    
    renderHidden     : true,

    
    bodyPadding      : '6 0',

    
    ui               : 'dark',

    
    cmpCls           : 'x-msgbox',

    
    arrivalEffect    : 'pop',

    
    departEffect     : 'pop',





    
    defaultTextHeight : 75,

    constructor : function(config) {

        config = config || {};

        var ui = config.ui || this.ui || '',
            baseCls = config.cmpCls || this.cmpCls;

        delete config.html;

        this.titleBar = Ext.create({
            xtype : 'toolbar',
            ui    : ui,
            dock  : 'top',
            cls   : baseCls + '-title',
            title : '&#160;'
        });

        this.buttonBar = Ext.create({
            xtype : 'toolbar',
            ui    : ui,
            dock  : 'bottom',
            layout: { pack: 'center' },
            cls   : baseCls + '-buttons'
        });

        config = Ext.apply({
                    ui  : ui,
            dockedItems : [this.titleBar, this.buttonBar],
        renderSelectors : {
                       body : '.' + baseCls + '-body',
                         iconEl : '.' + baseCls + '-icon',
                   msgContentEl : '.' + baseCls + '-content',
                          msgEl : '.' + baseCls + '-text',
                       inputsEl : '.' + baseCls + '-inputs',
                        inputEl : '.' + baseCls + '-input-single',
                    multiLineEl : '.' + baseCls + '-input-textarea'
           }
         }, config || {});

        Ext.MessageBox.superclass.constructor.call(this, config);
    },

    renderTpl: [
        '<div class="{cmpCls}-body"<tpl if="bodyStyle"> style="position:relative; {bodyStyle}"</tpl>>',
            '<div class="{cmpCls}-icon x-hidden-display"></div>',
            '<div class="{cmpCls}-content">',
                '<div class="{cmpCls}-text"></div>',
                '<div class="{cmpCls}-inputs x-hidden-display">',
                    '<input type="text" class="{cmpCls}-input {cmpCls}-input-single" />',
                    '<textarea class="{cmpCls}-input {cmpCls}-input-textarea"></textarea>',
                '</div>',
            '</div>',
        '</div>'
    ],

    
    onClick : function(button) {
        if (button) {
            var config = button.config || {};

            if (typeof config.fn == 'function') {
                config.fn.call(
                    config.scope || null,
                    button.itemId || button.text,
                    config.input ? config.input.dom.value : null,
                    config
                );
            }

            if (config.cls) {
                    this.el.removeClass(config.cls);
                }

            if (config.input) {
                config.input.dom.blur();
            }
        }

        this.hide();
    },

    
    show : function(config) {
        var attrib,
            attrName,
            attribs = {
                autocomplete : 'off',
                autocapitalize : 'off',
                autocorrect : 'off',
                maxlength : 0,
                autofocus : true,
                placeholder : '',
                type : 'text'
            },
            assert = /true|on/i;

        this.rendered || this.render(document.body);

        config = Ext.applyIf(
            config || {}, {
                multiLine : false,
                prompt  : false,
                value   : '',
                modal   : true
            }
        );

        if (config.title) {
            this.titleBar.setTitle(config.title);
            this.titleBar.show();
        } else {
            this.titleBar.hide();
        }

        if (this.inputsEl && (config.multiLine || config.prompt)) {
            this.inputsEl.show();

            if (this.multiLineEl && config.multiLine) {
                this.inputEl && this.inputEl.hide();
                this.multiLineEl.show().setHeight(Ext.isNumber(config.multiLine) ? parseFloat(config.multiLine) : this.defaultTextHeight);
                config.input = this.multiLineEl;
            } else if (this.inputEl) {
                this.inputEl.show();
                this.multiLineEl && this.multiLineEl.hide();
                config.input = this.inputEl;
            }

            
            if (Ext.isObject(config.prompt)) {
                Ext.apply(attribs, config.prompt);
            }

            for (attrName in attribs) {
                if (attribs.hasOwnProperty(attrName)) {
                    attrib = attribs[attrName];
                    config.input.dom.setAttribute(
                        attrName.toLowerCase(),
                        /^auto/i.test(attrName) ? (assert.test(attrib+'') ? 'on' : 'off' ) : attrib
                    );
                }
            }

        } else {
            this.inputsEl && this.inputsEl.hide();
        }

        this.setIcon(config.icon || '', false);
        this.updateText(config.msg, false);

        if (config.cls) {
            this.el.addClass(config.cls);
        }

        this.modal = !!config.modal;

        var bbar = this.buttonBar,
            bs = [];

        bbar.removeAll();

        Ext.each([].concat(config.buttons || Ext.MessageBox.OK), function(button) {
            if (button) {
                bs.push(
                    Ext.applyIf({
                        config  : config,
                        scope   : this,
                        handler : this.onClick
                    }, button)
                );
            }
        }, this);

        bbar.add(bs);

        if (bbar.rendered) {
            bbar.doLayout();
        }

        Ext.MessageBox.superclass.show.call(this, config.animate);

        if (config.input) {
            config.input.dom.value = config.value || '';
            
            if (assert.test(attribs.autofocus+'') && !('autofocus' in config.input.dom)) {
                config.input.dom.focus();
            }
        }

        return this;
    },

     
    onOrientationChange : function() {
        this.doComponentLayout();

        Ext.MessageBox.superclass.onOrientationChange.apply(this, arguments);
    },

    
    adjustScale : function(){
        Ext.apply(this,{
            maxWidth : window.innerWidth,
            maxHeight : window.innerHeight,
            minWidth : window.innerWidth * .5,
            minHeight : window.innerHeight * .5
        });
    },

    
    doComponentLayout : function() {
        this.adjustScale();

        return Ext.MessageBox.superclass.doComponentLayout.apply(this, arguments);
    },

    
    alert : function(title, msg, fn, scope) {
        return this.show({
            title : title,
            msg   : msg,
            buttons: Ext.MessageBox.OK,
            fn    : fn,
            scope : scope,
            icon  : Ext.MessageBox.INFO
        });
    },

    
    confirm : function(title, msg, fn, scope) {
        return this.show({
            title : title,
            msg : msg,
            buttons: Ext.MessageBox.YESNO,
            fn: function(button) {
                if (button == 'yes')
                    fn.apply(scope);
            },
            scope : scope,
            icon: Ext.MessageBox.QUESTION
        });
     },

    
    prompt : function(title, msg, fn, scope, multiLine, value, promptConfig) {
        return this.show({
            title : title,
            msg : msg,
            buttons: Ext.MessageBox.OKCANCEL,
            fn: function(button, inputValue) {
                if (button == 'ok')
                    fn.call(scope, inputValue);
            },
            scope : scope,
            icon  : Ext.MessageBox.QUESTION,
            prompt: promptConfig || true,
            multiLine: multiLine,
            value: value
        });
    },

    
    updateText : function(text, doLayout) {
        if(this.msgEl) {
            this.msgEl.update(text ? String(text) : '&#160;');
            if(doLayout !== false) {
                this.doComponentLayout();
            }
        }
        return this;
    },

    
    setIcon : function(icon, doLayout) {
        if (icon) {
            this.iconEl.show();
            this.iconEl.replaceClass(this.iconCls, icon);
        } else {
            this.iconEl.replaceClass(this.iconCls, 'x-hidden-display');
        }

        if (doLayout !== false) {
            this.doComponentLayout();
        }

        this.iconCls = icon;
        return this;
    }
});

(function(){
    var B = Ext.MessageBox;

    Ext.apply(B, {
        OK     : {text : 'OK',     itemId : 'ok',  ui : 'action' },
        CANCEL : {text : 'Cancel', itemId : 'cancel'},
        YES    : {text : 'Yes',    itemId : 'yes', ui : 'action' },
        NO     : {text : 'No',     itemId : 'no'},
        

        
        INFO     : 'x-msgbox-info',
        WARNING  : 'x-msgbox-warning',
        QUESTION : 'x-msgbox-question',
        ERROR    : 'x-msgbox-error'
    });

    Ext.apply(B, {
        OKCANCEL    : [B.OK , B.CANCEL],
        YESNOCANCEL : [B.YES, B.NO, B.CANCEL],
        YESNO       : [B.YES, B.NO]
        
    });

})();

Ext.reg('msgbox', Ext.MessageBox);


Ext.Msg = new Ext.MessageBox();

Ext.form.FormPanel = Ext.extend(Ext.Panel, {
    
    standardSubmit: false,

    cmpCls: 'x-form',
    
    
    url : undefined,
    
    
    baseParams : undefined,
    
    
    waitTpl: new Ext.XTemplate(
        '<div class="{cls}">{message}&hellip;</div>'
    ),

    getElConfig : function() {
        return Ext.apply(Ext.form.FormPanel.superclass.getElConfig.call(this), {
            tag: 'form'
        });
    },
    
    
    initComponent : function() {
        this.addEvents(
           
            'submit', 
           
             'beforesubmit', 
           
             'exception'
        );
        Ext.form.FormPanel.superclass.initComponent.call(this);
    },

    
    afterRender : function() {
        Ext.form.FormPanel.superclass.afterRender.call(this);
        this.el.on('submit', this.onSubmit, this);
    },

    
    onSubmit : function(e, t) {
        if (!this.standardSubmit || this.fireEvent('beforesubmit', this, this.getValues(true)) === false) {
            if (e) {
                e.stopEvent();
            }       
        }
    },
    
    

    submit : function(options) {
        var form = this.el.dom || {},
            O = Ext.apply({
               url : this.url || form.action,
               submitDisabled : false,
               method : form.method || 'post',
               autoAbort : false,
               params : null,
               waitMsg : null,
               headers : null,
               success : null,
               failure : null
            }, options || {}),
            formValues = this.getValues(this.standardSubmit || !O.submitDisabled);
        
        if (this.standardSubmit) {
            if (form) {
                if (O.url && Ext.isEmpty(form.action)) {
                    form.action = O.url;
                }
                form.method = (O.method || form.method).toLowerCase();
                form.submit();
            }
            return null;
        }
        if (this.fireEvent('beforesubmit', this, formValues, options ) !== false) {
            if (O.waitMsg) {
                this.showMask(O.waitMsg);
            }
            
            return Ext.Ajax.request({
                url     : O.url,
                method  : O.method,
                rawData : Ext.urlEncode(Ext.apply(
                    Ext.apply({},this.baseParams || {}),
                    O.params || {},
                    formValues
                  )),
                autoAbort : O.autoAbort,
                headers  : Ext.apply(
                   {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                    O.headers || {}),
                scope    : this,
                callback : function(options, success, response) {
                     var R = response;
                     this.hideMask();   
                        
                     if (success) {
                          R = Ext.decode(R.responseText);
                          success = !!R.success;
                          if (success) {
                              if (typeof O.success == 'function') {
                                 O.scope ? O.success.call(O.scope, this, R) : O.success(this, R);
                              }
                              this.fireEvent('submit', this, R);
                              return;
                          }
                     }
                    if (typeof O.failure == 'function') {
                        O.scope ? O.failure.call(O.scope, this, R) : O.failure(this, R);
                    }
                    this.fireEvent('exception', this, R);
                }
            });
        }
    },

    
    loadRecord: function(instance) {
        if (instance && instance.data) {
            this.setValues(instance.data);
            
            
            this.record = instance;
        }
        
        return this;
    },
    
    
    loadModel: function() {
        return this.loadRecord.apply(this, arguments);
    },
    
    
    getRecord: function() {
        return this.record;
    },
    
    
    updateModel: function(instance, enabled) {
        var fields, values, name;
        
        if(instance && (fields = instance.fields)){
            values = this.getValues(enabled);
            for (name in values) {
                if(values.hasOwnProperty(name) && fields.containsKey(name)){
                   instance.set(name, values[name]);     
                }
            }
        }
        return this;
         
    },

    
    setValues: function(values) {
         var fields = this.getFields(),
            name, field;
        values = values || {};
        for (name in values) {
            if (values.hasOwnProperty(name) && name in fields) {
                field = fields[name];
                field.setValue && field.setValue(values[name]);
            }       
        }
        return this;
    },

    
    getValues: function(enabled) {
        var fields = this.getFields(),
            field,
            values = {},
            name;

        for (name in fields) {
            if (fields.hasOwnProperty(name)) {
                field = fields[name];
                if (enabled && field.disabled) {
                    continue;
                }
                if (field.getValue) {
                    values[name] = field.getGroupValue ? field.getGroupValue() : field.getValue();
                }
            }
        }

        return values;

    },

    
    reset: function() {
        var fields = this.getFields(),
            name;
        for (name in fields) {
            if(fields.hasOwnProperty(name)){
                fields[name].reset();
            }
        }
    },

    
    getFields: function() {
        var fields = {};

        var getFieldsFrom = function(item) {
            if (item.isField) {
                fields[item.getName()] = item;
            }

            if (item.isContainer) {
                item.items.each(getFieldsFrom);
            }
        };

        this.items.each(getFieldsFrom);
        return fields;
    },
    
    showMask : function(cfg, target){
        
        cfg = Ext.isString(cfg)? {message : cfg, transparent : false} : cfg; 
        
        if(cfg && this.waitTpl){
            this.maskTarget = target = Ext.get(target || cfg.target) || this.el;
            target && target.mask(!!cfg.transparent, this.waitTpl.apply(cfg));
        }
        return this;
    },
    
    
    hideMask : function(){
        if(this.maskTarget){
            this.maskTarget.unmask();
            delete this.maskTarget;
        }
        return this;
    }
});

 
Ext.form.FormPanel.prototype.load = Ext.form.FormPanel.prototype.loadModel; 
Ext.reg('form', Ext.form.FormPanel);


Ext.form.FieldSet = Ext.extend(Ext.Panel, {
    cmpCls: 'x-form-fieldset',

    
    initComponent : function() {
        this.componentLayout = this.getLayout();
        Ext.form.FieldSet.superclass.initComponent.call(this);
    },
    

    

    

    
    afterLayout : function(layout) {
        Ext.form.FieldSet.superclass.afterLayout.call(this, layout);
        if (this.title && !this.titleEl) {
            this.setTitle(this.title);
        } else if (this.titleEl) {
            this.el.insertFirst(this.titleEl);
        }

        if (this.instructions && !this.instructionsEl) {
            this.setInstructions(this.instructions);
        } else if (this.instructionsEl) {
            this.el.appendChild(this.instructionsEl);
        }
    },
    
    
    setTitle: function(title){
        if (this.rendered) {
            if (!this.titleEl) {
                this.titleEl = this.el.insertFirst({
                    cls: this.cmpCls + '-title'
                });
            }
            this.titleEl.setHTML(title);
        } else {
            this.title = title;
        }
        return this;
    },
    
    
    setInstructions: function(instructions){
        if (this.rendered) {
            if (!this.instructionsEl) {
                this.instructionsEl = this.el.createChild({
                    cls: this.cmpCls + '-instructions'
                });
            }
            this.instructionsEl.setHTML(instructions);
        } else {
            this.instructions = instructions;
        }
        return this;
    }
});

Ext.reg('fieldset', Ext.form.FieldSet);

Ext.form.Field = Ext.extend(Ext.Component,  {
    ui: 'text',

    
    isField: true,

    

    

    

    

    

    
    baseCls : 'x-field',

    
    inputCls: undefined,

    
    focusClass : 'x-field-focus',
    
    
    maxLength : 0,
    
    
    placeHolder : undefined,
    
    
    autoComplete: undefined,
    
    
    autoCapitalize: undefined,
    
    
    autoFocus: undefined,
    
    
    autoCorrect: undefined,

    renderTpl: [
        '<tpl if="label"><label <tpl if="fieldEl">for="{inputId}"</tpl> class="x-form-label"><span>{label}</span></label></tpl>',
        '<tpl if="fieldEl"><input id="{inputId}" type="{type}" name="{name}" class="{fieldCls}"',
            '<tpl if="tabIndex">tabIndex="{tabIndex}" </tpl>',
            '<tpl if="placeHolder">placeholder="{placeHolder}" </tpl>',
            '<tpl if="style">style="{style}" </tpl>',
            '<tpl if="maxlength">maxlength="{maxlength}" </tpl>',
            '<tpl if="autoComplete">autocomplete="{autoComplete}" </tpl>',
            '<tpl if="autoCapitalize">autocapitalize="{autoCapitalize}" </tpl>',
            '<tpl if="autoCorrect">autocorrect="{autoCorrect}" </tpl>',
            '<tpl if="autoFocus">autofocus="{autoFocus}" </tpl>',
        '/></tpl>',
        '<tpl if="showClear"><div class="x-field-clear x-hidden-display">&#215;</div></tpl>',
        '<tpl if="maskField"><div class="x-field-mask"></div></tpl>'
    ],

    
    disabled : false,

    
    isFormField : true,

    
    hasFocus : false,

    
    autoCreateField: true,

    
    inputType: 'text',
    
    
    label: null,
    
    labelWidth: 100, 

    
    labelAlign: 'left',

    
    required: false,

    maskField: false,

    
    initComponent : function() {
        
        this.label = this.label || this.fieldLabel;

        Ext.form.Field.superclass.initComponent.call(this);
        this.addEvents(
            
            'focus',
            
            'blur',
            
            'change',
            
            'keyup'
        );
    },

    
    getName : function() {
        return this.name || this.id || '';
    },

    
    applyRenderSelectors: function() {
        this.renderSelectors = Ext.applyIf(this.renderSelectors || {}, {
            mask   : '.x-field-mask',
            labelEl: 'label',
            clearEl: '.x-field-clear',
            fieldEl: '.' + Ext.util.Format.trim(this.renderData.fieldCls).replace(/ /g, '.')
        });
        Ext.form.Field.superclass.applyRenderSelectors.call(this);
    },
    
    initRenderData: function() {
        var me = this,
            renderData     = Ext.form.Field.superclass.initRenderData.call(this),
            autoComplete   = me.autoComplete,
            autoCapitalize = me.autoCapitalize,
            autoFocus      = me.autoFocus,
            autoCorrect    = me.autoCorrect;
        
        Ext.applyIf(renderData, {
            disabled:   me.disabled,
            fieldCls:   'x-input-' + me.inputType + (me.inputCls ? ' ' + me.inputCls : ''),
            fieldEl:    !me.fieldEl && me.autoCreateField,
            inputId:    Ext.id(),
            label:      me.label,
            labelAlign: 'x-label-align-' + me.labelAlign,
            name:       me.name || me.id,
            placeHolder: me.placeHolder,
            required:   me.required,
            style:      me.style,
            tabIndex:   me.tabIndex,
            maxlength : me.maxLength,
            type:       me.inputType,
            maskField:  me.maskField,
            showClear:  me.showClear
        });
        
        var positive = /true|on/i;
        if (autoComplete !== undefined) {
            renderData.autoComplete = positive.test(autoComplete + '') ? 'on' : 'off';
        }
        
        if (autoCapitalize !== undefined) {
            renderData.autoCapitalize = positive.test(autoCapitalize + '') ? 'on' : 'off';
        }
        
        if (autoCorrect !== undefined) {
            renderData.autoCorrect = positive.test(autoCorrect + '') ? 'on' : 'off';
        }
        
        if (autoFocus !== undefined) {
            renderData.autoFocus = positive.test(autoFocus + '') ? 'on' : 'off';
            me.autoFocus = renderData.autoFocus == 'on';
        }
        
        this.renderData = renderData;
        return renderData;
    },
    
    onRender : function() {
        Ext.form.Field.superclass.onRender.apply(this, arguments);
        
        var cls = [];
        if (this.required) {
            cls.push('x-field-required');
        }
        if (this.label) {
            cls.push('x-label-align-' + this.labelAlign);
        }
        this.el.addClass(cls);
    },
    
    initEvents : function() {
        var me = this;
        
        Ext.form.Field.superclass.initEvents.call(me);
        
        if (me.fieldEl) {
            me.mon(me.fieldEl, {
                focus: me.onFocus,
                blur: me.onBlur,
                keyup: me.onKeyUp,
                paste: me.checkClear,
                scope: me
            });
            
            if (me.maskField) {
                me.mon(me.mask, {
                    tap: me.onMaskTap,
                    scope: me
                });
            }
            
            if(me.clearEl){
                me.mon(me.clearEl, {
                    scope: this,
                    tap: this.onClearTap    
                });
            }
        }        
    },

    
    onEnable : function() {
        this.el.removeClass(this.disabledClass);
        this.el.dom.disabled = false;
        this.fieldEl.dom.disabled = false;
        this.checkClear();
    },

    
    onDisable : function() {
        this.el.addClass(this.disabledClass);
        this.el.dom.disabled = true;
        this.fieldEl.dom.disabled = true;
        this.checkClear(true);
    },

    
    initValue : function() {
        if (this.value !== undefined) {
            this.setValue(this.value);
        }

        
        this.originalValue = this.getValue();
    },

    
    isDirty : function() {
        if (this.disabled || !this.rendered) {
            return false;
        }
        return String(this.getValue()) !== String(this.originalValue);
    },
    
    onClearTap: function(){
        this.setValue('');    
    },
    
    checkClear: function(force){
        var clearEl = this.clearEl,
            fieldEl = this.fieldEl,
            value = this.getValue();
        if (!(clearEl && fieldEl)) {
            return;
        }
        value = Ext.isEmpty(value) ? '' : String(value);
        if(force || value.length === 0){
            clearEl.addClass('x-hidden-display');
            fieldEl.removeClass('x-field-clearable');
        }else{
            clearEl.removeClass('x-hidden-display');
            fieldEl.addClass('x-field-clearable');
        }
          
    },

    
    afterRender : function() {
        Ext.form.Field.superclass.afterRender.call(this);
        this.initValue();
        this.checkClear();
        if(this.autoFocus && !('autofocus' in this.fieldEl.dom)) {
            this.focus();
        }
    },

    onKeyUp : function(e) {
        this.checkClear();
        if (e.browserEvent.keyCode === 13) {
            this.blur();
            Ext.hideAddressBar();
        }
        this.fireEvent('keyup', this, e);
    },

    onMaskTap : function(e) {
        this.mask.hide();
    },
    
    
    reset : function() {
        this.setValue(this.originalValue);
    },

    
    beforeFocus: Ext.emptyFn,

    undoNativeScroll : function() {
        var parent = this.el.parent();
        while (parent) {
            if (parent.getStyle('overflow') == 'hidden') {
                parent.dom.scrollTop = 0;
                parent.dom.scrollLeft = 0;
            }
            parent = parent.parent();
        }
    },

    
    onFocus : function(e) {
        var me = this;
        setTimeout(function() {
            me.undoNativeScroll();
        }, 0);

        this.beforeFocus();
        if (this.focusClass) {
            this.el.addClass(this.focusClass);
        }

        if (!this.hasFocus) {
            this.hasFocus = true;
            
            this.startValue = this.getValue();
            this.fireEvent('focus', this);
        }
        
        Ext.getDoc().on('touchend', this.onDocTouchEnd, this, {capture: true});
    },
    
    onDocTouchEnd : function(e, t) {
        if (!Ext.fly(e.target).hasClass('x-field-mask') && t.tagName.toLowerCase() != 'input') {
            this.blur();
            Ext.hideAddressBar();
        }
    },

    
    beforeBlur : Ext.emptyFn,

    
    onBlur : function() {
        Ext.getDoc().un('touchend', this.onDocTouchEnd, this);
                    
        this.beforeBlur();
        if (this.focusClass) {
            this.el.removeClass(this.focusClass);
        }
        this.hasFocus = false;
        var v = this.getValue();
        if (String(v) != String(this.startValue)){
            this.fireEvent('change', this, v, this.startValue);
        }
        this.fireEvent('blur', this);
        this.checkClear();
        if (this.maskField) {
            this.mask.show();
        }
        this.postBlur();
    },

    
    postBlur : Ext.emptyFn,

    
    getValue : function(){
        if (!this.rendered || !this.fieldEl) {
            return this.value;
        }
        return this.fieldEl.getValue();
    },

    
    
    focus : function(){
        if(this.rendered && this.fieldEl && this.fieldEl.dom.focus) {
            this.fieldEl.dom.focus();
        }
        return this;
    },
    
    
    blur : function(){
        if(this.rendered && this.fieldEl && this.fieldEl.dom.blur) {
            this.fieldEl.dom.blur();
        }
        return this;
    },

    
    setValue : function(v){
        this.value = v;
        if (this.rendered && this.fieldEl) {
            this.fieldEl.dom.value = (Ext.isEmpty(v) ? '' : v);
        }
        this.checkClear();
        return this;
    }
});

Ext.reg('field', Ext.form.Field);


Ext.form.Slider = Ext.extend(Ext.form.Field, {
    ui: 'slider',
    

    
    inputCls: 'x-slider',
    
    inputType: 'slider',

    
    minValue: 0,

    
    maxValue: 100,

    
    animate: true,

    
    value: 0,
    
    
    trackWidth: null,
     
    renderTpl: [
        '<tpl if="label">',
            '<label <tpl if="fieldEl">for="{inputId}"</tpl> class="x-form-label"><span>{label}</span></label>',
        '</tpl>',
        '<tpl if="fieldEl">',
            '<div id="{inputId}" name="{name}" class="{fieldCls}"',
            '<tpl if="tabIndex">tabIndex="{tabIndex}"</tpl>',
            '<tpl if="style">style="{style}" </tpl>',
        '/></tpl>'
    ],

    
    increment: 1,

    

    

    
    constructor: function(config) {
        this.addEvents(
            
            'beforechange',

            
            'change',
            
            'drag',
            
            'dragend'
        );

        Ext.form.Slider.superclass.constructor.call(this, config);
    },

    
    initComponent: function() {
        var me = this;
        
        
        
        me.values = [me.value];

        Ext.form.Slider.superclass.initComponent.apply(me, arguments);

        if (me.thumbs == undefined) {
            var thumbs = [],
                values = me.values,
                length = values.length,
                i,
                Thumb = me.getThumbClass();

            for (i = 0; i < length; i++) {
                thumbs[thumbs.length] = new Thumb({
                    value: values[i],
                    slider: me,

                    listeners: {
                        scope  : me,
                        drag   : me.onDrag,
                        dragend: me.onThumbDragEnd
                    }
                });
            }

            me.thumbs = thumbs;
        }
    },

    getThumbClass: function() {
        return Ext.form.Slider.Thumb;
    },

    
    setValue: function(value, animate) {
        
        var me       = this,
            thumb    = me.getThumb(),
            oldValue = thumb.getValue(),
            newValue = me.constrain(value);

        if (me.fireEvent('beforechange', me, thumb, oldValue, newValue) !== false) {
            me.moveThumb(thumb, me.getPixelValue(newValue, thumb), animate);
            thumb.setValue(newValue);
            me.doComponentLayout();

            me.fireEvent('change', me, thumb, oldValue, newValue);
        }
    },

    
    constrain: function(value) {
        var increment = this.increment,
        div = Math.floor(Math.abs(value / increment)),
        lower = this.minValue + (div * increment),
        higher = Math.min(lower + increment, this.maxValue),
        dLower = value - lower,
        dHigher = higher - value;

        return (dLower < dHigher) ? lower: higher;
    },

    
    getValue: function() {
        
        return this.getThumb().getValue();
    },

    
    getThumb: function() {
        
        
        return this.thumbs[0];
    },

    
    getSliderValue: function(pixelValue, thumb) {
        var thumbWidth = thumb.el.getOuterWidth(),
            halfWidth  = thumbWidth / 2,
            trackWidth = this.fieldEl.getWidth() - thumbWidth,
            range      = this.maxValue - this.minValue,
            ratio;
        
        
        this.trackWidth = (trackWidth > 0) ? trackWidth : this.trackWidth;
        
        
        ratio = range / this.trackWidth;
        
        return this.minValue + (ratio * (pixelValue - halfWidth));
    },

    
    getPixelValue: function(value, thumb) {
        var thumbWidth = thumb.el.getOuterWidth(),
            halfWidth  = thumbWidth / 2,
            trackWidth = this.fieldEl.getWidth() - thumbWidth,
            range      = this.maxValue - this.minValue,
            ratio;
        
        
        this.trackWidth = (trackWidth > 0) ? trackWidth : this.trackWidth;
        
        
        ratio = this.trackWidth / range;

        return (ratio * (value - this.minValue)) + halfWidth;
    },

    
    renderThumbs: function() {
        var thumbs = this.thumbs,
            length = thumbs.length,
            i;

        for (i = 0; i < length; i++) {
            thumbs[i].render(this.fieldEl);
        }
    },

    
    onThumbDragEnd: function(draggable) {
        var value = this.getThumbValue(draggable),
            me = this;

        me.setValue(value);
        me.fireEvent('dragend', me, draggable.thumb, me.constrain(value));
    },

    
    getThumbValue: function(draggable) {
        var thumb = draggable.thumb,
            sliderBox = this.fieldEl.getPageBox(),
            thumbBox = thumb.el.getPageBox(),

            thumbWidth = thumbBox.width,
            halfWidth = thumbWidth / 2,
            center = (thumbBox.left - sliderBox.left) + halfWidth;

        return this.getSliderValue(center, thumb);
    },

    
    onDrag: function(draggable){
        var value = this.getThumbValue(draggable);
        this.fireEvent('drag', this, draggable.thumb, this.constrain(value));
    },

    
    onTap: function(e) {
        if (!this.disabled) {
            var sliderBox = this.fieldEl.getPageBox(),
                leftOffset = e.pageX - sliderBox.left,
                thumb = this.getNearest(leftOffset);

            this.setValue(this.getSliderValue(leftOffset, thumb), this.animate);
        }
    },

    
    moveThumb: function(thumb, pixel, animate) {
        var halfWidth  = thumb.el.getOuterWidth() / 2;
        if (animate) {
            new Ext.Anim({
                to: {
                    left: (pixel - halfWidth) + 'px'
                },
                duration: 200,
                autoClear: false
            }).run(thumb.el);
        } else {
            thumb.el.setLeft(pixel - halfWidth);
        }
    },

    
    afterRender: function(ct) {
        var me = this;
        
        me.renderThumbs();

        Ext.form.Slider.superclass.afterRender.apply(me, arguments);

        me.fieldEl.on({
            scope: me,
            tap  : me.onTap
        });
    },

    
    getNearest: function(value) {
        
        return this.thumbs[0];
    },
    
    
    setThumbsDisabled: function(disable) {
        var thumbs = this.thumbs,
            ln     = thumbs.length,
            i      = 0;

        for (; i < ln; i++) {
            thumbs[i].dragObj[disable ? 'disable' : 'enable']();
        }
    },
    
    
    disable: function() {
        Ext.form.Slider.superclass.disable.call(this);
        this.setThumbsDisabled(true);
    },
    
    
    enable: function() {
        Ext.form.Slider.superclass.enable.call(this);
        this.setThumbsDisabled(false);
    }
});

Ext.reg('slider', Ext.form.Slider);


Ext.form.Slider.Thumb = Ext.extend(Ext.form.Field, {
    isField: false,
    baseCls: 'x-thumb',
    autoCreateField: false,
    draggable: true,

    
    value: 0,

    

    
    onRender: function() {
        this.draggable = {
            direction: 'horizontal',
            constrain: this.slider.fieldEl,
            revert: false,
            thumb: this
        };

        Ext.form.Slider.Thumb.superclass.onRender.apply(this, arguments);
    },

    
    setValue: function(newValue) {
        this.value = newValue;
    },

    
    getValue: function() {
        return this.value;
    }
});

Ext.reg('thumb', Ext.form.Slider.Thumb);


Ext.form.Toggle = Ext.extend(Ext.form.Slider, {
    minValue: 0,
    maxValue: 1,
    ui: 'toggle',
    inputType: 'toggle',

    

    
    minValueCls: 'x-toggle-off',

    
    maxValueCls: 'x-toggle-on',

    
    toggle: function() {
        var me = this,
            thumb = me.thumbs[0],
            value = thumb.getValue();

        me.setValue(value == me.minValue ? me.maxValue : me.minValue);
    },

    
    setValue: function(value) {
        var me = this;
        Ext.form.Toggle.superclass.setValue.apply(me, arguments);

        var fieldEl = me.fieldEl;
        if (me.constrain(value) === me.minValue) {
            fieldEl.addClass(me.minValueCls);
            fieldEl.removeClass(me.maxValueCls);
        }
        else {
            fieldEl.addClass(me.maxValueCls);
            fieldEl.removeClass(me.minValueCls);
        }
    },

    
    onTap: function() {
        if (!this.disabled) {
            this.toggle();
        }
    },

    getThumbClass: function() {
        return Ext.form.Toggle.Thumb;
    }
});

Ext.reg('toggle', Ext.form.Toggle);


Ext.form.Toggle.Thumb = Ext.extend(Ext.form.Slider.Thumb, {
    onRender: function() {
        Ext.form.Toggle.Thumb.superclass.onRender.apply(this, arguments);
        Ext.DomHelper.append(this.el, [{
            cls: 'x-toggle-thumb-off',
            html: '<span>OFF</span>'
        },{
            cls: 'x-toggle-thumb-on',
            html: '<span>ON</span>'
        },{
            cls: 'x-toggle-thumb-thumb'
        }]);
    }
});

Ext.form.TextField = Ext.extend(Ext.form.Field, {
    type: 'text',
    maskField: Ext.is.iOS
    
    
});

Ext.reg('textfield', Ext.form.TextField);


Ext.form.PasswordField = Ext.extend(Ext.form.Field, {
    maskField: Ext.is.iOS,
    inputType: 'password',
    autoCapitalize : false
});

Ext.reg('passwordfield', Ext.form.PasswordField);


Ext.form.EmailField = Ext.extend(Ext.form.TextField, {
    inputType: 'email',
    autoCapitalize : false
});

Ext.reg('emailfield', Ext.form.EmailField);


Ext.form.UrlField = Ext.extend(Ext.form.TextField, {
    inputType: 'url',    
    autoCapitalize : false
});

Ext.reg('urlfield', Ext.form.UrlField);


Ext.form.SearchField = Ext.extend(Ext.form.Field, {
    inputType: 'search'
    
});

Ext.reg('searchfield', Ext.form.SearchField);


Ext.form.NumberField = Ext.extend(Ext.form.TextField, {
    inputType: 'number',
    
    minValue : undefined,
    
    maxValue : undefined,
    
    stepValue : undefined,
    
    renderTpl: [
        '<tpl if="label"><label <tpl if="fieldEl">for="{inputId}"</tpl> class="x-form-label"><span>{label}</span></label></tpl>',
        '<tpl if="fieldEl"><input id="{inputId}" type="{type}" name="{name}" class="{fieldCls}"',
            '<tpl if="tabIndex">tabIndex="{tabIndex}" </tpl>',
            '<tpl if="placeholder">placeholder="{placeholder}" </tpl>',
            '<tpl if="style">style="{style}" </tpl>',
            '<tpl if="minValue != undefined">min="{minValue}" </tpl>',
            '<tpl if="maxValue != undefined">max="{maxValue}" </tpl>',
            '<tpl if="stepValue != undefined">step="{stepValue}" </tpl>',
            '<tpl if="autoComplete">autocomplete="{autoComplete}" </tpl>',
            '<tpl if="autoCapitalize">autocapitalize="{autoCapitalize}" </tpl>',
            '<tpl if="autoFocus">autofocus="{autoFocus}" </tpl>',
        '/></tpl>',
        '<tpl if="showClear"><div class="x-field-clear x-hidden-display"></div></tpl>',
        '<tpl if="maskField"><div class="x-field-mask"></div></tpl>'
    ],
    
    ui: 'number',
    
    
    onRender : function(ct, position) {
        Ext.apply(this.renderData, {
            maxValue : this.maxValue,
            minValue : this.minValue,
            stepValue : this.stepValue 
        });
        Ext.form.NumberField.superclass.onRender.call(this, ct, position);
    }
});

Ext.reg('numberfield', Ext.form.NumberField);


Ext.form.SpinnerField = Ext.extend(Ext.form.NumberField, {

    
    cmpCls: 'x-spinner',
    
    
    minValue: Number.NEGATIVE_INFINITY,
    
    maxValue: Number.MAX_VALUE,
    
    incrementValue: 1,
    
    accelerate: true,
    
    defaultValue: 0,

    
    cycle: false,
    
    
    disableInput: false,

    renderTpl: [
        '<tpl if="label"><label <tpl if="fieldEl">for="{inputId}"</tpl> class="x-form-label"><span>{label}</span></label></tpl>',
        '<tpl if="fieldEl">',
            '<div class="{cmpCls}-body">',
                '<div class="{cmpCls}-down"><span>-</span></div>',
                '<input id="{inputId}" type="number" name="{name}" class="{fieldCls}"',
                    '<tpl if="disableInput">disabled </tpl>',
                    '<tpl if="tabIndex">tabIndex="{tabIndex}" </tpl>',
                    '<tpl if="placeholder">placeholder="{placeholder}" </tpl>',
                    '<tpl if="style">style="{style}" </tpl>',
                    '<tpl if="autoFocus">autofocus="{autoFocus}" </tpl>',
                    '<tpl if="autoComplete">autocomplete="{autoComplete}" </tpl>',
                '/>',
                '<div class="{cmpCls}-up"><span>+</span></div>',
            '</div>',
        '</tpl>',
        '<div class="x-field-mask"></div>'
    ],
    
    initComponent: function(){
        this.addEvents(
            
            'spin',
            
            'spindown',
            
            'spinup'
        );
        Ext.form.SpinnerField.superclass.initComponent.call(this);    
    },

    
    onRender: function(ct, position) {
        var me = this;
        me.renderData.disableInput = me.disableInput;

        Ext.applyIf(me.renderSelectors, {
            spinUpEl: '.x-spinner-up',
            spinDownEl: '.x-spinner-down'
        });

        Ext.form.SpinnerField.superclass.onRender.call(me, ct, position);
        
        me.downRepeater = me.createRepeater(me.spinDownEl, me.onSpinDown);
        me.upRepeater = me.createRepeater(me.spinUpEl, me.onSpinUp);
    },
    
    
    createRepeater: function(el, fn){
        var repeat = new Ext.util.TapRepeater(el, {
            accelerate: this.accelerate
        });
        this.mon(repeat, {
            tap: fn,
            touchstart: this.onTouchStart,
            touchend: this.onTouchEnd,
            preventDefault: true,
            scope: this
        });
        return repeat;
    },

    
    onSpinDown: function() {
        if (!this.disabled) {
            this.spin(true);
        }
    },

    
    onSpinUp: function() {
        if (!this.disabled) {
            this.spin(false);
        }
    },

    
    onTouchStart : function(btn) {
        btn.el.addClass('x-button-pressed');
    },

    
    onTouchEnd : function(btn) {
        btn.el.removeClass('x-button-pressed');
    },

    
    spin: function(down) {
        var me = this,
            value = parseFloat(me.getValue()),
            increment = me.incrementValue,
            cycle = me.cycle,
            min = me.minValue,
            max = me.maxValue,
            direction = down ? 'down' : 'up';

        if(down){
            value -= increment;
        }else{
            value += increment;
        }

        value = (isNaN(value)) ? me.defaultValue: value;
        if (value < min) {
            value = cycle ? max : min;
        }
        else if (value > max) {
            value = cycle ? min : max;
        }
        me.setValue(value);
        this.fireEvent('spin' + direction, this, value);
        this.fireEvent('spin', this, value, direction);
    },

    
    destroy : function() {
        Ext.destroy(this.downRepeater, this.upRepeater);
        Ext.form.SpinnerField.superclass.destroy.call(this, arguments);
    }
});

Ext.reg('spinnerfield', Ext.form.SpinnerField);


Ext.form.HiddenField = Ext.extend(Ext.form.Field, {
    inputType: 'hidden',
    ui: 'hidden',

    
    
    focus : Ext.emptyFn
});

Ext.reg('hidden', Ext.form.HiddenField);


Ext.form.Checkbox = Ext.extend(Ext.form.Field, {
    inputType: 'checkbox',
    ui: 'checkbox',
    
    

    
    checked : false,
    
    
    inputValue : undefined,

    
    constructor: function(config) {
        this.addEvents(
            
            'check'
        );

        Ext.form.Checkbox.superclass.constructor.call(this, config);
    },
    
    renderTpl: [
        '<tpl if="label"><label <tpl if="fieldEl">for="{inputId}"</tpl> class="x-form-label"><span>{label}</span></label></tpl>',
        '<tpl if="fieldEl"><input id="{inputId}" type="{type}" name="{name}" class="{fieldCls}" ',
            '<tpl if="tabIndex">tabIndex="{tabIndex}" </tpl>',
            '<tpl if="checked"> checked </tpl>',
            '<tpl if="style">style="{style}" </tpl> value="{inputValue}" />',
        '</tpl>'
    ],

    
    onRender : function(ct, position) {
        var me = this;
        
        Ext.apply(me.renderData, {
            inputValue : me.inputValue || me.value || '',
            checked    : me.checked = /^(true|1|on)/i.test(String(me.checked))
        });
        
        Ext.form.Checkbox.superclass.onRender.call(me, ct, position);

        if (me.fieldEl) {
            me.mon(me.fieldEl, {
                change: me.onChange,
                scope: me
            });
            
	        me.setValue(me.checked);
        }
        
    },
    
    
    onChange : function() {
        this.fireEvent('check', this, this.getValue());
    },

    
    getValue : function(){
        if (this.rendered) {
            return this.fieldEl.dom.checked || false;
        }
        return this.checked || false;
    },

    
    setValue : function(v) {

        var checked = this.getValue();
        this.checked = /^(true|1|on)/i.test(String(v));
        
        if (this.rendered) {
            this.fieldEl.dom.checked = this.fieldEl.dom.defaultChecked = this.checked;
        }
        
        if (checked != this.checked) {
            this.onChange();
        }
    }
});

Ext.reg('checkbox', Ext.form.Checkbox);


Ext.form.Radio = Ext.extend(Ext.form.Checkbox, {
    inputType: 'radio',
    ui: 'radio',
    

    
    getGroupValue: function() {
        var p = this.el.up('form') || Ext.getBody(),
            c = p.down('input[name=' + this.fieldEl.dom.name + ']:checked', true);
        return c ? c.value: null;
    },

    
    setValue: function(value) {
        if (typeof value == 'boolean') {
            Ext.form.Radio.superclass.setValue.call(this, value);
        } 
        else if (this.rendered && value != undefined) {
            var radio = this.findMatchingRadio(value),
                wrap = radio ? radio.up('.' + this.renderData.baseCls) : null;
                
            if (wrap) {
                Ext.getCmp(wrap.id).setValue(true);
            }
        }
    },
    
    
    findMatchingRadio: function(value){
        var checkEl;
        this.getCheckEl().select('input[name=' + this.fieldEl.dom.name + ']').each(function(el){
            if (el.dom.value == value) {
                checkEl = el;
                return false;
            }
        });
        return checkEl;
    },

    
    getCheckEl: function() {
        if (this.inGroup) {
            return this.el.up('.x-form-radio-group');
        }
        return this.el.up('form') || Ext.getBody();
    }
});
Ext.reg('radio', Ext.form.Radio);


Ext.form.Select = Ext.extend(Ext.form.TextField, {
    ui: 'select',
    

    
    valueField: 'value',

    
    displayField: 'text',

    

    
    
    maskField: true,

    
    prependText: '',

     
    initComponent : function() {
        var me = this;
        
        
        me.label = me.label || me.fieldLabel;

        var options    = me.options,
            parsedData = [],
            ln         = options && options.length,
            i, item, obj;

        if (options && Ext.isArray(options) && ln) {
            me.store = new Ext.data.Store({
                model: 'x-textvalue',
                data: options
            });
        }
        else if (me.store) {
            me.store = Ext.StoreMgr.lookup(me.store);
        }

        me.tabIndex = -1;

        Ext.form.Select.superclass.initComponent.call(me);

        me.addEvents(
            
            'select'
        );
    },

    onMaskTap: function() {
        if (this.disabled) {
            return;
        }
        
        var me = this;
        
        if (Ext.is.Phone) {
            me.picker = new Ext.Picker({
                slots: [{
                    align       : 'center',
                    name        : me.name,
                    valueField  : me.valueField,
                    displayField: me.displayField,
                    value       : me.getValue(),
                    store       : me.store
                }],
                listeners: {
                    change: me.onPickerChange,
                    hide  : me.onPickerHide,
                    scope : me
                }
            });

            me.picker.show();
        }
        else {
            me.list = new Ext.List({
                store: me.store,
                tpl  : [
                    '<tpl for=".">',
                        '<div class="x-list-item">',
                            '<span class="x-list-label">{' + me.displayField + '}</span>',
                            '<span class="x-list-selected"></span>',
                        '</div>',
                    '</tpl>'
                ],
                cls             : 'x-select-overlay',
                itemSelector    : '.x-list-item',
                floating        : true,
                stopMaskTapEvent: true,
                hideOnMaskTap   : true,
                singleSelect    : true,
                
                listeners: {
                    selectionchange: me.onListSelect,
                    scope          : me
                }
            });
            
            me.list.showBy(me.el, 'fade', false);
            var index = me.store.find(me.valueField, me.value);
            me.list.select(index != -1 ? index : 0, false, true);
        }
    },

    onListSelect : function(list, node, records) {
        var me       = this,
            selected = records[0];
        
        if (selected) {
            me.setValue(selected.get(me.valueField));
            me.fireEvent('select', me, me.getValue());
        }
        
        me.list.hide({
            type: 'fade',
            out: true,
            after: function() {
                me.list.destroy();
            },
            scope: me
        });
    },

    onPickerChange : function(picker, value) {
        var me = this;
        me.setValue(value[me.name]);
        me.fireEvent('select', me, me.getValue());
    },

    onPickerHide : function() {
        this.picker.destroy();
    },

    getValue : function() {
        return this.value;
    },

    initValue : function() {
        var me = this;
        me.setValue(me.value);
        me.originalValue = me.getValue();
    },

    setValue : function(v) {
        var me     = this,
            record = v ? me.store.findRecord(me.valueField, v) : me.store.getAt(0);

        if (record && me.rendered) {
            me.fieldEl.dom.value = me.prependText + ' ' + record.get(me.displayField);
            me.value = record.get(me.valueField);
        } else {
            me.value = v;
        }

        return me;
    },

    
    setOptions : function(options, append) {
        var me = this;
        if (!options) {
            me.store.clearData();
            me.setValue(null);
        }
        else {
            me.store.loadData(options, append);
        }
    }
});

Ext.reg('select', Ext.form.Select);


Ext.form.TextArea = Ext.extend(Ext.form.TextField, {
    maskField: Ext.is.iOS,
    
    
    maxRows  : undefined,
    
    autoCapitalize : false,
    
    renderTpl: [
        '<tpl if="label"><label <tpl if="fieldEl">for="{inputId}"</tpl> class="x-form-label"><span>{label}</span></label></tpl>',
        '<tpl if="fieldEl"><textarea id="{inputId}" type="{type}" name="{name}" class="{fieldCls}"',
            '<tpl if="tabIndex">tabIndex="{tabIndex}" </tpl>',
            '<tpl if="placeHolder">placeholder="{placeHolder}" </tpl>',
            '<tpl if="style">style="{style}" </tpl>',
            '<tpl if="maxRows != undefined">rows="{maxRows}" </tpl>',
            '<tpl if="maxlength">maxlength="{maxlength}" </tpl>',
            '<tpl if="autoComplete">autocomplete="{autoComplete}" </tpl>',
            '<tpl if="autoCapitalize">autocapitalize="{autoCapitalize}" </tpl>',
            '<tpl if="autoFocus">autofocus="{autoFocus}" </tpl>',
        '></textarea></tpl>',
        '<tpl if="showClear"><div class="x-field-clear x-hidden-display"></div></tpl>',
        '<tpl if="maskField"><div class="x-field-mask"></div></tpl>'
    ],
    
    ui: 'textarea',
    
    
    onRender : function(ct, position) {
        this.renderData.maxRows = this.maxRows;
        Ext.form.TextArea.superclass.onRender.call(this, ct, position);
    }
});

Ext.reg('textarea', Ext.form.TextArea);


Ext.form.DatePickerField = Ext.extend(Ext.form.Field, {
    ui: 'select',
    
    
    datePickerConfig: null,
    
    
    maskField: true,
    
    
    
    
    initComponent: function() {
        this.tabIndex = -1;
        
        Ext.form.DatePickerField.superclass.initComponent.apply(this, arguments);
    },
    
    
    onMaskTap: function() {
        var me     = this,
            config = Ext.apply(me.datePickerConfig || {}, {
            value: me.value || null,
            
            listeners: {
                scope : me,
                change: me.onPickerChange,
                hide  : me.onPickerHide
            }
        });
        
        me.datePicker = new Ext.DatePicker(config);
        me.datePicker.show();
    },
    
    
    onPickerChange : function(picker, value) {
        var me = this;
        
        me.setValue(value);
        me.fireEvent('select', me, me.getValue());
    },
    
    
    onPickerHide : function() {
        this.datePicker.destroy();
    },

    
    setValue: function(value) {
        var me = this;
        
        if (Ext.isDate(value)) {
            me.value = value;
        } else if (Ext.isObject(value)) {
            me.value = new Date(value.year, value.month - 1, value.day);
        } else {
            me.value = null;
        }
        
        if (me.rendered) {
            me.fieldEl.dom.value = value ? me.getValue(true) : null;
        }
        
        return me;
    },
    
    
    getValue: function(format) {
        var value = this.value || null;
        return (format && Ext.isDate(value)) ? value.format(Ext.util.Format.defaultDateFormat) : value;
    },
    
    
    onDestroy: function() {
        if (this.datePicker) this.datePicker.destroy();
        Ext.form.DatePickerField.superclass.onDestroy.call(this);
    }
});

Ext.reg('datepickerfield', Ext.form.DatePickerField);


Ext.layout.LayoutManager = new Ext.AbstractManager({
    
    create : function(config, defaultType) {
        if (!config) {
            config = defaultType;
        }
        if (Ext.isString(config)) {
            return new this.types[config || defaultType];
        }
        else if (Ext.isObject(config)) {
            if (config.isLayout) {
                return config;
            }
            else {
                return new this.types[config.type || defaultType](config);
            }
        }
    }
});


Ext.regLayout = function() {
    return Ext.layout.LayoutManager.registerType.apply(Ext.layout.LayoutManager, arguments);
};


Ext.layout.Layout = Ext.extend(Object, {
    type: 'layout',
    isLayout: true,
    initialized: false,

    constructor : function(config) {
        this.id = Ext.id(null, 'ext-layout-');
        Ext.apply(this, config);
    },

    
    layout : function() {
        var me = this;
        me.layoutBusy = true;
        me.initLayout();

        if (me.beforeLayout.apply(me, arguments) !== false) {
            me.onLayout.apply(me, arguments);
            me.afterLayout();
            me.owner.needsLayout = false;
            me.layoutBusy = false;
        }
    },

    beforeLayout : function() {
        this.renderItems(this.getLayoutItems(), this.getTarget());
        return true;
    },

    
    renderItems : function(items, target) {
        var ln = items.length,
            i = 0,
            item;

        for (; i < ln; i++) {
            item = items[i];
            if (item && !item.rendered) {
                this.renderItem(item, i, target);
            }
            else if (!this.isValidParent(item, target)) {
                this.moveItem(item, i, target);
            }
        }
    },

    
    renderItem : function(item, position, target) {
        if (!item.rendered) {
            item.render(target, position);
            this.configureItem(item, position);
            this.childrenChanged = true;
        }
    },

    
    moveItem : function(item, position, target) {
        if (typeof position == 'number') {
            position = target.dom.childNodes[position];
        }
        
        target = target.dom || target;
        target.insertBefore(item.el.dom, position || null);
        item.container = target;
        this.configureItem(item, position);
        this.childrenChanged = true;
    },

    
    initLayout : function() {
        if (!this.initialized && !Ext.isEmpty(this.targetCls)) {
            this.getTarget().addClass(this.targetCls);
        }
        this.initialized = true;
    },

    
    setOwner : function(owner) {
        this.owner = owner;
    },

    
    getLayoutItems : function() {
        return [];
    },

    
    isValidParent : function(item, target) {
        var dom = item.el ? item.el.dom : Ext.getDom(item);
        return target && (dom.parentNode == (target.dom || target));
    },

    
    configureItem: function(item, position) {
        if (this.extraCls) {
            item.el.addClass(this.extraCls);
        }
    },
    
    
    onLayout : Ext.emptyFn,
    afterLayout : Ext.emptyFn,
    onRemove : Ext.emptyFn,
    onDestroy : Ext.emptyFn,

    
    afterRemove : function(item) {
        if (this.extraCls && item.rendered) {
            item.el.removeClass(this.extraCls);
        }
    },

    
    destroy : function() {
        if (!Ext.isEmpty(this.targetCls)) {
            var target = this.getTarget();
            if (target) {
                target.removeClass(this.targetCls);
            }
        }
        this.onDestroy();
    }
});

Ext.layout.ComponentLayout = Ext.extend(Ext.layout.Layout, {
    type: 'component',

    monitorChildren: true,

    beforeLayout : function(width, height) {
        Ext.layout.ComponentLayout.superclass.beforeLayout.call(this);
        var owner = this.owner,
            isVisible = owner.isVisible(),
            layoutCollection;
        
        if (!isVisible && owner.hiddenOwnerCt) {
            layoutCollection = owner.hiddenOwnerCt.layoutOnShow;
            layoutCollection.remove(owner);
            layoutCollection.add(owner);
            owner.needsLayout = {
                width: width,
                height: height,
                isSetSize: false
            };
        }

        return isVisible && this.needsLayout(width, height);
    },

    
    needsLayout : function(width, height) {
        this.lastComponentSize = this.lastComponentSize || {
            width: -Infinity,
            height: -Infinity
        };

        var childrenChanged = this.childrenChanged;
        this.childrenChanged = false;

        return (childrenChanged || this.lastComponentSize.width !== width || this.lastComponentSize.height !== height);
    },

    
    setElementSize: function(el, width, height) {
        if (width !== undefined && height !== undefined) {
            el.setSize(width, height);
        }
        else if (height !== undefined) {
            el.setHeight(height);
        }
        else if (width !== undefined) {
            el.setWidth(width);
        }
    },

    
    getTarget : function() {
        return this.owner.el;
    },

    
    setTargetSize : function(width, height) {
        this.setElementSize(this.owner.el, width, height);
        this.lastComponentSize = {
            width: width,
            height: height
        };
    },

    afterLayout : function() {
        var owner = this.owner,
            layout = owner.layout,
            ownerCt = owner.ownerCt,
            ownerCtSize, activeSize, ownerSize, width, height;

        owner.afterComponentLayout(this);

        
        if (layout && layout.isLayout) {
            layout.layout();
        }

        
        if (ownerCt && ownerCt.componentLayout && ownerCt.componentLayout.monitorChildren && !ownerCt.componentLayout.layoutBusy) {
            ownerCt.componentLayout.childrenChanged = true;

            
            if (ownerCt.layout && !ownerCt.layout.layoutBusy) {
                if (ownerCt.layout.type == 'autocontainer') {
                    ownerCt.doComponentLayout(width, height);
                }
                else {
                    ownerCt.layout.layout();
                }
            }
        }
    }
});


Ext.layout.AutoComponentLayout = Ext.extend(Ext.layout.ComponentLayout, {
    type: 'autocomponent',

    onLayout : function(width, height) {
        this.setTargetSize(width, height);
    }
});

Ext.regLayout('autocomponent', Ext.layout.AutoComponentLayout);


Ext.layout.DockLayout = Ext.extend(Ext.layout.ComponentLayout, {
    type: 'dock',

    
    extraCls: 'x-docked',

    
    onLayout: function(width, height) {
        
        var me = this,
            owner = me.owner,
            ownerCt = owner.ownerCt,
            layout = owner.layout,
            collapsed = owner.collapsed,
            contracted = owner.contracted,
            expanded = owner.expanded,
            headerItem = me.headerItem,
            target = me.getTarget(),
            autoWidth = false,
            autoHeight = false,
            animTo;

        
        var info = me.info = {
            boxes: [],
            size: {
                width: width,
                height: height
            },
            padding: {
                top: target.getPadding('t'),
                right: target.getPadding('r'),
                bottom: target.getPadding('b'),
                left: target.getPadding('l')
            },
            border: {
                top: target.getBorderWidth('t'),
                right: target.getBorderWidth('r'),
                bottom: target.getBorderWidth('b'),
                left: target.getBorderWidth('l')
            },
            bodyBox: {}
        };

        
        if (height === undefined || height === null || width === undefined || width === null || contracted) {
            if ((height === undefined && width === undefined) && (ownerCt && ownerCt.layout && (ownerCt.layout.type != 'autocontainer' && ownerCt.layout.type != 'box'))) {
            }
            else {
                
                if ((height === undefined || height === null) && (width === undefined || width === null)) {
                    autoHeight = true;
                    autoWidth = true;
                    if (!owner.animCollapse || (!expanded && !contracted)) {
                        me.setTargetSize(null, null);
                    }
                    me.updateBodyBox({width: null, height: null});
                }
                
                else if (height === undefined || height === null) {
                    autoHeight = true;
                    
                    if (!owner.animCollapse || (!expanded && !contracted)) {
                        me.setTargetSize(width, null);
                    }
                    me.updateBodyBox({width: width, height: null});
                
                }
                else {
                    autoWidth = true;
                    
                    if (!owner.animCollapse || (!expanded && !contracted)) {
                        me.setTargetSize(null, height);
                    }
                    me.updateBodyBox({width: null, height: height});
                }

                
                if (!collapsed && layout && layout.isLayout) {
                    layout.layout();
                }

                
                
                
                
                
                me.dockItems(autoWidth, autoHeight);
                if (collapsed) {
                    if (headerItem) {
                        if (headerItem.dock == 'top' || headerItem.dock == 'bottom') {
                            info.size.height = headerItem.getHeight();
                        }
                        else {
                            info.size.width = headerItem.getWidths();
                        }
                    } else {
                        info.size.height = 0;
                    }
                }
                if (expanded || contracted) {
                    if (owner.animCollapse) {
                        Ext.createDelegate(owner.animCollapseFn, owner, [info.size.width, info.size.height])();
                    }
                    else {
                        Ext.createDelegate(owner['after' + expanded ? 'Expand' : 'Collapse'], owner)();
                        me.setTargetSize(info.size.width, info.size.height);
                    }
                }
                else {
                    me.setTargetSize(info.size.width, info.size.height);
                }
            }
        }
        else {
            
            
            
            if (expanded || contracted) {
                if (owner.animCollapse) {
                    Ext.createDelegate(owner.animCollapseFn, owner, [width, height])();
                }
                else {
                    Ext.createDelegate(owner['after' + expanded ? 'Expand' : 'Collapse'], owner)();
                    me.setTargetSize(width, height);
                }
            }
            else {
                me.setTargetSize(width, height);
                me.dockItems();
            }
        }
        Ext.layout.DockLayout.superclass.onLayout.call(me, width, height);
    },

    afterLayout : function() {
        Ext.layout.DockLayout.superclass.afterLayout.call(this);
    },

    
    dockItems : function(autoWidth, autoHeight) {
        this.calculateDockBoxes(autoWidth, autoHeight);

        
        
        
        var info = this.info,
            collapsed = this.owner.collapsed,
            boxes = info.boxes,
            ln = boxes.length,
            dock, i;

        
        
        for (i = 0; i < ln; i++) {
            dock = boxes[i];
            if (collapsed === true && !dock.isHeader) {
                continue;
            }
            dock.item.setPosition(dock.x, dock.y);
        }

        
        
        if (autoWidth) {
            info.bodyBox.width = null;
        }
        if (autoHeight) {
            info.bodyBox.height = null;
        }
        this.updateBodyBox(info.bodyBox);
    },

    
    calculateDockBoxes : function(autoWidth, autoHeight) {
        
        
        
        var me = this,
            target = me.getTarget(),
            items = me.getLayoutItems(),
            owner = me.owner,
            contracted = owner.contracted,
            expanded = owner.expanded,
            bodyEl = owner.body,
            info = me.info,
            size = info.size,
            ln = items.length,
            padding = info.padding,
            border = info.border,
            item, i, box, w, h, itemEl, vis;

        
        
        if (autoHeight) {
            size.height = bodyEl.getHeight() + padding.top + border.top + padding.bottom + border.bottom;
        }
        else {
            size.height = target.getHeight();
        }
        
        if (autoWidth) {
            size.width = bodyEl.getWidth() + padding.left + border.left + padding.right + border.right;
        }
        else {
            size.width = target.getWidth();
        }

        info.bodyBox = {
            x: border.left + padding.left,
            y: border.top + padding.top,
            width: size.width - padding.left - border.left - padding.right - border.right,
            height: size.height - border.top - padding.top - border.bottom - padding.bottom
        };

        
        for (i = 0; i < ln; i++) {
            item = items[i];
            if (item.isHeader) {
                me.headerItem = item;
            }
            
            
            
            box = me.initBox(item);

            if (autoHeight === true) {
                box = me.adjustAutoBox(box, i);
            }
            else {
                box = me.adjustSizedBox(box, i);
            }

            
            
            
            info.boxes.push(box);
        }
    },

    
    adjustSizedBox : function(box, index) {
        var bodyBox = this.info.bodyBox;
        switch (box.type) {
            case 'top':
                box.y = bodyBox.y;
                break;

            case 'left':
                box.x = bodyBox.x;
                break;

            case 'bottom':
                box.y = (bodyBox.y + bodyBox.height) - box.height;
                break;

            case 'right':
                box.x = (bodyBox.x + bodyBox.width) - box.width;
                break;
        }

        
        if (!box.overlay) {
            switch (box.type) {
                case 'top':
                    bodyBox.y += box.height;
                    bodyBox.height -= box.height;
                    break;

                case 'left':
                    bodyBox.x += box.width;
                    bodyBox.width -= box.width;
                    break;

                case 'bottom':
                    bodyBox.height -= box.height;
                    break;

                case 'right':
                    bodyBox.width -= box.width;
                    break;
            }
        }
        return box;
    },

    
    adjustAutoBox : function (box, index) {
        var info = this.info,
            bodyBox = info.bodyBox,
            size = info.size,
            boxes = info.boxes,
            pos = box.type,
            i, adjustBox;

        if (pos == 'top' || pos == 'bottom') {
            
            for (i = 0; i < index; i++) {
                adjustBox = boxes[i];
                if (adjustBox.stretched && adjustBox.type == 'left' || adjustBox.type == 'right') {
                    adjustBox.height += box.height;
                }
                else if (adjustBox.type == 'bottom') {
                    adjustBox.y += box.height;
                }
            }
        }

        switch (pos) {
            case 'top':
                box.y = bodyBox.y;
                if (!box.overlay) {
                    bodyBox.y += box.height;
                }
                size.height += box.height;
                break;

            case 'bottom':
                box.y = (bodyBox.y + bodyBox.height);
                size.height += box.height;
                break;

            case 'left':
                box.x = bodyBox.x;
                if (!box.overlay) {
                    bodyBox.x += box.width;
                    bodyBox.width -= box.width;
                }
                break;

            case 'right':
                if (!box.overlay) {
                    bodyBox.width -= box.width;
                }
                box.x = (bodyBox.x + bodyBox.width);
                break;
        }
        return box;
    },

    
    initBox : function(item) {
        var bodyBox = this.info.bodyBox,
            horizontal = (item.dock == 'top' || item.dock == 'bottom'),
            box = {
                item: item,
                overlay: item.overlay,
                type: item.dock
            };
        
        if (item.stretch !== false) {
            box.stretched = true;
            if (horizontal) {
                box.x = bodyBox.x;
                box.width = bodyBox.width;
                item.doComponentLayout(box.width - item.el.getMargin('lr'));
            }
            else {
                box.y = bodyBox.y;
                box.height = bodyBox.height;
                item.doComponentLayout(undefined, box.height - item.el.getMargin('tb'));
            }
        }
        else {
            item.doComponentLayout();
            box.width = item.getWidth();
            box.height = item.getHeight();
            if (horizontal) {
                box.x = (item.align == 'right') ? bodyBox.width - box.width : bodyBox.x;
            }
        }

        
        
        if (box.width == undefined) {
            box.width = item.getWidth() + item.el.getMargin('lr');
        }
        if (box.height == undefined) {
            box.height = item.getHeight() + item.el.getMargin('tb');
        }

        return box;
    },

    
    getLayoutItems : function() {
        return this.owner.getDockedItems();
    },

    
    updateBodyBox : function(box) {
        var me = this,
            owner = me.owner,
            body = me.owner.body,
            info = me.info,
            contracted = owner.contracted,
            expanded = owner.expanded,
            padding = info.padding,
            border = info.border,
            vis;

        if (Ext.isNumber(box.width)) {
            box.width -= body.getMargin('lr');
        }
        if (Ext.isNumber(box.height)) {
            box.height -= body.getMargin('tb');
        }

        me.setElementSize(body, box.width, box.height);
        body.setLeft(box.x - padding.left - border.left);
        body.setTop(box.y - padding.top - border.top);
    },

    
    configureItem : function(item, pos) {
        Ext.layout.DockLayout.superclass.configureItem.call(this, item, pos);

        var el = item.el || Ext.get(item);
        if (this.extraCls) {
            el.addClass(this.extraCls + '-' + item.dock);
        }
    },

    afterRemove : function(item) {
        Ext.layout.DockLayout.superclass.afterRemove.call(this, item);
        if (this.extraCls) {
            item.el.removeClass(this.extraCls + '-' + item.dock);
        }
        var dom = item.el.dom;
        
        if (dom) {
            dom.parentNode.removeChild(dom);
        }
        
        this.childrenChanged = true;
    }
});

Ext.regLayout('dock', Ext.layout.DockLayout);

Ext.layout.FieldLayout = Ext.extend(Ext.layout.ComponentLayout, {
    type: 'field',

    
    onLayout: function(width, height) {
        Ext.layout.FieldLayout.superclass.onLayout.call(this, owner, target);

        this.setTargetSize(width, height);
        
    },

    
    handleLabel : function() {
        this.owner.labelEl.setWidth(this.owner.labelWidth);
    }
});

Ext.regLayout('field', Ext.layout.FieldLayout);


Ext.layout.ContainerLayout = Ext.extend(Ext.layout.Layout, {
    type: 'container',
        
    
     
    
    getLayoutItems : function() {
        return this.owner && this.owner.items && this.owner.items.items || [];
    },
    
    afterLayout : function() {
        this.owner.afterLayout(this);
    },    
    
    getTarget : function() {
        return this.owner.getTargetEl();
    }
});


Ext.layout.AutoContainerLayout = Ext.extend(Ext.layout.ContainerLayout, {
    type: 'autocontainer',

    
    onLayout : function(owner, target) {
        var items = this.getLayoutItems(),
            ln = items.length, i;
        for (i = 0; i < ln; i++) {
            items[i].doComponentLayout();
        }
    }
});

Ext.regLayout('auto', Ext.layout.AutoContainerLayout);
Ext.regLayout('autocontainer', Ext.layout.AutoContainerLayout);

Ext.layout.FitLayout = Ext.extend(Ext.layout.ContainerLayout, {
    extraCls: 'x-fit-item',
    targetCls: 'x-layout-fit',
    type: 'fit',
    
    
    onLayout : function() {
        Ext.layout.FitLayout.superclass.onLayout.call(this);

        if (this.owner.items.length) {
            var box = this.getTargetBox(),
                item = this.owner.items.get(0);
            
            this.setItemBox(item, box);
            item.cancelAutoSize = true;
        }
    },

    getTargetBox : function() {
        var target = this.getTarget(),
            size = target.getSize(),
            padding = {
                left: target.getPadding('l'),
                right: target.getPadding('r'),
                top: target.getPadding('t'),
                bottom: target.getPadding('b')
            }, 
            border = {
                left: target.getBorderWidth('l'),
                right: target.getBorderWidth('r'),
                top: target.getBorderWidth('t'),
                bottom: target.getBorderWidth('b')
            };
            
        return {
            width: size.width- padding.left - padding.right - border.left - border.right,
            height: size.height - padding.top - padding.bottom - border.top - border.bottom,
            x: padding.left + border.left,
            y: padding.top + border.top
        };        
    },
    
    
    setItemBox : function(item, box) {
        if (item && box.height > 0) {
            
            box.width = null;
            box.height -= item.el.getMargin('tb');
            item.setCalculatedSize(box);
            item.setPosition(box);
        }
    }
});

Ext.regLayout('fit', Ext.layout.FitLayout);



Ext.layout.CardLayout = Ext.extend(Ext.layout.FitLayout, {
    type: 'card',

    sizeAllCards: false,
    hideInactive: true,

    beforeLayout: function() {
        this.activeItem = this.getActiveItem();
        return Ext.layout.CardLayout.superclass.beforeLayout.apply(this, arguments);
    },

    onLayout: function() {
        Ext.layout.FitLayout.superclass.onLayout.apply(this, arguments);

        var activeItem = this.activeItem,
            items = this.getLayoutItems(),
            ln = items.length,
            targetBox = this.getTargetBox(),
            i,
            item;

        for (i = 0; i < ln; i++) {
            item = items[i];
            this.setItemBox(item, targetBox);
        }

        if (!this.firstActivated && activeItem) {
            if (activeItem.fireEvent('beforeactivate', activeItem) !== false) {
                activeItem.fireEvent('activate', activeItem);
            }
            this.firstActivated = true;
        }
    },

    
    getActiveItem: function() {
        if (!this.activeItem && this.owner) {
            this.activeItem = this.parseActiveItem(this.owner.activeItem);
        }

        if (this.activeItem && this.owner.items.items.indexOf(this.activeItem) != -1) {
            return this.activeItem;
        }

        return null;
    },

    
    parseActiveItem: function(item) {
        if (item && item.isComponent) {
            return item;
        }
        else if (typeof item == 'number' || item == undefined) {
            return this.getLayoutItems()[item || 0];
        }
        else {
            return this.owner.getComponent(item);
        }
    },

    
    configureItem: function(item, position) {
        Ext.layout.FitLayout.superclass.configureItem.call(this, item, position);
        if (this.hideInactive && this.activeItem !== item) {
            item.hide();
        }
        else {
            item.show();
        }
    },

    onRemove: function(component) {
        if (component === this.activeItem) {
            this.activeItem = null;
            if (this.owner.items.getCount() == 0) {
                this.firstActivated = false;
            }
        }
    },

    
    getAnimation: function(newCard, owner) {
        var newAnim = (newCard || {}).animation;
        if (newAnim === false) {
            return false;
        }
        return newAnim || owner.animation;
    },

    
    setActiveItem: function(newCard, animation) {
        var me = this,
            owner = me.owner,
            doc = Ext.getDoc(),
            oldCard = me.activeItem,
            newIndex;
        
        animation = (animation == undefined) ? this.getAnimation(newCard, owner) : animation;

        newCard = me.parseActiveItem(newCard);
        newIndex = owner.items.indexOf(newCard);


        
        if (newIndex == -1) {
            owner.add(newCard);
        }

        
        if (newCard && oldCard != newCard && owner.onBeforeCardSwitch(newCard, oldCard, newIndex, !!animation) !== false) {
            
            if (!newCard.rendered) {
                this.layout();
            }

            
            if (newCard.fireEvent('beforeactivate', newCard, oldCard) === false) {
                return false;
            }
            if (oldCard && oldCard.fireEvent('beforedeactivate', oldCard, newCard) === false) {
                return false;
            }
                        
            
            if (newCard.hidden) {
                newCard.show();
            }

            me.activeItem = newCard;

            if (animation) {
                doc.on('click', Ext.emptyFn, me, {
                    single: true,
                    preventDefault: true
                });

                Ext.Anim.run(newCard, animation, {
                    out: false,
                    autoClear: true,
                    scope: me,
                    after: function() {
                        Ext.defer(function() {
                            doc.un('click', Ext.emptyFn, me);
                        },
                        50, me);

                        newCard.fireEvent('activate', newCard, oldCard);

                        if (!oldCard) {
                            
                            
                            owner.onCardSwitch(newCard, oldCard, newIndex, true);
                        }
                    }
                });

                if (oldCard) {
                    Ext.Anim.run(oldCard, animation, {
                        out: true,
                        autoClear: true,
                        scope: me,
                        after: function() {
                            oldCard.fireEvent('deactivate', oldCard, newCard);
                            if (me.hideInactive && me.activeItem != oldCard) {
                                oldCard.hide();
                            }

                            
                            
                            
                            owner.onCardSwitch(newCard, oldCard, newIndex, true);
                        }
                    });
                }
            }
            else {
                newCard.fireEvent('activate', newCard, oldCard);
                if (oldCard) {
                    oldCard.fireEvent('deactivate', oldCard, newCard);
                    if (me.hideInactive) {
                        oldCard.hide();
                    }
                }
                owner.onCardSwitch(newCard, oldCard, newIndex, false);
            }

            return newCard;
        }

        return false;
    },

    
    getNext: function(wrap) {
        var items = this.getLayoutItems(),
            index = items.indexOf(this.activeItem);
        return items[index + 1] || (wrap ? items[0] : false);
    },

    
    next: function(anim, wrap) {
        return this.setActiveItem(this.getNext(wrap), anim);
    },

    
    getPrev: function(wrap) {
        var items = this.getLayoutItems(),
            index = items.indexOf(this.activeItem);
        return items[index - 1] || (wrap ? items[items.length - 1] : false);
    },

    
    prev: function(anim, wrap) {
        return this.setActiveItem(this.getPrev(wrap), anim);
    }
});

Ext.regLayout('card', Ext.layout.CardLayout);

Ext.layout.BoxLayout = Ext.extend(Ext.layout.ContainerLayout, {
    type: 'box',

    targetCls: 'x-layout-box',
    
    innerCls: 'x-layout-box-inner',

    
    pack : 'start',
    align: 'center',
    
    
    direction: 'normal',

    
    onLayout: function() {
        Ext.layout.BoxLayout.superclass.onLayout.call(this);
        
        if (this.pack === 'left' || this.pack === 'top') {
            this.pack = 'start';
        } else if (this.pack === 'right' || this.pack === 'bottom') {
            this.pack = 'end';
        }

        var target = this.getTarget(),
            ct = target.parent(),
            targetWidth = (ct.getWidth() - ct.getPadding('lr') - ct.getBorderWidth('lr')) + 'px',
            targetHeight = (ct.getHeight() - ct.getPadding('tb') - ct.getBorderWidth('tb')) + 'px';
            
        target.setStyle({
            '-webkit-box-orient': this.orientation,
            '-webkit-box-direction': this.direction,
            '-webkit-box-pack': this.pack,
            '-webkit-box-align': this.align
        });
        
        if (this.orientation == 'horizontal') {
            target.setStyle({
                'min-width': targetWidth,
                'height': targetHeight
            });
        } else {
            target.setStyle({
                'min-height': targetHeight,
                'width': targetWidth
            });
        }

        this.prepareFlexedItems();
        this.setFlexedItems();
    },
    
    prepareFlexedItems : function() {        
        var items = this.getLayoutItems(),
            ln = items.length,
            item, i;

        for (i = 0; i < ln; i++) {
            item = items[i];
            if (item.flex != undefined) {
                item.el.setStyle('position', 'absolute');
                item.boxEl = this.createBoxEl(item);
            } else {
                item.doComponentLayout();
            }
        }
    },    
        
    setFlexedItems : function() {
        var items = this.getLayoutItems(),
            ln = items.length,
            item, i;
            
        for (i = 0; i < ln; i++) {
            item = items[i];
            if (item.flex != undefined) {
                item.boxSize = item.boxEl.getSize();
            }
        }

        for (i = 0; i < ln; i++) {
            item = items[i];
            if (item.flex != undefined) {
                item.el.setStyle('position', '');
                if (this.align == 'stretch') {
                    item.setSize(item.boxSize);
                } else {
                    if (this.orientation == 'horizontal') {
                        item.setWidth(item.boxSize.width);
                    } else {
                        item.setHeight(item.boxSize.height);
                    }
                }                
                item.boxEl.remove();
                delete item.boxEl;
                delete item.boxSize;
            }
        }
    },
    
    getTarget : function() {
        var owner = this.owner,
            innerCt = this.innerCt;
        
        if (!innerCt) {
            if (owner.scrollEl) {
                innerCt = owner.scrollEl.addClass(this.innerCls);
            } else {
                innerCt = owner.getTargetEl().createChild({cls: this.innerCls});
            }
            this.innerCt = innerCt;
        }

        return innerCt;
    },
    
    createBoxEl : function(item) {
        var el = item.el;
        return el.insertSibling({
            style: 'margin-top: ' + el.getMargin('tb') + 'px; margin-left: ' + el.getMargin('lr') + 'px; -webkit-box-flex: ' + item.flex
        });
    }
});


Ext.layout.HBoxLayout = Ext.extend(Ext.layout.BoxLayout, {
    orientation: 'horizontal',
    
    
    
    
});

Ext.regLayout('hbox', Ext.layout.HBoxLayout);


Ext.layout.VBoxLayout = Ext.extend(Ext.layout.BoxLayout, {
    orientation: 'vertical'
    
    
    
    
    
});

Ext.regLayout('vbox', Ext.layout.VBoxLayout);


