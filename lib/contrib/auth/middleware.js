var utils = require('./utils');

var request_get_user = function(from) {
    var users = this._users || {},
        target = from instanceof Object ? from.name : from;
    for(var appName in users) if(users.hasOwnProperty(appName)) {
        if(appName === target) {
            return users[appName];
        }
    }
    return new utils.AnonymousUser();
};

var request_add_user = function(from, user) {
    var target = from instanceof Object ? from.name : from;
    this._users[target] = user;
};

exports.AuthenticationMiddleware = {
    'processRequest':function(request) {
        if(request.add_user === undefined) {
            request.add_user = request_add_user;
            request.get_user = request_get_user;
            request._users = {};
        }

        var user_id = request.session.get(utils.get_session_key(this)),
            backend_name = request.session.get(utils.get_session_backend(this)),
            self = this;
        if(user_id !== undefined && backend_name !== undefined) {
            utils.get_user(self, backend_name, user_id, function(user) {
                request.add_user(self, user);
                request.attemptContinue();
            });
        } else {
            request.attemptContinue();
        }
    }
};
