var SESSION_KEY = 'user_id',
    SESSION_BACKEND = 'backend',
    REDIRECT_FIELD_NAME = 'next',
    get_session_variable = function(variable) {
        return function(instance) {
            return [instance.name, variable].join('.');
        }; 
    },
    get_session_key = get_session_variable(SESSION_KEY),
    get_session_backend = get_session_variable(SESSION_BACKEND);

var AnonymousUser = function() {
};

AnonymousUser.prototype.is_authenticated = function() {
    return false;
};

var get_user = function(appInstance, backend_name, user_id, callback) {
    var applicableBackends = appInstance.settings.backends.filter(function(item) {
        return item.name == backend_name;
    });
    if(applicableBackends.length > 0) {
        applicableBackends[0].get_user(appInstance, user_id, function(user) {
            callback(user);
        });
    } else {
        callback(new AnonymousUser());
    }
}; 

var authenticate = function(appInstance, credentials, callback) {
    var backendList = appInstance.settings.backends,
        quit = false,
        i = 0,
        len = backendList.length,
        recurse = function(user) {
            var callee = arguments.callee;
            if(user) {
                callback(backendList[i-1], user);
            } else {
                if(i === len) {
                    callback(new AnonymousUser());
                } else {
                    backendList[i++].authenticate(appInstance, credentials, callee);
                }
            }
        };
    recurse(null);
};

var get_hexdigest = function(password) {
    var crypto = require('crypto');
    return crypto.createHash('sha1').update(password).digest('hex');
};

exports.get_user = get_user;
exports.authenticate = authenticate;
exports.get_session_key = get_session_key;
exports.get_session_backend = get_session_backend;
exports.AnonymousUser = AnonymousUser;
exports.get_hexdigest = get_hexdigest;
