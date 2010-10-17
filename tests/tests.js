var sys = require('sys');
var includeFile = function(file) {
    try {
        var obj = require('./'+file);
        for(var i in obj) if(obj.hasOwnProperty(i)) {
            exports[file + "/" + i] = obj[i];
        }
    } catch(err) {
        sys.puts("Error in "+file);
        sys.puts(err);
        sys.puts(err.stack);
    }
};

includeFile('application');
includeFile('urls');
includeFile('cookies');
includeFile('utils');
