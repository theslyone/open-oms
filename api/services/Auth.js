var jwt = require('jsonwebtoken');
var secret = process.env.TOKEN_SECRET || sails.config.secret || 'ewfn09qu43f09qfj94qf*&H#(R';


module.exports = {
    issueToken: function(payload, options) {
        var token = jwt.sign(payload, secret, options);
        return token;
    },
    /*verifyToken: function(req, res) {
        if (req.headers.authorization) {
            jwt.verify(req.headers.authorization.replace('Bearer ', ''), secret, function(err, decoded) {
                if (err) return res.send({ success: false });
                if (decoded) {
                    return res.send({ success: true, user: decoded[0] });
                }
            });
        } else {
            return res.send({ success: false });
        }
    },*/
    verifyToken: function(token, callback) {
        return jwt.verify(token, secret, {}, callback);
    }
};
