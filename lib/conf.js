var Settings = function () {

};
Settings.prototype.extend = function(literal) {
    for(var i in literal) if(literal.hasOwnProperty(i)) {
        var target = require(i).settings;
        this[i] = this[i] === undefined ? {'addons':{}, 'values':{} } : this[i];
        for(var value_name in literal[i].values) if(literal[i].values.hasOwnProperty(value_name)) {
            target.set_value(value_name, literal[i].values[value_name]);
            this[i].values[value_name] = literal[i].values[value_name];
        }

        for(var addon_name in literal[i].addons) if(literal[i].addons.hasOwnProperty(addon_name)) {
            target.set_addon(addon_name, literal[i].addons[addon_name]);
            this[i].addons[addon_name] = literal[i].addons[addon_name];
        }
    }
};

exports.settings = new Settings();
