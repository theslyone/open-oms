var expressJwt = require('express-jwt');
var secret = 'ewfn09qu43f09qfj94qf*&H#(R';
//var secret = sails.config.secret;

//module.exports = expressJwt({ secret: secret });

/*module.exports =
    expressJwt({
        secret: secret,
        credentialsRequired: false,
        getToken: function fromHeaderOrQuerystring(req) {
            if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
                return req.headers.authorization.split(' ')[1];
            } else if (req.query && req.query.token) {
                return req.query.token;
            }
            return null;
        }
    });
*/

module.exports = function(req, res, next) {
    var token;

    if (req.headers && req.headers.authorization) {
        var parts = req.headers.authorization.split(' ');
        if (parts.length == 2) {
            var scheme = parts[0],
                credentials = parts[1];

            if (/^Bearer$/i.test(scheme)) {
                token = credentials;
            }
        } else {
            return res.json(401, { err: { status: 'danger', message: res.i18n('auth.policy.wrongFormat') } });
        }
    } else if (req.param('token')) {
        token = req.param('token');
        // We delete the token from param to not mess with blueprints 
        delete req.query.token;
    } else {
        return res.json(401, { err: { status: 'danger', message: res.i18n('auth.policy.noAuthorizationHeaderFound') } });
    }

    Auth.verifyToken(token, function(err, decodedToken) {
        if (err)
            return res.json(401, { err: { status: 'danger', message: res.i18n('auth.policy.invalidToken'), detail: err } });

        req.token = decodedToken.sub;

        next();
    });
};
