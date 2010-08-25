var escaperoute = require('escaperoute'),
    routes = escaperoute.routes,
    url = escaperoute.url,
    surl = escaperoute.surl;

exports.patterns = routes('',
    url('login/$', require('./views').login, 'login')
    //url('list/$', 'list_view', 'blog-list-view')
);
