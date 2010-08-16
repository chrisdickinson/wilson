var http = require('./http');

jsdtl = null;
try {
    jsdtl = require('jsdtl');
} catch(err) {
    require('sys').log("Could not find JSDTL");
}

var getObjectOr404 = function(response) {
    return function(Model, filter, callback) {
        Model.objects.filter(filter).all(function(objects) {
            if(objects.length !== 1) {
                var responder = new http.Http404();
                responder.respond(response);
            } else {
                callback(objects[0]);
            }
        });
    };
};

var renderToResponse = function(request, response) {
    return function(template, context, content_type) {
        content_type = content_type ? content_type : 'text/html';

        jsdtl.settings.get_addon('loaders').get_template(template, function(tpl, err) {
            if(err) {
                var responder = new http.HttpServerError("Could not find template "+template);
                responder.respond(response); 
            } else { 
                tpl.render(new jsdtl.core.Context(context), function(data) {
                    response.writeHead(200, {
                        'Content-Type':content_type,
                        'Content-Length':data.length
                    });
                    response.write(data);
                    response.end();
                });
            }
        });
    };
};

exports.renderToResponse = renderToResponse;
exports.getObjectOr404 = getObjectOr404;
