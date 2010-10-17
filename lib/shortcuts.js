var http = require('./http'),
    getTemplate = require('wilson/template').getTemplate;

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
    var handleError = function(err) {
        request.attemptContinue([err]);
    };

    return function(template, context, content_type) {
        content_type = content_type || 'text/html';
        try { 
            getTemplate(template, function(err, tpl) {
                if(err) {
                    handleError(err);
                } else {
                    tpl.render(context, function(err, data) {
                        if(err) {
                            handleError(err);
                        } else {
                            request.respond(new http.HttpResponse(200, {
                                'Content-Type':content_type,
                                'Content-Length':data.length
                            }, data));
                        }
                    });
                }
            });
        } catch(err) {
            handleError(err);
        } 
    };
};

exports.renderToResponse = renderToResponse;
exports.getObjectOr404 = getObjectOr404;
