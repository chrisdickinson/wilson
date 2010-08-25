
exports.SessionMiddleware = {
    'processRequest':function(request) {
        var sessionBackend = this.settings.backend,
            cookieName = this.settings.cookie_name,
            session_key = request.COOKIES.get(cookieName);

        request.session = new sessionBackend(session_key, this);
        request.session.getSession(function() {
            request.attemptContinue();
        });
    },
    'processResponse':function(request) {
        var accessed = request.session.accessed,
            modified = request.session.modified,
            cookieName = this.settings.cookie_name;

        if(accessed !== undefined && modified !== undefined) {
            if(accessed) {
                request.session.patchVaryHeaders(request.response, ['Cookie']);
            }
            if(modified || this.settings.save_every_request) {
                var options = {
                    'path':this.settings.cookie_path,
                };
            
                if(this.settings.cookie_secure) {
                    options['secure'] = true;
                }
                if(false && request.session.get_expire_at_browser_close()) {
                    options['max-age'] = null;
                    options['expires'] = null;
                } else {
                    options['max-age'] = request.session.get_expiry_age();
                    options['expires'] = request.session.get_expiry_date();
                }
                request.session.save(function() {
                    request.COOKIES.set(cookieName, request.session.session_key, options); 
                    request.attemptContinue();
                });
            } else {
                request.attemptContinue();
            } 
        } else {
            request.attemptContinue();
        }
    }
};
