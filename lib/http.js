var url = require('url'),
    sys = require('sys'),
    cookies = require('./cookies');

var HttpRequest = function(request, response, middleware) {
    this.nodeRequest = request;
    this.nodeResponse = response;
    this.request_middleware = middleware.slice();
    this.response_middleware = middleware.slice().reverse();
    this.exception_middleware = middleware.slice().reverse();
    this.errors = [];
    this.startTime = new Date();
    
    this.COOKIES = new cookies.CookieManager(this.nodeRequest.headers['cookie']);
    this.GET = url.parse(request.url, true).query || {};

    var parsed = url.parse(request.url);

    for(var name in parsed) if(parsed.hasOwnProperty(name)) {
        this[name] = parsed[name];
    }

    this.method = request.method;
    this.continue = this.processRequest;
};

HttpRequest.prototype.processRequest = function() {
    var self = this,
        setErrorState = function(err) {
            self.errors.push(err);
            self.continue = self.processException;
            self.continue();
        };
    try {
        var mw = this.request_middleware.shift();
        if(mw) {
            if(mw.processRequest) {
                mw.processRequest(this);
            } else {
                this.attemptContinue();
            }
        } else {
            setErrorState(new Error("Nothing provided a response"));
        }
    } catch(err) {
        setErrorState(err);
    }
};

HttpRequest.prototype.processResponse = function() {
    try {
        var mw = this.response_middleware.shift();
        if(mw) {
            if(mw.processResponse) {
                mw.processResponse(this);
            } else {
                this.attemptContinue();
            }
        } else {
            this.end(this.response);
        }
    } catch(err) {
        this.errors.push(err);
        this.continue = this.processException;
        this.continue();
    }
};

HttpRequest.prototype.processException = function() {
    try {
        var mw = this.exception_middleware.shift();
        if(mw) {
            if(mw.processException) {
                mw.processException(this);
            } else {
                this.attemptContinue();
            }
        } else {
            this.end(new Http500());
        }
    } catch(err) {
        this.end(new Http500());
    }
};

HttpRequest.prototype.attemptContinue = function(error) {
    if(error) {
        this.errors.push(error);
        this.continue = this.processException;
    }
    this.continue();
};

HttpRequest.prototype.respond = function(response) {
    var self = this;
    this.response = response;
    this.continue = this.continue === this.processException ? function() {
        self.end(response);
    } : this.processResponse;
    this.continue(); 
};

HttpRequest.prototype.end = function(response) {
    sys.log([response.status_code, this.pathname, (new Date()) - this.startTime].join(' - '));

    if(!response.headers['Set-Cookie']) {
        var compiledCookies = this.COOKIES.compile();
        if(compiledCookies) {
            response.headers['Set-Cookie'] = this.COOKIES.compile();
        }
    }
    this.nodeResponse.writeHead(response.status_code, response.headers);
    this.nodeResponse.write(response.content);
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
