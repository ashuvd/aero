var JWTStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

var User = require('../models/user'),
    config = require('../config');

// Hooks the JWT Strategy.
function hookJWTStrategy(passport) {
  var options = {};

  options.secretOrKey = config.keys.secret;
  options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  options.ignoreExpiration = false;

  passport.use(new JWTStrategy(options, function(JWTPayload, callback) {
    User.findOne({ where: { email: JWTPayload.email } })
			.then(function(user) {
				if(!user) {
					return callback(null, false);
				}
				callback(null, user);
      })
      .catch(function(err) {
        callback(err, false);
      });
  }));
}

module.exports = hookJWTStrategy;