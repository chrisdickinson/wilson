
exports.getServerFunction = function() {
    var http = require('wilson/http'),
        conf = require('wilson/conf'),
        application = require('wilson/application'),
        settings = conf.settings,
        middleware_strings = settings.MIDDLEWARE,
        middleware = [];

    var createWrappedMethod = function(instance, method) {
            return function() {
                method.apply(instance, Array.prototype.slice.call(arguments));
            };
    };

    var createWrappedMiddleware = function(instance, middleware, mw_name) {
        output_middleware = {};

        Object.keys(middleware).forEach(function(name) {
            output_middleware[name] = createWrappedMethod(instance, middleware[name]); 
        });

        output_middleware.toString = function() {
            return "<Middleware: "+mw_name+">";
        };
        return output_middleware;
    }; 

    for(var i = 0, len = middleware_strings.length; i < len; ++i) {
        var split = middleware_strings[i].split(':'),
            app = split[0],
            rest = split.slice(1).join(':'),
            appInstance = application.getApplicationInstance(app);
        middleware.push(createWrappedMiddleware(appInstance, appInstance.app.middleware[rest], rest));
    }

    return function(request, response) {
        var wilsonRequest = new http.HttpRequest(request, response, middleware);
        wilsonRequest.attemptContinue();
    };
};


