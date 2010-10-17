var path = require('path'),
    app = require('wilson/application');

exports.application = function(settings, loader) {
    var apps = app.getApplicationInstances(),
        dirs = [];
    Object.keys(apps).forEach(function(appname) {
        var appInstance = apps[appname];
        if(appInstance.app.template_directories instanceof Array) {
            appInstance.app.template_directories.forEach(function(dir) {
                if(dirs.indexOf(dir) === -1) {
                    dirs.push(dir);
                }
            });
        } 
    });

    dirs.forEach(function(dir) {
        loader.addDirectory(dir);
    });
};

exports.filesystem = function(settings, loader) {
    var template_dirs = settings.TEMPLATE_DIRS;
    template_dirs = template_dirs instanceof Array ? template_dirs : [template_dirs];
    template_dirs.forEach(function(dir) {
        loader.addDirectory(dir);        
    });
};
