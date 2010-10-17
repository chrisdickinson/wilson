var Script = process.binding('evals').Script,
    path = require('path'),
    fs = require('fs');

var Settings = function(fileName) {
    this.fileName = fileName || process.env['WILSON_SETTINGS_FILE'];
};

Settings.prototype.load = function() {
    var sandbox = {
            require:require,
            exports:{},
            __filename:this.fileName,
            __dirname:path.dirname(this.fileName),
            module:{},
            root:{}
        },
        content = fs.readFileSync(this.fileName, 'utf8'),
        self = this;

    sandbox.global = sandbox;
    Script.runInNewContext(content, sandbox, this.fileName);
    return sandbox.global;
};

var globalSettings = new Settings(path.join(__dirname, 'global_settings.js')),
    settingsFile = 'settings.js',
    loadSettings = function() {
        if(arguments.callee._settings) {
            return arguments.callee._settings;
        }

        var settings = new Settings(settingsFile),
            base_settings = globalSettings.load(),
            extended_settings = settings.load();
        Object.keys(extended_settings).forEach(function(key) {
            base_settings[key] = extended_settings[key];
        });
        arguments.callee._settings = base_settings;
        return base_settings;
    };

exports.Settings = Settings;
exports.globalSettings = globalSettings,
exports.setSettingsFile = function(file) {
    settingsFile = file;
};
exports.setSettings = function(incoming) {
    loadSettings._settings = incoming;    
};

exports.__defineGetter__('settings', loadSettings);
