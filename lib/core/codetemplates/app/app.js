var wilson = require('wilson'),
    application = wilson.application,
    app = application.app,
    primary = application.primary,
    any = application.any,
    specific = application.specific;

exports.app = app({
    'provides':'',  // a one-word description of what your app provides.
    'models':require('./models'),
    'external_apps':{
        // list apps that you need
        // as "appInstance":howToFindAppInstance("provides_tag")
        //'auth':primary('auth')
    },
    'urls':require('./urls').patterns,
});
