var http = require('../http'),
    urls = require('../urls'),
    escaperoute = require('escaperoute'),
    shortcuts = require('../shortcuts'),
    renderToResponse = shortcuts.renderToResponse,
    qs = require('querystring');

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

exports.ProcessUrlEncodedMiddleware = {
    'processRequest':function(req) {
        if(req.nodeRequest.headers['content-type'] === 'application/x-www-form-urlencoded') {
            req.nodeRequest.on('data', function(data) {
                data = unescape(data.toString('utf8'));
                req[req.method] = qs.parse(data);
                req.attemptContinue();
            });
        } else {
            req.attemptContinue();
        }
    }
};

exports.DebugMiddleware = {
    'processException':function(req) {
        if(this.settings.debug) {
            var error = req.errors.shift(),
                templateName = error instanceof escaperoute.NoMatch ? 'core/debug404.html' : 'core/debug500.html';

            renderToResponse(req)(templateName, {
                'error':error,
                'stack':error.stack ? error.stack.split('\n') : [''],
                'urlpatterns':error.urlpatterns,
                'request':req,
                'settings':require('../settings').getAllValues(), 
            });
        } else {
            req.attemptContinue();
        }
    },
};
