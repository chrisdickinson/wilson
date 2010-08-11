exports.runcommand = function() {
    var sys = require('sys');

    var settings = process.argv.slice(-1)[0],
        app_and_command = process.argv[2].split(':'),
        slice_until = -1;
    try {
        if(process.argv[2] !== settings) {
            require(settings);
        }
    } catch(err) {
        slice_until = undefined;
    }

    var wilson = require('wilson'),
        conf = wilson.conf,
        app = app_and_command[0],
        command = app_and_command[1],
        appInstance = conf.getApplicationInstance(app);

    if(appInstance === undefined) {
        appInstance = wilson.core.app.instantiate('core');
    }

    if(appInstance) {
        var appCommand = appInstance.app.commands[command];
        if(appCommand) {
            appCommand.apply(appInstance, process.argv.slice(3, slice_until));
        } else {
            sys.puts('Could not find the command '+app_and_command);
            if(app === appInstance.name) {
                sys.puts('Available commands within '+app);
                for(var command_name in appInstance.app.commands) {
                    sys.puts('\t'+[app, command_name].join(':'));
                }
            } else {
                sys.puts('All apps and commands:');
                var appInstances = conf.getApplicationInstances();
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
