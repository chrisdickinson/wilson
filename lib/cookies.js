var Morsel = function(key, value) {
    this.key = key;
    this.value = value;
    this.attrs = {};
    for(var name in arguments.callee.RESERVED) {
        this.attrs[name] = "";
    }
};

Morsel.RESERVED = { 
    'expires':'expires'
,   'path':'Path'
,   'comment':'Comment'
,   'domain':'Domain'
,   'max-age':'Max-Age'
,   'secure':'secure'
,   'httponly':'httponly'
,   'version':'version'
};

Morsel.prototype = {
    'setValue':function(value) {
        this.value = value;
    },
    'setAttribute':function(key, value) {
        if(Morsel.RESERVED[key]) {
            this.attrs[key] = value;
        } else {
            throw new Error("Invalid cookie attribute key - "+key);
        }
    },
    'getAsHeader':function() {
        var output = [],
            items = [];
        output.push([this.key, this.value].join('='));
        for(var name in this.attrs) {
            items.push(name);
        }
        items = items.sort();
        for(var i = 0, len = items.length; i < len; ++i) {
            var key = items[i],
                value = this.attrs[key];
            if(value === '' || Morsel.RESERVED[key] === undefined) {
                continue;
            } else if(key === 'expires') {
                if(!(value instanceof Date)) {
                    value = new Date(value);
                }
                output.push([Morsel.RESERVED[key], String(value)].join('='));
            } else if(key === 'max-age') {
                output.push([Morsel.RESERVED[key], parseInt(value, 10)].join('='));
            } else if(key === 'secure' || key === 'httponly') {
                output.push(Morsel.RESERVED[key]);
            } else {
                output.push([Morsel.RESERVED[key], value].join('='));
            }
        }
        return output.join('; ');
    },
};

var COOKIE_PARSER = /([\w\d!#%&'~_`><@,:/\$\*\+\-\.\^\|\)\(\?\}\{\=]+?)\s*=\s*("(?:[^\\"]|\.)*"|[\w\d!#%&'~_`><@,:/\$\*\+\-\.\^\|\)\(\?\}\{\=]*)\s*;?/,
    parseCookieString = function(input) {
        var textInput = input ? String(input).slice() : '',
            match = null,
            outputDict = {},
            morsel = null;
        while(textInput.length > 0) {
            var hitSingleWord = false;
            match = COOKIE_PARSER(textInput);
            if(match === null) {
                var singleWords = /^\s*(httponly|secure)\s*;?/;    
                match = singleWords(textInput);
                hitSingleWord = true;
                if(match === null) {
                    break;
                }
            }

            var key = match[1],
                value = match[2];

            if(key.charAt(0) == '$' && morsel) {
                morsel.setAttribute(key.toLowerCase().slice(1), value); 
            } else if(Morsel.RESERVED[key.toLowerCase()] !== undefined) {
                morsel.setAttribute(key.toLowerCase(), hitSingleWord ? true : value);
            } else {
                outputDict[key] = new Morsel(key, value);
                morsel = outputDict[key];
            }
            textInput = textInput.slice(match.index + match[0].length);
        }
        return outputDict;
    };

var CookieManager = function(morsels) {
    morsels = morsels instanceof Object ? morsels : parseCookieString(morsels);
    this.morsels = morsels;
};

CookieManager.prototype.compile = function() {
    var output = [];
    for(var morsel_name in this.morsels) if (this.morsels.hasOwnProperty(morsel_name)) {
        output.push(this.morsels[morsel_name].getAsHeader());
    }
    return output.join('; ');
};

CookieManager.prototype.set = function(key, value, kwargs) {
    value = value === undefined ? 'null' : escape(JSON.stringify(value));
    var morsel = this.morsels[key];
    if(!morsel) {
        this.morsels[key] = new Morsel(key, value);
        morsel = this.morsels[key];
    }
    morsel.setValue(value);
    if(kwargs) {
        for(var name in kwargs) if(kwargs.hasOwnProperty(name)) {
            morsel.setAttribute(name, kwargs[name]);
        }
    }
};

CookieManager.prototype.get = function(key) {
    var value = this.morsels[key].value;
    if(value) {
        return JSON.parse(unescape(value));
    }
};

CookieManager.prototype.remove = function(key) {
    if(this.morsels[key]) {
        this.morsels[key].setAttribute('expires', new Date(new Date() - 1000000));
    }
};

exports.Morsel = Morsel;
exports.CookieManager = CookieManager;
