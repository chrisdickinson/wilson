var appInstances = {};
var loadApps = function(app_options) {
    var settings = require('./settings'),
        apps = settings.get_value('apps');
    for(var app_name in apps) {
        appInstances[app_name] = apps[app_name].load(app_name, app_options[app_name]);
    }

    for(var app_name in appInstances) {
        appInstances[app_name].setupForwardDependencies();
    }

    for(var app_name in appInstances) {
        appInstances[app_name].resolveModels();
    }

    if(settings.get_value('use_app_template_directories')) {
        var jsdtl = require('jsdtl'),
            directories = jsdtl.settings.get_value('TEMPLATE_DIRS');
        for(var instance_name in appInstances) {
            var instance = appInstances[instance_name],
                app_directories = instance.app.template_directories;
            if(app_directories) {
                for(var i = 0, len = app_directories.length; i < len; ++i) {
                    if(directories.indexOf(app_directories[i]) === -1) {
                        directories.push(app_directories[i]);
                    }
                }
            } 
        }
    }
};

var Settings = function () {

};
Settings.prototype.extend = function(literal) {
    for(var i in literal) if(literal.hasOwnProperty(i)) {
        var target = require(i).settings;
        this[i] = this[i] === undefined ? {'addons':{}, 'values':{} } : this[i];
        for(var value_name in literal[i].values) if(literal[i].values.hasOwnProperty(value_name)) {
            target.set_value(value_name, literal[i].values[value_name]);
            this[i].values[value_name] = literal[i].values[value_name];
        }

        for(var addon_name in literal[i].addons) if(literal[i].addons.hasOwnProperty(addon_name)) {
            target.set_addon(addon_name, literal[i].addons[addon_name]);
            this[i].addons[addon_name] = literal[i].addons[addon_name];
        }
    }
    loadApps(arguments[1] || {});
};

var setApplicationInstance = function(app_name, app_instance) {
    appInstances[app_name] = app_instance;
};

var getApplicationInstance = function(app_name) {
    return appInstances[app_name];
};

var getApplicationInstances = function() {
    return appInstances;
};

var AppDeclaration = function(loc, opts) {
    this.opts = opts || {};
    this.loc = loc;
};

AppDeclaration.prototype.load = function(name, options) {
    var application = require('./application'),
        isLocal = false;
    if(/^\.\//.test(this.loc)) {
        this.loc = this.loc.slice(2) + '/app';
        isLocal = true;
    }
    var app,
        app_out = {};
    if(isLocal) {
        app = require(this.loc).app;        
    } else {
        var app_split = this.loc.split('.');
        app = require(app_split[0]);
        for(var i = 1, len = app_split.length; i < len; ++i) {
            app = app[app_split[i]];
        }
        app = app.app;
    }

    if(options) {
        for(var item in app) if(app.hasOwnProperty(item)) {
            app_out[item] = app[item];
        }
        for(var item in options) if(options.hasOwnProperty(item)) {
            app_out[item] = options[item];
        }
        app = new application.Application(app_out);
    }

    var app_instance = app.instantiate(name);
    for(var option in this.opts) {
        app_instance[option] = this.opts[option];
    }

    return app_instance;
};

exports.primary = function(loc) {
    return new AppDeclaration(loc, {
        'isPrimary':true
    });
};

exports.app = function(loc) {
    return new AppDeclaration(loc);
};

exports.settings = new Settings();
exports.setApplicationInstance = setApplicationInstance;
exports.getApplicationInstance = getApplicationInstance;
exports.getApplicationInstances = getApplicationInstances;

