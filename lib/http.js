var url = require('url'),
    sys = require('sys'),
    cookies = require('./cookies');

var HttpRequest = function(request, response, middleware) {
    this.nodeRequest = request;
    this.nodeResponse = response;

    this.processRequestFns = [];
    this.processResponseFns = [];
    this.processExceptionFns = [];

    this.winding = 0;
    this.direction = 1;
    this.continueFrom = 'processRequestFns';    

    this.method = request.method;
    this.startTime = new Date();

    this.COOKIES = new cookies.CookieManager(request.headers['cookie']);
    this.GET = url.parse(request.url, true).query || {};

    var parsed = url.parse(request.url),
        defaultProcessor = function(req) {
            req.attemptContinue();
        };

    for(var name in parsed) if(parsed.hasOwnProperty(name)) {
        this[name] = parsed[name];
    }

    for(var i = 0, len = middleware.length; i < len; ++i) {
        if(middleware[i].processRequest instanceof Function) {
            this.processRequestFns.push(middleware[i].processRequest);
        } else {
            this.processRequestFns.push(defaultProcessor);
        }

        if(middleware[i].processResponse instanceof Function) {
            this.processResponseFns.push(middleware[i].processResponse);
        } else {
            this.processResponseFns.push(defaultProcessor);
        }

        if(middleware[i].processException instanceof Function) {
            this.processExceptionFns.push(middleware[i].processException);
        } else {
            this.processExceptionFns.push(defaultProcessor);
        }
    }
};

HttpRequest.prototype.attemptContinue = function(errors) {
    if(errors) {
        this.direction = -1;
        this.continueFrom = 'processExceptionFns';
        this.errors = this.errors || [];
        this.errors.push(errors);
        this.attemptContinue();
    } else {
        this.winding += this.direction;
        try {
            var target = this[this.continueFrom][this.winding-this.direction];
            if(target instanceof Function) {
                target(this);
            } else {
                this.end();
            }
        } catch(err) {
            err.originalStack = err.stack;
            if(this.continueFrom !== 'processExceptionFns') {
                this.winding -= this.direction;
            }
            this.attemptContinue(err);
        }
    }
};

HttpRequest.prototype.respond = function(response) {
    this.response = response;
    if(this.continueFrom !== 'processRequestFns') {
        // if an exception responds, then we should short circuit to the end.
        this.end();
    } else {
        this.direction = -1;
        this.winding -= 1;
        this.continueFrom = 'processResponseFns';
        this.attemptContinue();
    }
};

HttpRequest.prototype.pushProcessRequest = function(cb) {
    this.processRequestFns.push(cb);
    this.processResponseFns.push(function(req) {
        req.attemptContinue();
    });
    this.processExceptionFns.push(function(req) {
        req.attemptContinue();
    });
};

HttpRequest.prototype.pushProcessResponse = function(cb) {
    this.processResponseFns.push(cb);
    this.processRequestFns.push(function(req) {
        req.attemptContinue();
    });
    this.processExceptionFns.push(function(req) {
        req.attemptContinue();
    });
};

HttpRequest.prototype.pushProcessException = function(cb) {
    this.processExceptionFns.push(cb);
    this.processResponseFns.push(function(req) {
        req.attemptContinue();
    });
    this.processRequestFns.push(function(req) {
        req.attemptContinue();
    });
};

HttpRequest.prototype.end = function() {
    sys.log([this.response.status_code, this.pathname, (new Date()) - this.startTime].join(' - '));

    if(!this.response.headers['Set-Cookie']) {
        var compiledCookies = this.COOKIES.compile();
        if(compiledCookies) {
            this.response.headers['Set-Cookie'] = this.COOKIES.compile();
        }
    }
    this.nodeResponse.writeHead(this.response.status_code, this.response.headers);
    this.nodeResponse.write(this.response.content);
    this.nodeResponse.end();
};

var HttpResponse = function(status_code, headers, content) {
    this.status_code = status_code;
    this.headers = headers;
    this.content = content;
};

Http404 = function(content) {
    this.content = content || "Not Found";
    this.headers['Content-Length'] = this.content.length;
};
Http404.prototype = new HttpResponse(404, {'Content-Type':'text/html'});
Http404.prototype.constructor = Http404;

Http500 = function(content) { 
    this.content = content || "Internal Server Error";
    this.headers['Content-Length'] = this.content.length;
};
Http500.prototype = new HttpResponse(500, {'Content-Type':'text/html'});
Http500.prototype.constructor = Http500;


HttpResponseRedirect= function(to) { HttpResponse.apply(this, [301, {'Location':to}, to]); };
HttpResponseRedirect.prototype = new HttpResponse(301, {});
HttpResponseRedirect.prototype.constructor = HttpResponseRedirect;

exports.Http404 = Http404;
exports.Http500 = Http500;
exports.HttpResponseRedirect = HttpResponseRedirect;
exports.HttpResponse = HttpResponse;
exports.HttpRequest = HttpRequest;
