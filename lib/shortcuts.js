var http = require('./http');

jsdtl = null;
try {
    jsdtl = require('jsdtl');
} catch(err) {
    require('sys').log("Could not find JSDTL");
}

var getObjectOr404 = function(request) {
    return function(Model, filter, callback) {
        Model.objects.filter(filter).all(function(objects) {
            if(objects.length !== 1) {
                request.respond(new http.Http404("No object matches"));
            } else {
                callback(objects[0]);
            }
        });
    };
};

var renderToResponse = function(request) {
    return function(template, context, content_type) {
        content_type = content_type ? content_type : 'text/html';

        jsdtl.settings.get_addon('loaders').get_template(template, function(tpl, err) {
            if(err) {
                request.respond(new http.Http500("Could not find template "+template));
            } else { 
                tpl.render(new jsdtl.core.Context(context), function(data) {
                    request.respond(new http.HttpResponse(200, {
                        'Content-Type':content_type,
                        'Content-Length':data.length
                    }, data));
                });
            }
        });
    };
};

exports.renderToResponse = renderToResponse;
exports.getObjectOr404 = getObjectOr404;
