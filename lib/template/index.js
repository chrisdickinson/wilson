var plate = require('plate'),
    importModule = require('wilson/utils/module').importModule,
    Loader = importModule('plate/plugins/loaders/filesystem.Loader'),
    Library = importModule('plate/libraries.Library'),
    urls = require('wilson/template/urls');

var Template = function(raw, libraries, parser) {
    var plugin_library = arguments.callee.getDefaultPluginLibrary();
    libraries = libraries || {};
    libraries.plugin_library = plugin_library;

    return new plate.Template(raw, libraries, parser); 
};

Template.getDefaultPluginLibrary = function() {
    if(arguments.callee._loaded) {
        return arguments.callee._loaded;
    }

    var library = new Library(),
        settings = require('wilson/conf').settings,
        loader = new Loader(),
        loaders = settings.TEMPLATE_LOADERS.map(function(item) {
            return importModule(item)(settings, loader);
        });
    loader.setTemplateCreation(function(str) {
        return new Template(str);
    });

    library.register('loader', loader.getPlugin());
    //library.register('urlresolver', urls.urlResolver);

    arguments.callee._loaded = library;
    return library;
};

var getTemplate = function(templates, callback) {
    templates = templates instanceof Array ? templates : [templates];

    var plugin = Template.getDefaultPluginLibrary().lookup('loader'),
        len = templates.length,
        i = -1,
        eterator = function(err, template) {
            var callee = arguments.callee;
            if(template instanceof plate.Template) {
                callback(null, template);
            } else {
                ++i;
                if(i < len) {
                    setTimeout(function() {
                        plugin(templates[i], callee);
                    }, 0);
                } else {
                    callback(new Error("Could not find any matching templates"), null); 
                }
            }
        };
    eterator();
};

exports.getTemplate = getTemplate;
exports.Template = Template;

