var application = require('wilson/application'),
    app = application.app,
    primary = application.primary,
    any = application.any,
    specific = application.specific,
    path = require('path'),
    fs = require('fs');

exports.app = app({
    'provides':'auth',  // a one-word description of what your app provides.
    'models':require('wilson/contrib/auth/models'),
    'urls':require('wilson/contrib/auth/urls').patterns,
    'external_apps':{
        'sessions':primary('sessions'),
    },
    'middleware':{
        'AuthenticationMiddleware':require('wilson/contrib/auth/middleware').AuthenticationMiddleware
    }
});
