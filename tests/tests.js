var includeFile = function(file) {
    var obj = require('./'+file);
    for(var i in obj) if(obj.hasOwnProperty(i)) {
        exports[file + "/" + i] = obj[i];
    }
};

includeFile('application');
includeFile('urls');
