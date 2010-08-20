var escaperoute = require('escaperoute'),
    conf = require('./conf'),
    settings = require('./settings');

var root_urlconf = null;

var getRoot = function() {
    if(root_urlconf) return root_urlconf;

    var loc = settings.get_value('root_urlconf').split('.'),
        app_name = loc[0],
        rest = loc.slice(1),
        retval = require(app_name);

    for(var i = 0, len = rest.length; i < len; ++i) {
        retval = retval[rest[i]];
    }
    root_urlconf = retval;
    return getRoot();
};

var reverse = function(name, args) {
    var rootUrls = getRoot();
    return rootUrls.reverse(name, args); 
};

exports.wrap = function(view, appname) {
    try { 
        var view_split = view.split('.'),
            target = require(view_split[0]),
            appInstance = conf.getApplicationInstance(appname);
        for(var i = 1, len = view_split.length; i < len; ++i) {
            target = target[view_split[i]];
        }
        return function() {
            return target.apply(appInstance, Array.prototype.slice.call(arguments));
        };
    } catch (err) {
    }
};

exports.app = function(regex, app_name, instance) {
    var app_instance = instance || conf.getApplicationInstance(app_name),
        routes = app_instance.app.urls.routes,
        routes_out = [];

    for(var i = 0, len = routes.length; i < len; ++i) {
        routes_out.push(new escaperoute.Route(
            routes[i].re.source,
            routes[i].target,
            [app_instance.name,routes[i].name].join(':')
        ));
    }

    app_instance.urls = new escaperoute.Router(
        app_instance.app.urls.base_path,
        routes_out,
        app_instance
    );
    return new escaperoute.Route(regex, app_instance.urls);
};
exports.getRoot = getRoot;
exports.reverse = reverse;

