var conf = require('./conf');
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
};

ApplicationInstance.prototype.resolveAppDependency = function(dep_fn, app_dict) {
    for(var app_name in app_dict) if(app_dict.hasOwnProperty(app_name)) {
        var dep = dep_fn(app_dict[app_name]);
        if(dep) {
            return dep;
        }
    }
};

ApplicationInstance.prototype.setupForwardDependencies = function() {
    var external_app_list = this.app.external_apps,
        apps = conf.getApplicationInstances();
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


ApplicationInstance.prototype.resolveModels = function() {
    var apps = conf.getApplicationInstances();
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

