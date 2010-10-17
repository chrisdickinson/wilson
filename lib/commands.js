exports.runcommand = function() {
    var sys = require('sys'),
        conf = require('wilson/conf'),
        core = require('wilson/core/app'),
        application = require('wilson/application'),
        app_and_command = process.argv[2].split(':'),
        app = app_and_command[0],
        command = app_and_command[1],
        appInstance;

    try {
        application.loadApps(conf.settings.APP_OVERRIDES);
        appInstance = application.getApplicationInstance(app);
    } catch(err) {
        conf.setSettings({
            INSTALLED_APPS:{
                core:application.use('wilson/core')
            },
            TEMPLATE_LOADERS:[
                'wilson/template/loaders.application',
                'wilson/template/loaders.filesystem',
            ],
        });
        application.loadApps(conf.settings.APP_OVERRIDES);
        appInstance = application.getApplicationInstance('core');
    }

    if(appInstance) {
        var appCommand = appInstance.app.commands[command];
        if(appCommand) {
            appCommand.apply(appInstance, process.argv.slice(3));
        } else {
            sys.puts('Could not find the command '+app_and_command);
            if(app === appInstance.name) {
                sys.puts('Available commands within '+app);
                for(var command_name in appInstance.app.commands) {
                    sys.puts('\t'+[app, command_name].join(':'));
                }
            } else {
                sys.puts('All apps and commands:');
                var appInstances = application.getApplicationInstances();
                for(var app_name in appInstances) {
                    sys.puts('\t'+app_name+':');
                    for(var command in appInstances[app_name]) {
                        sys.puts('\t\t'+command);
                    }
                }
            }        
        }
    }
};
