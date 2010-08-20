var http = require('../http'),
    urls = require('../urls'),
    escaperoute = require('escaperoute'),
    shortcuts = require('../shortcuts'),
    renderToResponse = shortcuts.renderToResponse;

exports.BaseMiddleware = {
    'processRequest':function(req) {
        var rootUrlConf = urls.getRoot(),
            match = rootUrlConf.match(req.pathname);
        req.pushProcessRequest(function (req) {
            match(req);
        });
        req.attemptContinue();
    },
    'processResponse':function(req) {
        req.end();
    },
    'processException':function(req) {
        var error = null;
        try {
            error = req.errors.pop();
        } catch(err) {
            
        }
        if(error instanceof escaperoute.NoMatch) {
            req.respond(new http.Http404("Not Found"));
        } else {
            req.respond(new http.Http500("Internal Server Error"));
        }
    },
};

exports.DebugMiddleware = {
    'processException':function(req) {
        var error = req.errors.pop(),
            templateName = err instanceof escaperoute.NoMatch ? 'core/debug404.html' : 'core/debug500.html';

        renderToResponse(req)('core/debug404.html', {
            'error':error,
            'request':request 
        });
    },
};
