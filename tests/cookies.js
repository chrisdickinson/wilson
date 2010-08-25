var platoon = require('platoon'),
    wilson = require('wilson'),
    cookies = wilson.cookies,
    Morsel = cookies.Morsel,
    CookieManager = cookies.CookieManager;

exports.TestInstantiation = platoon.unit({},
    function(assert) {
        "Test that Morsels get instantiated with expected fields";
        var randomKey = "rand"+Math.random(),
            randomValue = "rand"+Math.random(),
            morsel = new Morsel(randomKey, randomValue);
        assert.isInstance(morsel, Morsel);
        assert.equal(morsel.key, randomKey);
        assert.equal(morsel.value, randomValue);
        for(var name in Morsel.RESERVED) if(Morsel.RESERVED.hasOwnProperty(name)) {
            assert.equal(morsel.attrs[name], "");
        }
    },
    function(assert) {
        "Test that CookieManagers get instantiated with expected fields";
        var randomFieldDict = {};
        randomFieldDict[Math.random()] = Math.random();
        var manager = new CookieManager(randomFieldDict);
        assert.isInstance(manager, CookieManager);
        assert.strictEqual(manager.morsels, randomFieldDict);

    },
    function(assert) {
        "Test that CookieManagers coerce string input to morsel dict on instantiation";
        var key = ~~(Math.random()*100),
            value = ~~(Math.random()*100),
            randomCookie = [key, value].join('='),
            manager = new CookieManager(randomCookie);
        assert.isInstance(manager, CookieManager);
        assert.isInstance(manager.morsels[key], Morsel);
        assert.equal(manager.morsels[key].value, value);
    }
);

exports.TestMorselMemberFunctions = platoon.unit({},
    function(assert) {
        "Test setValue resets value";
        var key = ~~(Math.random()*100),
            value = ~~(Math.random()*100),
            morsel = new Morsel(key, value),
            randomValue = Math.random();
        morsel.setValue(randomValue);
        assert.equal(morsel.value, randomValue);
    },
    function(assert) {
        "Test setAttribute sets attribute or throws error";
        var key = ~~(Math.random()*100),
            value = ~~(Math.random()*100),
            morsel = new Morsel(key, value),
            randomValue = Math.random();
        for(var name in Morsel.RESERVED) if(Morsel.RESERVED.hasOwnProperty(name)) {
            morsel.setAttribute(name, randomValue);
            assert.equal(morsel.attrs[name], randomValue);
        }
        assert.throws(Error, function() {
            morsel.setAttribute("dne-"+Math.random(), randomValue);
        });
    },
    function(assert) {
        "Test getAsHeader -- make sure attr output is sorted";
        var names = [],
            key = ~~(Math.random()*100),
            value = ~~(Math.random()*100),
            morsel = new Morsel(key, value);

        for(var name in Morsel.RESERVED) if(Morsel.RESERVED.hasOwnProperty(name)) {
            names.push(name);
        }
        names = names.sort(function() {
            return (Math.round(Math.random())-0.5);
        });
        for(var i = 0, len = names.length; i < len; ++i) {
            morsel.setAttribute(names[i], Math.random());
        }
        var header = morsel.getAsHeader(),
            header_parts = header.replace(/^.*?; /, '').split('; ').map(function(item) {
                var originalItem = item.replace(/=.*$/g, '');
                for(var name in Morsel.RESERVED) {
                    if(Morsel.RESERVED[name] === originalItem) {
                        return name;
                    }
                }
            }),
            header_parts_sorted = header_parts.slice().sort();

        header_parts.forEach(function(item, index) {
            assert.equal(item, header_parts_sorted[index]);
        });
    },
    function(assert) {
        "Test getAsHeader -- assert that key and value come out as expected";
        var names = [],
            key = ~~(Math.random()*100),
            value = ~~(Math.random()*100),
            morsel = new Morsel(key, value),
            header = morsel.getAsHeader();
        assert.equal([key, value].join("="), header);
    }
);

exports.TestCookieParsing = platoon.unit({},
    function(assert) {
        "Assert that cookie parsing works as expected";
        var cookieString = "asdf&asdf=lol; $expires=1000; newValue#thing=100; httponly;",
            manager = new CookieManager(cookieString);
        assert.isInstance(manager.morsels['asdf&asdf'], Morsel);
        assert.isInstance(manager.morsels['newValue#thing'], Morsel);
        assert.strictEqual(manager.morsels['$expires'], undefined);
        assert.strictEqual(manager.morsels['httponly'], undefined);
        assert.equal(manager.morsels['asdf&asdf'].attrs['expires'], 1000);
        assert.equal(manager.morsels['newValue#thing'].attrs['httponly'], true);
    }
);

exports.TestCookieManagerMethods = platoon.unit({},
    function(assert) {
        "Test set and get";
        var obj = {},
            randomCookieName = 'cookie-'+Math.random();
        for(var i = 0, len = Math.random()*10+1; i < len; ++i) {
            obj['rand'+Math.random()] = Math.random();
        }
        var manager = new CookieManager({});
        manager.set(randomCookieName, obj);
        assert.isInstance(manager.morsels[randomCookieName], Morsel);
        assert.equal(manager.morsels[randomCookieName].value, escape(JSON.stringify(obj)));
        var output = manager.get(randomCookieName);
        for(var name in output) {
            assert.equal(output[name], obj[name]);
        }
        manager.set(randomCookieName, randomCookieName);
        assert.isInstance(manager.morsels[randomCookieName], Morsel);
        assert.equal(manager.morsels[randomCookieName].value, escape(JSON.stringify(randomCookieName)));
        output = manager.get(randomCookieName);
        assert.equal(output, randomCookieName);
    },
    function(assert) {
        "Test remove cookie sets expires in the past.";
        var obj = {},
            randomCookieName = 'cookie-'+Math.random();
        for(var i = 0, len = Math.random()*10+1; i < len; ++i) {
            obj['rand'+Math.random()] = Math.random();
        }
        var manager = new CookieManager({});
        manager.set(randomCookieName, obj);
        assert.isInstance(manager.morsels[randomCookieName], Morsel);
        manager.remove(randomCookieName);
        assert.ok(manager.morsels[randomCookieName].attrs['expires'] < new Date());
    },
    function(assert) {
        "Test compile returns the appropriate string joined by semicolons and spaces";
        var morsels = {},
            names = [];
        for(var i = 0, len = Math.random()*10+1; i < len; ++i) {
            names.push('random-'+i+'-'+Math.random());
        }
        for(var i = 0, len = names.length; i < len; ++i) {
            morsels[names[i]] = new Morsel(name, Math.random());
        }
        var manager = new CookieManager(morsels),
            compiled = manager.compile(),
            expected = names.map(function(item) {
                return manager.morsels[item].getAsHeader();
            }).join('; ') + ';';
        assert.equal(expected, compiled);
    }
);

