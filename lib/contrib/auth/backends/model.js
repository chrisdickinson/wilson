var BaseBackend = require('./base').BaseBackend,
    utils = require('../utils');

exports.AuthModelBackend = BaseBackend.extend('AuthModelBackend', {
    'get_user':function(appInstance, user_id, callback) {
        var User = appInstance.models.User;
        User.objects.filter({pk:user_id}).all(function(objects, err) {
            if(!err && objects.length > 0) {
                callback(objects[0]);
            } else {
                callback();
            }
        });
    },
    'authenticate':function(appInstance, credentials, callback) {
        var User = appInstance.models.User,
            username = credentials.username,
            password = credentials.password;
            hashed = utils.get_hexdigest(password);
        User.objects.filter({username:username, password:hashed}).all(function(objects, err) {
            if(!err && objects.length > 0) {
                callback(objects[0]);
            } else {
                callback();
            }
        });
    }
});
