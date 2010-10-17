var application = require('../application'),
    app = application.app,
    primary = application.primary,
    path = require('path'),
    fs = require('fs');

exports.app = app({
    'provides':'core',
    'models':{},
    'external_apps':{},
    'commands':require('./commands'),
    'middleware':require('./middleware'),
    'template_directories':[
        path.join(__dirname, 'templates')
    ],
});
