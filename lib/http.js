var sys = require('sys');

var HttpResponse = function(status_code, headers, content) {
    this.status_code = status_code;
    this.headers = headers;
    this.content = content;
};
HttpResponse.prototype.respond = function(response) {
    response.writeHead(this.status_code, this.headers);
    response.end(this.content);
};

Http404 = function() { };
Http404.prototype = new HttpResponse(404, {'Content-Type':'text/html'});
Http404.prototype.constructor = Http404;

HttpServerError = function(content) { 
    sys.log("500 - "+content);
    this.content = "Internal Server Error";
};
HttpServerError.prototype = new HttpResponse(500, {'Content-Type':'text/html'});
HttpServerError.prototype.constructor = HttpServerError;


HttpResponseRedirect= function(to) { HttpResponse.apply(this, [301, {'Location':to}, to]); };
HttpResponseRedirect.prototype = new HttpResponse(301, {});
HttpResponseRedirect.prototype.constructor = HttpResponseRedirect;

exports.Http404 = Http404;
exports.HttpServerError = HttpServerError;
exports.HttpResponseRedirect = HttpResponseRedirect;
exports.HttpResponse = HttpResponse;

