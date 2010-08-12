var platoon = require('platoon'),
    wilson = require('wilson'),
    urls = wilson.urls,
    escaperoute = require('escaperoute'),
    url = escaperoute.url;

exports.TestBadUrlConf = platoon.unit({},
    function(assert) {
        "Throws an error when trying to use a bad root URLConf";
        wilson.settings.set_value('root_urlconf', 'dne.dne.dne');
        assert.throws(Error, function() {
            urls.getRoot();
        });
        wilson.settings.set_value('root_urlconf', undefined);
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
        wilson.settings.set_value('root_urlconf', 'tests/fakeurls.patterns');
        var randomName = Math.random(),
            randomValues = [Math.random(), Math.random()],
            reversed = urls.reverse(randomName, randomValues);
        assert.isInstance(reversed, Function);
        var values = reversed();
        assert.equal(randomName, values[0]);
        assert.equal(randomValues[0], values[1][0]);
        assert.equal(randomValues[1], values[1][1]);
        wilson.settings.set_value('root_urlconf', undefined);
    }
);

exports.UrlsAppWillWrapAppUrls = platoon.unit({},
    function(assert) {
        "urls.app should grab the appropriate app instance and update it's child routes appropriately";
        var randomName = 'random'+Math.random(),
            routes = escaperoute.routes('',
                url('^awesome/$', function() {
                    assert.isInstance(this, wilson.application.ApplicationInstance);
                }, randomName)
            ),
            app = wilson.application.app({
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


