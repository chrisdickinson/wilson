
exports.getModulePath = function(moduleName) {
    try { 
        var exp = require(moduleName),
            cache = require.cache || module.moduleCache;
            keys = Object.keys(cache);

        // unfortunately we can't use Array.forEach here as it seems
        // to screw with the '===' identity function.
        for(var i = 0, len = keys.length, found = false; i < len && !found; ++i) {
            found = cache[keys[i]].exports === exp ? keys[i] : false; 
        }
        return found || null;
    } catch(err) {
        return null;
    }
};

exports.importModule = function(path) {
    var split = path.split('.'),
        mod = require(split.shift());
    while(split.length) {
        mod = mod[split.shift()];
    }
    return mod;
};

