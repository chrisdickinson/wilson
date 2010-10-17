var application = require('wilson/application'),
    app = application.app,
    primary = application.primary,
    any = application.any,
    specific = application.specific,
    path = require('path');

exports.app = app({
    'provides':'',  // a one-word description of what your app provides.
    'models':require('{{ app_name }}/models'),
    'external_apps':{
        // list apps that you need
        // as "appInstance":howToFindAppInstance("provides_tag")
        //'auth':primary('auth')
    },
    'urls':require('{{ app_name }}/urls').patterns,
    'template_directories':[path.join(__dirname, 'templates')],
});
