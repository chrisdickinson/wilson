
exports.getServerFunction = function() {
    var http = require('./http'),
        settings = require('wilson').settings,
        middleware_strings = settings.get_value('middleware'),
        middleware = [],
        conf = require('./conf');
    var createWrappedMethod = function(instance, method) {
            return function() {
                method.apply(instance, Array.prototype.slice.call(arguments));
            };
        };
    var createWrappedMiddleware = function(instance, middleware) {
            output_middleware = {};
        for(var name in middleware) {
            output_middleware[name] = createWrappedMethod(instance, middleware[name]); 
        };
        return output_middleware;
    }; 

    for(var i = 0, len = middleware_strings.length; i < len; ++i) {
        var split = middleware_strings[i].split(':'),
            app = split[0],
            rest = split.slice(1).join(':'),
            appInstance = conf.getApplicationInstance(app);
        middleware.push(createWrappedMiddleware(appInstance, appInstance.app.middleware[rest]));
    }

    return function(request, response) {
        var wilsonRequest = new http.HttpRequest(request, response, middleware);
        wilsonRequest.attemptContinue();
    };
};


