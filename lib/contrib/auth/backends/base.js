var BaseBackend = function(name, kwargs) {
    this.name = name;
    for(var item in kwargs) if(kwargs.hasOwnProperty(item)) {
        this[item] = kwargs[item];
    }
};

BaseBackend.extend = function(name, kwargs) {
    return new BaseBackend(name, kwargs);
};

exports.BaseBackend = BaseBackend;
