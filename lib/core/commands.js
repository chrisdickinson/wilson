
exports.runserver = function(listen) {
    var serverFunction = require('wilson/servers').getServerFunction(),
        createServer = require('http').createServer;
    createServer(serverFunction).listen(parseInt(listen, 10));
};

exports.syncdb = function() {
    var application = require('wilson/application'),
        appInstances = application.getApplicationInstances(),
        pieshop = require('pieshop'),
        backend = pieshop.settings.get_addon('backend'),
        sys = require('sys');

    var table_creations = [],
        deferred = [];

    for(var app_name in appInstances) {
        var app = appInstances[app_name];
        for(var model_name in app.models) {
            var model = app.models[model_name];

            var table_fields = [];
            for(var field_name in model.prototype._meta.fields) {
                var backendField = model.prototype._meta.get_field_by_name(field_name).getBackendField(backend),
                    column = backendField.getColumn(field_name),
                    deferredConstraint = backendField.getConstraint(),
                    databaseRepr = backendField.databaseRepresentation();

                table_fields.push([column, databaseRepr].join(' '));
                if(deferredConstraint) {
                    deferred.push(deferredConstraint);
                }
            }
            table_creations.push('CREATE TABLE '+model.prototype._meta.opts.table + '(\n\t' + table_fields.join(',\n\t') + '\n)')+';'; 
        }
    }
    sys.puts(table_creations.join(';\n')+';\n');
    sys.puts(deferred.join(';\n')+';\n');
};

var copyTemplateDir = function(dir, name, context) {
    var fs = require('fs'),
        path = require('path'),
        srcDir = path.join(fs.realpathSync(__dirname), 'codetemplates', dir),
        ls = require('child_process').spawn('ls', [srcDir]),
        sys = require('sys'),
        template = require('wilson/template');

    ls.stdout.addListener('data', function(data) {
        var items = data.toString().split('\n').slice(0, -1),
            getTarget = function(filename) { 
                return [process.cwd(), name, filename].join('/');
            },
            getSrc = function(filename) {
                return path.join(srcDir, filename);
            };

        var createWriteFile = function(index) {
            return function(err, data) {
                var filename = getTarget(items[index]),
                    tpl = new template.Template(data.toString());

                tpl.render(context, function(err, data) {
                    fs.writeFile(filename, data, function() {
                        sys.puts('created '+items[index]);
                        if (/manage$/(filename)) {
                            fs.chmod(filename, 0755);
                        }
                    });
                });
            };
        };

        fs.mkdir(path.join(process.cwd(), name), 0755, function(err) {
            if(!err) {
                for(var i = 0, len = items.length; i < len; ++i) {
                    fs.readFile(getSrc(items[i]), createWriteFile(i));
                }
            }
        });
    });
};

exports.startproject = function(name) {
    var crypto = require('crypto'),
        secret_key = crypto.createHash('md5').update(Math.random()+Date.now()).digest('hex');

    copyTemplateDir('project', name, {
        'project_name':name,
        'SECRET_KEY':secret_key
    });
};

exports.startapp = function(name) {
    copyTemplateDir('app', name, {
        'app_name':name
    });
};
