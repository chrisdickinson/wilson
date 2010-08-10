var parse = require('url').parse,
    createServer = require('http').createServer,
    http = require('./http'),
    sys = require('sys'),
    urls = require('./urls'),
    escaperoute = require('escaperoute'); 

var runserver = function(settings_file, listen) {
    try {
        require(settings_file);
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

exports.runserver = runserver;
