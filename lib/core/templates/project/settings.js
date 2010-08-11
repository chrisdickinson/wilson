var conf = require('wilson').conf,
    settings = conf.settings,
    primary = conf.primary,
    app = conf.app,
    path = require('path');

settings.extend({
    'pieshop':{
        'values':{
            'DB_HOST':'',       // probably going to be localhost
            'DB_NAME':'',       // your database name
            'DB_PASSWORD':'',
        },
        'addons':{
            'backend':'postpie.backends:PostgresBackend',
            'transport':'postpie.transports:PostgresTransport',
        },
    },
    'wilson':{
        'values':{
            'apps':{
                // install your apps here like so:
                //'core':primary('wilson.core'),
                //'auth':primary('wilson.auth'),
                //'myapp':app('appname')
            },
            'root_urlconf':'urls.patterns',
            'middleware':[],
        }
    },
});
