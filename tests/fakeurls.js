var FakeUrlConf = function() {};
FakeUrlConf.prototype.reverse = function() { var last_args = arguments; return function() { return last_args; }; };
exports.patterns = new FakeUrlConf;
