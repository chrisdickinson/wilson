var application = require('../../application'),
    app = application.app,
    primary = application.primary,
    any = application.any,
    specific = application.specific;

exports.app = app({
    'provides':'sessions',  // a one-word description of what your app provides.
    'models':require('./models'),
    'external_apps':{},
    'middleware':require('./middleware'),
    'settings':{
        'cookie_age':1000*60*60*24*7*2,
        'cookie_name':'sessionid',
        'cookie_domain':null,
        'cookie_secure':false,
        'cookie_path':'/',
        'save_every_request':false,
        'expire_at_browser_close':false,
        'backend':require('./backends/db').SessionStore
    }
});
