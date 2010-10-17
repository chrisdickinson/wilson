var BaseStore = require('wilson/contrib/sessions/backends/base').SessionStore;

exports.SessionStore = BaseStore.extend({
    'load':function(callback) {
        var self = this;
        this.appInstance.models.Session.objects.filter({session_key:this.session_key}).all(function(objects, err) {
            if(err || objects.length < 1) {
                callback({});
            } else {
                this._sessionCache = self.decode(objects[0].session_data);
                callback(this._sessionCache);
            }
        });
    },
    'exists':function(session_key, callback) {
        this.appInstance.models.Session.objects.filter({'session_key__exact':session_key}).all(function(objects, err) {
            callback(!err && objects && objects.length > 0); 
        });
    },
    'create':function(callback) {
        var self = this;
        var recursive = function(key) {
            var callee = arguments.callee;
            self.appInstance.models.Session.objects.filter({session_key:key}).all(function(objects, err) {
                if(!err && objects.length < 1) {
                    self.appInstance.models.Session.objects.create({
                        session_key:key,
                        session_data:"{}",
                        expire_date:null
                    }, function(obj) {
                        self.modified = true;
                        self._sessionCache = {};
                        callback();
                    });
                } else {
                    callee(self.getNewSessionKey());
                }
            });
        };
    },
    'save':function(callback, mustCreate) {
        var creation_kwargs = {
            'session_key': this.session_key,
            'session_data': this.encode(this._sessionCache),
            'expire_date': this.get_expiry_date()
        }, Session = this.appInstance.models.Session;

        Session.objects.filter({session_key:this.session_key}).all(function(objs, err) {
            if(!err && objs.length > 0 && mustCreate) {
                callback(null, new Error("Could not create"));
            } else {
                if(objs.length > 0) {
                    for(var name in creation_kwargs) {
                        objs[0][name] = creation_kwargs[name];
                    }
                    objs[0].save(function(obj, err) {
                        callback(obj, err);
                    });
                } else {
                    Session.objects.create(creation_kwargs, function(obj, err) {
                        callback(obj, err);    
                    });
                }
            }
        });
    },
    'delete':function(callback, session_key) {
        session_key = session_key || this._session_key;
        if(session_key === null || session_key === undefined) {
            return;
        }
        this.appInstance.models.Session.objects.filter({session_key:session_key}).delete(function(err) {
            callback(err);
        });        
    }
});

