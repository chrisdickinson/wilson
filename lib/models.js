var pieshop = require('pieshop'),
    pieshop_fields = pieshop.fields;

var Model = function(opts) {
    this.opts = opts;
};

Model.prototype.instantiate = function(app, resource_uri) {
    var opts_copy = {};
    for(var name in this.opts) {
        opts_copy[name] = this.opts[name];
    }

    opts_copy.Meta = {};
    for(var i in this.opts.Meta) {
        opts_copy.Meta[i] = this.opts.Meta[i];
    }

    if(!opts_copy.Meta.table) {
        opts_copy.Meta.table = resource_uri;
    }
    var resource = pieshop.core.resource(opts_copy);
    // TODO: this is how things should look
    //if(!resource.getResourceURI()) {
    //    resource.setResourceURI(resource_uri);
    //}
    return resource;
};

var model = function(opts) {
    return new Model(opts);
};

for(var field_name in pieshop_fields) {
    exports[field_name] = pieshop_fields[field_name];
}

Dependency = function(app_name, model_name) {
    this.app_name = app_name;
    this.model_name = model_name;
};

Dependency.prototype.resolve = function(incoming_model) {
    this.model = incoming_model;
};

exports.ForeignKey = function(to, opts) {
    if(to instanceof Dependency) {
        var returning = function(model, name) {
            return new pieshop_fields.ForeignKeyInstance(model, name, arguments.callee.dependency.model, opts);
        };
        returning.isField = true;
        returning.dependency = to;
        returning.model = to.model_name;
        returning.getExternalFrom = function(externals) {
            return externals[to.app_name];
        };
        return returning;
    } else {
        return pieshop_fields.ForeignKey(to, opts);
    }
};

exports.model = model;
exports.Dependency = Dependency;
exports.dep = function(app_name, model_name) {
    return new Dependency(app_name, model_name);
};
