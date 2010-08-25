// define your models here!

var models = require('../../models');

exports.User = models.model({
    'username':models.CharField({'max_length':255}),
    'first_name':models.CharField({'max_length':255, 'nullable':true, 'blank':true}),
    'last_name':models.CharField({'max_length':255, 'nullable':true, 'blank':true}),
    'email':models.CharField({'max_length':255, 'nullable':true, 'blank':true}),
    'password':models.CharField({'max_length':40}),
    'is_staff':models.BooleanField(),
    'is_active':models.BooleanField(),
    'is_superuser':models.BooleanField(),
    'last_login':models.DateTimeField(),
    'date_joined':models.DateTimeField(),
    'toString':function() {
        return this.username;
    },
    'isAnonymous':function() {
        return false;
    },
    'isAuthenticated':function() {
        return true;
    },
    'getFullName':function() {
        return [this.first_name, this.last_name].join(' ').replace('^\s*','').replace('\s*$','');
    },
});
