// define your models here!

var models = require('../../models'),
    settings = require('../../settings'),
    Buffer = require('buffer').Buffer,
    crypto = require('crypto');

exports.Session = models.model({
    'session_key':models.CharField({'max_length':40, primary_key:true}),
    'session_data':models.TextField(),
    'expire_date':models.DateTimeField(),
    'get_encoded':function(data) {
        var pickled = JSON.stringify(data),
            md5 = crypto.createHash('md5').update(pickled + settings.get_value('SECRET_KEY')).digest('hex'),
            result = new Buffer(pickled + md5, 'utf8').toString('base64');
        return result;
    },
    'get_decoded':function() {
        var encodedData = (new Buffer(this.session_data, 'base64')).toString('utf8'),
            pickled = encodedData.slice(0, -32),
            tamperCheck = encodedData.slice(-32),
            md5sum = crypto.createHash('md5').update(pickled + settings.get_value('SECRET_KEY')).digest('hex');
        if(md5sum !== tamperCheck) {
            throw new Error("User tampered with session cookie.");
        } else {
            try {
                return JSON.parse(pickled);
            } catch(err) {
                return {};
            }
        }
    }
});

/*
exports.ModelName = models.model({
    'title':models.CharField({'max_length':255}),
    'author':models.ForeignKey(models.dep('auth', 'User'), {'related_name':'modelname_set'}),
    Meta: {
        'ordering':'title'
    }
});
*/
