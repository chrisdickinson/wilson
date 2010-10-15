var platoon = require('platoon'),
    getModulePath = require('wilson/utils/module').getModulePath,
    sys = require('sys'),
    fs = require('fs'),
    path = require('path');

exports.TestOfGetModulePath = platoon.unit({},
    function(assert) {
        "getModulePath returns the full path to a given module";
        var module = 'wilson',
            testPath = getModulePath(module);

        assert.strictEqual(require(module), require(testPath));
    }
);
