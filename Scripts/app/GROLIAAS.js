var GROLIAAS = {};
GROLIAAS.keys =
{
    MASTERLIST: "mlist",
    PRINCIPAL: "this",
    SESSIONID: "session",
};

GROLIAAS.ContextUtils = {
    isFirstVisit: function() {
        var tracker = localStorage.getItem(this.MASTERLIST);
        return !tracker;
    },
    sayWelcome: function() {
        $(".menuitem .icon-info").trigger("click");
    },
    formatPascalCase: function(val) {
        var parts = val.split(/\s+/);
        var res = [];
        for (var i = 0; i < parts.length; i++) {
            var word = parts[i].split(""),
                ch = word[0].charCodeAt(0);
            if (ch >= 97 && ch <= 122) {
                word[0] = String.fromCharCode((ch - 32));
            }
            res.push(word.join(""));

        }
        return res.join(" ");
    },
    toObject: function(items) {
        var res = {};
        if (!items.length) return null;
        for (var i = 0; i < items.length; i++) {
            res[$(items[i]).val().trim()] = true;
        }
        return res;
    }
},



GROLIAAS.define = function (klass, obj) {

    //create class template traversing namespaces
    var source = klass;
    var $ctor = obj.constructor || function () { };
    var nsNavigator = window;
    var ns = klass.split(".");
    var TYPE = ns[ns.length - 1];

    for (var i = 0; i < ns.length; i++) {
        if (ns[i] === TYPE) break;
        nsNavigator = nsNavigator[ns[i]];
        if (!nsNavigator) throw "namespace :`" + ns[i] + "` was not found";
    }

    //add .ctor
    nsNavigator[TYPE] = $ctor;
    klass = nsNavigator[TYPE];
    //extend if a class is passed
    if (obj.inherits) {
        var template = GROLIAAS.Activator.createInstanceOf(obj.inherits);
        klass.prototype = template.instance;
        klass.prototype.superClass = template.type;
        klass.prototype.constructor = klass;
    }
    //add non static methods
    for (var fn in obj) {
        if (fn !== "statics" && (typeof obj[fn] === "object" || typeof obj[fn] === "function")) {
            klass.prototype[fn] = obj[fn];
        }
    }

    // add reflection help
    klass.prototype.getTypeWithNS = function () { return source; };
    klass.prototype.getType = function () { return TYPE.toUpperCase(); };
    klass.prototype.getSuperType = function () { return obj.inherits ? obj.inherits : "undefined"; };
    //check for overrides
    if (obj.overrides) {
        for (var fn in obj.overrides) {
            if (klass.prototype[fn]) klass.prototype[fn] = obj[fn];
        }
    }

    //add statics
    if (obj.statics) {
        for (var st in obj.statics)
            klass[st] = obj.statics[st];
    }
    //add Type
    klass.$type = klass.prototype.getType();
    klass.$superType = obj.inherits;
};


GROLIAAS.define("GROLIAAS.Activator", {
    //todo 
    //edge = require('edge');
    constructor: function () { },
    statics: {
        //overload function( TYPE )
        //overload function( TYPE , args )
        createInstanceOf: function (TYPE, args) {
            var ns = TYPE.split(".");
            var nsNavigator = window;
            var TYPE = ns[ns.length - 1];

            for (var i = 0; i < ns.length; i++) {
                if (ns[i] === TYPE) break;
                nsNavigator = nsNavigator[ns[i]];
                if (!nsNavigator) throw "namespace :`" + ns[i] + "` was not found";
            }
            if (typeof nsNavigator[TYPE] !== "function") throw "Unable to create an instance of `TYPE`" + TYPE;

            return {
                instance: new nsNavigator[TYPE](args),
                type: nsNavigator[TYPE]
            };
        }
    }

});