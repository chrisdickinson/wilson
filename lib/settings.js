    var registry = {},
        values = {};

    var set_addon = function(name, target) {
        registry[name] = target;
    };

    var set_value = function(name, target) {
        values[name] = target;
    }; 

    var get_value = function(name) {
        return values[name];
    };

exports.get_value = get_value;
exports.set_value = set_value;
exports.set_addon = set_addon;
