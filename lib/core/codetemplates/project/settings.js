var wilson = require('wilson'),
    conf = wilson.conf,
    settings = conf.settings,
    primary = conf.primary,
    app = conf.app;

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
                'core':primary('wilson.core'),
                'sessions':primary('wilson.contrib.sessions'),
                'auth':primary('wilson.contrib.auth'),
                // install your apps here like so:
                //'core':primary('wilson.core'),
                //'auth':primary('wilson.auth'),
                //'myapp':app('appname')
            },
            'root_urlconf':'urls.patterns',
            'use_app_template_directories':true,
            'middleware':[
                'core:BaseMiddleware'
            ,   'core:DebugMiddleware'
            ,   'core:ProcessUrlEncodedMiddleware'
            ,   'sessions:SessionMiddleware'
            ,   'auth:AuthenticationMiddleware'
            ],
        }
    },
}, {
    // overrides for specific app instances go here:
    // 'myapp':{'settings':{'some_value':42}},
    'auth':{
        'settings':{
            'backends':[wilson.contrib.auth.backends.model.AuthModelBackend]
        }
    },
    'core':{
        'settings':{
            'debug':true,
        }
    },
});
