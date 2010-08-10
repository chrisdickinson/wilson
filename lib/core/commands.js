
exports.runserver = function(listen) {
    var parse = require('url').parse,
        createServer = require('http').createServer,
        http = require('../http'),
        urls = require('../urls'),
        sys = require('sys'),
        escaperoute = require('escaperoute');
    try {
        var rootUrlConf = urls.getRoot();
        var server = createServer(function(request, response) {
            var path = parse(request.url, true).pathname;
            try {
                var match = rootUrlConf.match(path);
                match(request, response);
                sys.log('GET '+path+' - 200');
            } catch(err) {
                if(err instanceof http.HttpResponse) {
                    sys.log('GET '+path+' - '+err.status_code);
                    err.respond(response);
                } else if(err instanceof escaperoute.NoMatch) {
                    sys.log('GET '+path+' - 404');
                    (new Http404()).respond(response); 
                } else {
                    sys.log('GET '+path+' - 500');
                    response.writeHead(500, {'Content-Type':'text/html'});
                    response.end("<h1>An error occurred.</h1>");
                }
            }        
        });
        sys.puts('Running at '+listen);
        sys.puts('Ctrl-C to stop doing that thing.');
        server.listen(parseInt(listen, 10));
    } catch(err) {
        sys.debug(err);
        sys.puts("Could not find the settings file '"+settings_file+"'!");
    }
};

exports.syncdb = function() {
    var conf = require('../conf'),
        appInstances = conf.getApplicationInstances(),
        pieshop = require('pieshop'),
        backend = pieshop.settings.get_addon('backend'),
        sys = require('sys');

    var table_creations = [],
        deferred = [];

    for(var app_name in appInstances) {
        var app = appInstances[app_name];
        for(var model_name in app.models) {
            var model = app.models[model_name];

            var table_fields = [];
            for(var field_name in model.prototype._meta.fields) {
                var backendField = model.prototype._meta.get_field_by_name(field_name).getBackendField(backend),
                    column = backendField.getColumn(field_name),
                    deferredConstraint = backendField.getConstraint(),
                    databaseRepr = backendField.databaseRepresentation();

                table_fields.push([column, databaseRepr].join(' '));
                if(deferredConstraint) {
                    deferred.push(deferredConstraint);
                }
            }
            table_creations.push('CREATE TABLE '+model.prototype._meta.opts.table + '(\n\t' + table_fields.join(',\n\t') + '\n)')+';'; 
        }
    }
    sys.puts(table_creations.join(';\n')+';\n');
    sys.puts(deferred.join(';\n')+';\n');
};
