var escaperoute = require('escaperoute'),
    urls = require('wilson/urls'),
    http = require('wilson/http'),
    app = urls.app,
    wrap = urls.wrap,
    routes = escaperoute.routes,
    url = escaperoute.url,
    surl = escaperoute.surl;

exports.patterns = routes('{{ project_name }}'
    // include app urls with `app`
    // , app('^/myblog/', 'myblog')

    // include views that you want to execute inside an app with `wrap`
    // , url('^/$', wrap('myblog/views.list_view', 'myblog'), 'homepage'),


    // example view for favicons
    // , url('^/favicon.ico', function(request) {
    //      request.respond(new http.Http404("Could not find favicon.ico"));
    //  })
)

