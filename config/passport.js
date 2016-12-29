var passport = require('passport'),
    crypto = require("crypto"),
    LocalStrategy = require('passport-local').Strategy,
    bcrypt = require('bcrypt-nodejs');

passport.use(new LocalStrategy(
    function(username, password, done) {
        User.find({ userName: username }).exec(function(err, userFound) {
            if (err) {
                sails.log("Error finding user " + err);
                return done(null, err);
            }
            //sails.log(' %d user(s) named ' + username + '.  found', userFound.length, userFound);

            if (!userFound || userFound.length < 1) {
                return done(null, false, {
                    message: 'Incorrect User'
                });
            }
            sails.log("Admin user: " + userFound[0].isAdmin());

            var sha256 = crypto.createHash("sha256");
            sha256.update(password, "utf8"); //utf8 here
            var userpassword = sha256.digest("base64");
            //sails.log("User password: " + userpassword);
            if (userpassword !== userFound[0].password) {
                return done(null, false, {
                    message: 'Invalid Password'
                });
            } else {
                return done(null, userFound);
            }
            /*bcrypt.compare(password, userpassword, function (err, res) {
                if (err || !res) {
                    return done(null, false, {
                        message: 'Invalid Password'
                    });
                } else {
                    return done(null, user);
                }
            });*/
        });
    }));

module.exports = {
    http: {
        customMiddleware: function(app) {
            console.log('Express midleware for passport');
            app.use(passport.initialize());
            app.use(passport.session());
        }
    }
};
