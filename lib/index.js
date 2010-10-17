var fs = require('fs'),
    path = require('path'),
    packageJSON = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json')));

exports.VERSION = packageJSON.version.split('.');
