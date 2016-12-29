var passport = require("passport");

module.exports = {
    login: function(req, res) {
        passport.authenticate('local', function(err, user, info) {
            if ((err) || (!user) || !user.length) {
                res.send({
                    success: false,
                    message: info.message,//'invalidPassword'
                });
                return;
            } else {
                if (err) {
                    res.send({
                        success: false,
                        message: 'unknownError',
                        error: err
                    });
                } else {
                    var token = Auth.issueToken(user[0], { expiresInMinutes: 60 * 24 });
                    req.session.user = user[0];
                    req.session.cookie.token = token;
                    res.send({
                        success: true,
                        user: user[0],
                        token: token
                    });
                }
            }
        })(req, res);
    },

    logout: function(req, res) {
        req.logout();
        res.send({
            success: true,
            message: 'logout successful'
        });
    },
    _config: {}
};
