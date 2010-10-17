var escaperoute = require('escaperoute'),
    routes = escaperoute.routes,
    url = escaperoute.url,
    surl = escaperoute.surl;

exports.patterns = routes('wilson/contrib/auth/urls.views',
    url('login/$', 'login', 'login')
);
