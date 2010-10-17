var shortcuts = require('wilson/shortcuts'),
    http = require('wilson/http'),
    utils = require('wilson/contrib/auth/utils'),
    renderToResponse = shortcuts.renderToResponse,
    getObjectOr404 = shortcuts.getObjectOr404;

exports.login = function(request, kwargs) {
    kwargs = kwargs || {};

    var self = this,
        defaults = {
            redirect_key:'next',
            auth_form:'auth/login.html',
        };

    Object.keys(defaults).forEach(function(key) {
        kwargs[key] = kwargs[key] || defaults[key];
    });

    if(request.method == 'POST') {
        var credentials = {
            'username':request.POST.username,
            'password':request.POST.password
        };
        utils.authenticate(this, credentials, function(backend, user) {
            if(user === undefined || user instanceof utils.AnonymousUser) {
                renderToResponse(request)(kwargs.auth_form, {
                    'errors':'Could not log you in',
                });
            } else {
                var redirect_to = request.GET[kwargs.redirect_key] || '/';
                request.session.set(utils.get_session_backend(self), backend.name);
                request.session.set(utils.get_session_key(self), user.id);
                request.respond(new http.HttpResponseRedirect(redirect_to));

            }
        });
    } else {
        renderToResponse(request)(kwargs.auth_form, {});
    }
};
