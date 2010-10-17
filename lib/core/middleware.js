var http = require('wilson/http'),
    urls = require('wilson/urls'),
    escaperoute = require('escaperoute'),
    shortcuts = require('wilson/shortcuts'),
    renderToResponse = shortcuts.renderToResponse,
    qs = require('querystring');

exports.BaseMiddleware = {
    'processRequest':function(req) {
        var rootUrlConf = urls.getRoot(),
            match = rootUrlConf.match(req.pathname);
        req.request_middleware.push({'processRequest':function (req) {
            match(req);
        }});
        req.attemptContinue();
    },
    'processException':function(req) {
        var error = null;
        try {
            error = req.errors.shift();
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
            });
        } else {
            req.attemptContinue();
        }
    },
};
