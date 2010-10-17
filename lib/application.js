var importModule = require('wilson/utils/module').importModule,
    appInstances = {};

var setApplicationInstance = function(app_name, app_instance) {
    appInstances[app_name] = app_instance;
};

var getApplicationInstance = function(app_name) {
    return appInstances[app_name];
};

var getApplicationInstances = function() {
    return appInstances;
};

var Application = function(opts) {
    for(var i in opts) if(opts.hasOwnProperty(i)) {
        this[i] = opts[i];
    }
};

Application.prototype.instantiate = function(name) {
    return new ApplicationInstance(name, this);
};

var ApplicationInstance = function(name, app) {
    var self = this;
    this.name = name;
    this.app = app;
    this.settings = {};

    for(var name in this.app.settings) {
        this.settings[name] = this.app.settings[name];
    }
};

ApplicationInstance.prototype.resolveAppDependency = function(dep_fn, app_dict) {
    for(var app_name in app_dict) if(app_dict.hasOwnProperty(app_name)) {
        var dep = dep_fn(app_dict[app_name]);
        if(dep) {
            return dep;
        }
    }
    throw new Error("Could not resolve app dependency.");
};

ApplicationInstance.prototype.setupForwardDependencies = function(apps) {
    apps = apps || getApplicationInstances();
    var external_app_list = this.app.external_apps;
    this.externals = {};

    for(var external_app_name in external_app_list) if(external_app_list.hasOwnProperty(external_app_name)) {
        this.externals[external_app_name] = this.resolveAppDependency(external_app_list[external_app_name], apps);
    }

    for(var model_name in this.app.models) if(this.app.models.hasOwnProperty(model_name)) {
        var model = this.app.models[model_name];
        for(var option in model.opts) if(model.opts.hasOwnProperty(option) && model.opts[option].isField) {
            var extern = model.opts[option].getExternalFrom ? model.opts[option].getExternalFrom(this.externals) : null;
            if(extern instanceof ApplicationInstance) {
                extern.resolvers = extern.resolvers ? extern.resolvers : {};
                extern.resolvers[model.opts[option].model] = extern.resolvers[model.opts[option].model] ? extern.resolvers[model.opts[option].model] : [];
                extern.resolvers[model.opts[option].model].push((function(target) {
                    return function(model) {
                        target.resolve(model);
                    };
                })(model.opts[option].dependency));
            }
        }
    }
};

ApplicationInstance.prototype.resolveModels = function(apps) {
    apps = apps || getApplicationInstances();
    this.models = {};
    for(var model_name in this.app.models) {
        var model = this.app.models[model_name].instantiate(this, [this.name.toLowerCase(), model_name.toLowerCase()].join('_'));
        this.models[model_name] = model;
        this.models[model_name].prototype._meta.app_name = this.name;

        for(var dependency in this.resolvers) if(this.resolvers.hasOwnProperty(dependency)) {
            for(var i = 0, len = this.resolvers[dependency].length; i < len; ++i) {
                this.resolvers[dependency][i](this.models[model_name]);
            }
        }
    }
};

exports.app = function(opts) {
    return new Application(opts);
};

exports.any = function(tag) {
    return function(app_instance) {
        if(app_instance.app.provides.indexOf(tag) !== -1) {
            return app_instance;
        }
    };
};

exports.primary = function(tag) {
    return function(app_instance) {
        if(app_instance.isPrimary && app_instance.app.provides.indexOf(tag) !== -1) {
            return app_instance;
        }
    }
};

exports.specific = function(app_name) {
    return function(app_instance) {
        if(app_instance.name === app_name) {
            return app_instance;
        }
    };
};

var AppDeclaration = function(loc, opts) {
    this.opts = opts || {};
    this.loc = loc;
};

AppDeclaration.prototype.load = function(name, options) {
    var app = importModule(this.loc).app,
        app_out = {};

    if(options) {
        Object.keys(app).forEach(function(item) {
            app_out[item] = app[item];
        });

        Object.keys(options).forEach(function(item) {
            app_out[item] = options[item];
        });

        app = new Application(app_out);
    }

    var app_instance = app.instantiate(name);
    for(var option in this.opts) {
        app_instance[option] = this.opts[option];
    }

    return app_instance;
};

exports.usePrimary = function(loc) {
    return new AppDeclaration(loc, {
        'isPrimary':true
    });
};

exports.use = function(loc) {
    return new AppDeclaration(loc);
};

exports.loadApps = function(app_options) {
    app_options = app_options || {};

    var settings = require('wilson/conf').settings,
        apps = settings.INSTALLED_APPS;

    Object.keys(apps).forEach(function(app_name) {
        appInstances[app_name] = apps[app_name].load(app_name, app_options[app_name]);
    });

    Object.keys(appInstances).forEach(function(app_name) {
        appInstances[app_name].setupForwardDependencies();
    });

    Object.keys(appInstances).forEach(function(app_name) {
        appInstances[app_name].resolveModels();
    });
};

exports.Application = Application;
exports.ApplicationInstance = ApplicationInstance;
exports.setApplicationInstance = setApplicationInstance;
exports.getApplicationInstance = getApplicationInstance;
exports.getApplicationInstances = getApplicationInstances;
