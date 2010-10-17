var escaperoute = require('escaperoute'),
    conf = require('wilson/conf'),
    application = require('wilson/application'),
    importModule = require('wilson/utils/module').importModule;

var getRoot = function() {
    if(arguments.callee._rootURLConf) return arguments.callee._rootURLConf;

    arguments.callee._rootURLConf = importModule(conf.settings.ROOT_URLCONF);
    return getRoot();
};

var reverse = function(name, args) {
    var rootUrls = getRoot();
    return rootUrls.reverse(name, args); 
};

exports.wrap = function(view, appname) {
    var view_split = view.split('.'),
        target = require(view_split[0]),
        appInstance = application.getApplicationInstance(appname);
    for(var i = 1, len = view_split.length; i < len; ++i) {
        target = target[view_split[i]];
    }
    return function() {
        return target.apply(appInstance, Array.prototype.slice.call(arguments));
    };
};

exports.app = function(regex, app_name, instance) {
    var app_instance = instance || application.getApplicationInstance(app_name),
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

