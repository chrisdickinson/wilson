var settings = require('wilson/conf').settings,
    Buffer = require('buffer').Buffer,
    crypto = require('crypto');

var MAX_SESSION_KEY = 18446744073709551616;

var SessionStore = function(key, appInstance) {
    this._session_key = key;
    this.appInstance = appInstance;
    this.accessed = false;
    this.modified = false;
};

SessionStore.prototype.encode = function(data) {
    var pickled = JSON.stringify(data),
        md5 = crypto.createHash('md5').update(pickled + settings.SECRET_KEY).digest('hex'),
        result = new Buffer(pickled + md5, 'utf8').toString('base64');
    return result;
};

SessionStore.prototype.decode = function(data) {
    var encodedData = (new Buffer(data, 'base64')).toString('utf8'),
        pickled = encodedData.slice(0, -32),
        tamperCheck = encodedData.slice(-32),
        md5sum = crypto.createHash('md5').update(pickled + settings.SECRET_KEY).digest('hex');
    if(md5sum !== tamperCheck) {
        throw new Error("User tampered with session cookie.");
    } else {
        try {
            return JSON.parse(pickled);
        } catch(err) {
            return {};
        }
    }
};

var random = function(lower, upper) {
    return parseInt((Math.random() * (upper - lower)) + lower, 10);
};

SessionStore.prototype.getNewSessionKey = function() {
    return crypto.createHash('md5').update([
          random(0, MAX_SESSION_KEY)
        , parseInt(new Date())
        , settings.SECRET_KEY].join('')).digest('hex');
};

SessionStore.prototype.getSessionKey = function() {
    var sk = this._session_key ? this._session_key : this.getNewSessionKey();
    this._session_key = sk;
    return this._session_key;
};

SessionStore.prototype.setSessionKey = function(sk) {
    this._session_key = sk;    
};

SessionStore.prototype.get = function(key, def) {
    var returning = this._sessionCache[key];
    return returning === undefined ? def : returning;
};

SessionStore.prototype.set = function(key, value) {
    this.modified = true;
    this._sessionCache[key] = value;
};

SessionStore.prototype.getSession = function(callback, noLoad) {
    this.accessed = true;
    var sessionCache = this._sessionCache,
        self = this;
    if(sessionCache === undefined) {
        if(this._session_key === undefined || noLoad) {
            this._sessionCache = {};
            callback(this);
        } else {
            this.load(function(data) {
                self._sessionCache = data;
                callback(self);
            });
        }
    } else {
        callback(this);
    }
};

SessionStore.prototype.get_expiry_age = function() {
    var expiry = this.get('_session_expiry');
    if(!expiry) {
        return this.appInstance.settings.cookie_age;
    } else if(!isNaN(Date.parse(expiry))) {
        return Date.parse(expiry) - new Date();
    }
    return parseInt(expiry, 10);
};

SessionStore.prototype.get_expiry_date = function() {
    var expiry = this.get('_session_expiry');
    if(!expiry) {
        return new Date(Date.now() + this.appInstance.settings.cookie_age);
    } else if(!isNaN(Date.parse(expiry))) {
        return new Date(Date.parse(expiry));
    }
    return parseInt(expiry, 10) + new Date();
};

SessionStore.prototype.set_expiry_date = function(value) {
    if(value) {
        if(!(value instanceof Date)) {
            value = new Date((new Date()) + parseInt(value, 10));
        }
        this.set('_session_expiry', value);
    } else {
        this.erase('_session_expiry');
    }
};

SessionStore.prototype.cycleKey = function() {
    data = this._sessionCache;
    key = this.session_key;
    this.create(function(obj, err) {
        this._sessionCache = data;
        this.delete(function() {}, key);
    });
};

SessionStore.prototype.clear = function() {
    this._sessionCache = {};
    this.accessed = true;
    this.modified = true;
};

SessionStore.prototype.flush = function(cb) {
    this.clear();
    this.delete(function(){
        this.create(function(obj, err) {
            cb(err);
        });
    }); 
};

SessionStore.extend = function(proto) {
    var Store = function() {
        SessionStore.apply(this, Array.prototype.slice.call(arguments));
    };
    Store.prototype = {}; 
    for(var name in SessionStore.prototype) if(SessionStore.prototype.hasOwnProperty(name)) {
        var getter = SessionStore.prototype.__lookupGetter__(name),
            setter = SessionStore.prototype.__lookupSetter__(name);
        if(getter) {
            Store.prototype.__defineGetter__(name, getter);
        }
        if(setter) {
            Store.prototype.__defineSetter__(name, setter);
        }
        if(!getter) {
            Store.prototype[name] = SessionStore.prototype[name];
        }
    }
    for(var name in proto) if(proto.hasOwnProperty(name)) {
        var getter = proto.__lookupGetter__(name),
            setter = proto.__lookupSetter__(name);
        if(getter) {
            Store.prototype.__defineGetter__(name, getter);
        }
        if(setter) {
            Store.prototype.__defineSetter__(name, setter);
        }
        if(!getter) {
            Store.prototype[name] = proto[name];
        }
    }
    return Store;
};

SessionStore.prototype.patchVaryHeaders = function(response, headers) {
    var vary = response.headers['Vary'],
        existing = null,
        difference = [];
    vary = vary ? vary.split(/\s*,\s*/) : [];
    existing = vary.map(function(item) {
        return item.toLowerCase();
    });
    headers.forEach(function(item) {
        if(existing.indexOf(item.toLowerCase()) === -1) {
            difference.push(item);
        }
    });
    response.headers['Vary'] = existing.concat(headers).join(', ');
};

SessionStore.prototype.__defineGetter__('_session', SessionStore.prototype.getSession);
SessionStore.prototype.__defineGetter__('session_key', SessionStore.prototype.getSessionKey);
SessionStore.prototype.__defineSetter__('session_key', SessionStore.prototype.setSessionKey);

exports.SessionStore = SessionStore;
