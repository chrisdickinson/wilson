var platoon = require('platoon'),
    urls = require('wilson/urls'),
    application = require('wilson/application'),
    escaperoute = require('escaperoute'),
    conf = require('wilson/conf'),
    url = escaperoute.url;

exports.TestBadUrlConf = platoon.unit({},
    function(assert) {
        "Throws an error when trying to use a bad root URLConf";
        conf.setSettings({
            'ROOT_URLCONF':'dne.dne.dne'
        });


        assert.throws(Error, function() {
            urls.getRoot();
        });

        conf.setSettings({
            'ROOT_URLCONF':undefined
        });
    },
    function(assert) {
        "Throws an error when root_urlconf is undefined";
        assert.throws(Error, function() {
            urls.getRoot();
        });
    }
);

exports.TestReverseTriggersRootUrlConfReverse = platoon.unit({},
    function(assert) {
        "Reverse delegates to root_urlconf.reverse";
        conf.setSettings({
            'ROOT_URLCONF':'tests/fakeurls.patterns'
        });

        var randomName = Math.random(),
            randomValues = [Math.random(), Math.random()],
            reversed = urls.reverse(randomName, randomValues);
        assert.isInstance(reversed, Function);
        var values = reversed();
        assert.equal(randomName, values[0]);
        assert.equal(randomValues[0], values[1][0]);
        assert.equal(randomValues[1], values[1][1]);
        conf.setSettings({
            'ROOT_URLCONF':undefined
        });
    }
);

exports.UrlsAppWillWrapAppUrls = platoon.unit({},
    function(assert) {
        "urls.app should grab the appropriate app instance and update it's child routes appropriately";
        var randomName = 'random'+Math.random(),
            routes = escaperoute.routes('',
                url('^awesome/$', function() {
                    assert.isInstance(this, application.ApplicationInstance);
                }, randomName)
            ),
            app = application.app({
                'urls':routes,
            }),
            appInstance = app.instantiate(randomName, app),
            result = urls.app('something/', Math.random(), appInstance); 
        assert.isInstance(result, escaperoute.Route);
        assert.isInstance(result.target, escaperoute.Router);
        assert.strictEqual(result.target, appInstance.urls);
        assert.isInstance(appInstance.urls, escaperoute.Router);
        assert.equal(appInstance.urls.routes[0].name, [randomName, randomName].join(':'));
        result.target.match('awesome/')();
    }
);

exports.testView = function() {
    return this.triggeredValue;
};

exports.UrlsWrap = platoon.unit({},
    function(assert) {
        "Test that wrap returns a function that will call the original function in the context of an appInstance";
        var randomAppName = 'app-'+Math.random(),
            expected = Math.random();
        application.setApplicationInstance(randomAppName, {
            'triggeredValue':expected
        });
        var result = urls.wrap('tests/urls.testView', randomAppName);
        assert.isInstance(result, Function);
        result = result();
        assert.equal(expected, result);
    }
);
