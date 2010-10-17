var platoon = require('platoon'),
    application= require('wilson/application'),
    models = require('wilson/models');

exports.TestSelectionFunctions = platoon.unit({},
    function(assert) {
        "Selection functions return functions that take application instances";
        var randomTag = 'rand-'+Math.random();
        assert.isInstance(application.any(randomTag), Function);
        assert.isInstance(application.primary(randomTag), Function);
        assert.isInstance(application.specific(randomTag), Function);
    },
    function(assert) {
        "Primary returns app instance if it is marked as primary and has the appropriate tag";
        var randomTag = 'rand-'+Math.random(),
            mockObject = {
                'isPrimary':true,
                'app':{
                    'provides':[randomTag],
                }
            };
        assert.strictEqual(mockObject, application.primary(randomTag)(mockObject));
    },
    function(assert) {
        "Primary returns undefined if an app instance does not provide the tag";
        var randomTag = 'rand-'+Math.random(),
            otherTag = 'otherrand-'+Math.random(),
            mockObject = {
                'isPrimary':true,
                'app':{
                    'provides':[randomTag],
                }
            };
        assert.strictEqual(undefined, application.primary(otherTag)(mockObject));
    },
    function(assert) {
        "Primary returns undefined if an app instance provides the correct tag but is not marked as primary";
        var randomTag = 'rand-'+Math.random(),
            mockObject = {
                'app':{
                    'provides':[randomTag],
                }
            };
        assert.strictEqual(undefined, application.primary(randomTag)(mockObject));
    },
    function(assert) {
        "Any returns an app instance if an app provides the correct tag";
        var randomTag = 'rand-'+Math.random(),
            mockObject = {
                'app':{
                    'provides':[randomTag],
                }
            };
        assert.strictEqual(mockObject, application.any(randomTag)(mockObject));
    },
    function(assert) {
        "Any returns undefined if the app does not provides the correct tag";
        var randomTag = 'rand-'+Math.random(),
            otherTag = 'otherrand-'+Math.random(),
            mockObject = {
                'app':{
                    'provides':[randomTag],
                }
            };
        assert.strictEqual(undefined, application.any(otherTag)(mockObject));
    },
    function(assert) {
        "Specific returns an app that is specifically named, regardless of tag";
        var randomTag = 'rand-'+Math.random(),
            randomName = 'otherrand-'+Math.random(),
            mockObject = {
                'name':randomName,
                'app':{
                    'provides':[randomTag],
                }
            };
        assert.strictEqual(mockObject, application.specific(randomName)(mockObject));
        mockObject.name = Math.random() + "NOOO";
        assert.strictEqual(undefined, application.specific(randomName)(mockObject));
    }
);

exports.TestAppCreation = platoon.unit({},
    function(assert) {
        "application.app returns an instance of Application with opts";
        var options = {};
        for(var i = 0, len = Math.random()*10+1; i < len; ++i) {
            options['random'+i] = i;
        }
        var app = application.app(options);
        assert.isInstance(app, application.Application);
        for(var name in options) {
            assert.equal(options[name], app[name]);
        }
    },
    function(assert) {
        "application.app.instantiate returns a new named ApplicationInstance";
        var options = {},
            randomName = 'random'+Math.random();
        for(var i = 0, len = Math.random()*10+1; i < len; ++i) {
            options['random'+i] = i;
        }
        var app = application.app(options),
            appInstance = app.instantiate(randomName);

        assert.isInstance(appInstance, application.ApplicationInstance);
        assert.equal(appInstance.name, randomName);
        assert.strictEqual(appInstance.app, app);
    },
    function(assert) {
        "ApplicationInstance.resolveAppDependency returns an app out of an object_literal if the matching function okays it";
        var randomTag = 'random'+Math.random(),
            app_dict = {
                'app1':application.app({'provides':[randomTag]}).instantiate('app1')
            },
            appInstance = application.app({}).instantiate(Math.random()),
            result = appInstance.resolveAppDependency(application.any(randomTag), app_dict);
        assert.strictEqual(app_dict.app1, result);
    },
    function(assert) {
        "ApplicationInstance.resolveAppDependency throws an error if it cannot find an appropriate app";
        var randomTag = 'random'+Math.random(),
            app_dict = {
                'app1':application.app({'provides':[randomTag]}).instantiate('app1')
            },
            appInstance = application.app({}).instantiate(Math.random());
        assert.throws(Error, function() {
            appInstance.resolveAppDependency(application.primary(randomTag), app_dict);
        });
    },
    function(assert) {
        "ApplicationInstance.setupForwardDependencies adds resolver functions to external apps";
        var randomTag = 'random'+Math.random(),
            randomName = 'randomName'+Math.random(),
            externalApps = {};

        externalApps[randomName] = application.any(randomTag);

        var app_dict = {
                'app1':application.app({'provides':[randomTag]}).instantiate('app1')
            },
            externalApps
            ourAppOptions = {
                'external_apps':externalApps,
                'models':{'FakeModel':models.model({'someDep':models.ForeignKey(models.dep(randomName, randomName))})}
            };
            app = application.app(ourAppOptions),
            appInstance = app.instantiate(randomName+Math.random());

        appInstance.setupForwardDependencies(app_dict);

        assert.equal(app_dict.app1.resolvers[randomName].length, 1);
        assert.isInstance(app_dict.app1.resolvers[randomName][0], Function);

        var randomResult = Math.random();

        app_dict.app1.resolvers[randomName][0](randomResult);

        // now this is quite a reach...
        assert.equal(appInstance.app.models.FakeModel.opts.someDep.dependency.model, randomResult);
    },
    function(assert) {
        "ApplicationInstance.resolveModels turns models into instances of pieshop.resource";
        var randomTag = 'random'+Math.random(),
            randomName = 'randomName'+Math.random(),
            ourAppOptions = {
                'models':{'FakeModel':models.model({'field':models.CharField({'max_length':255})})}
            };
            app = application.app(ourAppOptions),
            appInstance = app.instantiate(randomName+Math.random());
        appInstance.resolveModels();
        assert.isInstance(appInstance.models.FakeModel, [Object]);
        assert.ok(appInstance.models.FakeModel.prototype._meta);
        assert.equal(appInstance.models.FakeModel.prototype._meta.opts.table, [appInstance.name.toLowerCase(), 'fakemodel'].join('_'));

    },
    function(assert) {
        "ApplicationInstance.resolveModels triggers any resolvers with the name of an instantiated model class";
        var randomTag = 'random'+Math.random(),
            randomName = 'randomName'+Math.random(),
            ourAppOptions = {
                'models':{'FakeModel':models.model({'field':models.CharField({'max_length':255})})}
            };
            app = application.app(ourAppOptions),
            appInstance = app.instantiate(randomName+Math.random()),
            trigger = 0;
        appInstance.resolvers = {
            'FakeModel':[function(model) {
                assert.strictEqual(appInstance.models.FakeModel, model);
                ++trigger;
            }]
        };
        appInstance.resolveModels();
        assert.equal(trigger, 1);
    }
);
