var wilson = require('wilson'),
    application = wilson.application,
    app = application.app,
    primary = application.primary,
    any = application.any,
    specific = application.specific,
    path = require('path'),
    fs = require('fs');

exports.app = app({
    'provides':'',  // a one-word description of what your app provides.
    'models':require('./models'),
    'external_apps':{
        // list apps that you need
        // as "appInstance":howToFindAppInstance("provides_tag")
        //'auth':primary('auth')
    },
    'urls':require('./urls').patterns,

    // uncomment this if your app provides templates
    //'template_directories':[
    //    path.join(path.dirname(fs.realpathSync(__filename)), 'templates')
    //],
});
