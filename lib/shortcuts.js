var http = require('./http'),
    jsdtl = require('jsdtl');

var getObjectOr404 = function(Model, filter, callback) {
    Model.objects.filter(filter).all(function(objects) {
        if(objects.length !== 1) {
            throw (new http.Http404());
        }
        callback(objects[0]);
    });
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
