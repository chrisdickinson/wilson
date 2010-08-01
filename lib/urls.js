var escaperoute = require('escaperoute'),
    conf = require('./conf'),
    settings = conf.settings;

var root_urlconf = null;

var getRoot = function() {
    if(root_urlconf) return root_urlconf;

    var loc = settings.wilson.values.root_urlconf.split('.'),
        app_name = loc[0],
        rest = loc.slice(1),
        retval = require(app_name);

    for(var i = 0, len = rest.length; i < len; ++i) {
        retval = retval[rest[i]];
    }
    root_urlconf = retval;
    return getRoot();
};

var reverse = function(name, args) {
    var rootUrls = getRoot();
    return rootUrls.reverse(name, args); 
};

exports.getRoot = getRoot;
exports.reverse = reverse;

