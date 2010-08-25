var escaperoute = require('escaperoute'),
    routes = escaperoute.routes,
    url = escaperoute.url,
    surl = escaperoute.surl;

exports.patterns = routes('./views'
    //, url('list/$', 'list_view', 'blog-list-view')
);
