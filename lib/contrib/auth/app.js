var application = require('../../application'),
    app = application.app,
    primary = application.primary,
    any = application.any,
    specific = application.specific,
    path = require('path'),
    fs = require('fs');

exports.app = app({
    'provides':'auth',  // a one-word description of what your app provides.
    'models':require('./models'),
    'urls':require('./urls').patterns,
    'external_apps':{
        'sessions':primary('sessions'),
    },
    'middleware':{
        'AuthenticationMiddleware':require('./middleware').AuthenticationMiddleware
    },
    'template_directories':[
        path.join(path.dirname(fs.realpathSync(__filename)), 'templates')
    ],
});

exports.middleware = require('./middleware'); 
exports.utils = require('./utils'); 
exports.backends = {};
exports.backends.base = require('./backends/base');
exports.backends.model = require('./backends/model');
