var apps = require('wilson/application');

INSTALLED_APPS = {
                'core':apps.usePrimary('wilson/core/app'),
                'sessions':apps.usePrimary('wilson/contrib/sessions/app'),
                'auth':apps.usePrimary('wilson/contrib/auth/app'),
                // install your apps here like so:
                //'myapp':apps.use('projectname/appname')
};

SECRET_KEY = '{{ SECRET_KEY }}';

ROOT_URLCONF = '{{ project_name }}/urls.patterns';

TEMPLATE_LOADERS = [
    'wilson/template/loaders.application',
    'wilson/template/loaders.filesystem',
];

TEMPLATE_DIRECTORIES = [];

MIDDLEWARE = [
    'core:BaseMiddleware',
    'core:DebugMiddleware',
    'core:ProcessUrlEncodedMiddleware',
    'sessions:SessionMiddleware',
    'auth:AuthenticationMiddleware',
];

APP_OVERRIDES = {
    core:{
        settings:{
            debug:true
        }
    },
    auth:{
        settings:{
            backends:['wilson/contrib/auth/backends/model.AuthModelBackend']
        }
    }
};
