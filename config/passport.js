var User = require('../models/user.js');

module.exports = function (app, passport, LocalStrategy) {
	passport.serializeUser(function(user, done) {
	  done(null, user.id);
	  //Oooohhh serialized
	});

	passport.deserializeUser(function(id, done) {
	  User.findById(id, function(err, user) {
	    done(err, user);
	  });
	});

	// passport.use('local-signup', new LocalStrategy({
	//     // by default, local strategy uses username and password, we will override with email
	//     usernameField : 'email',
	//     passwordField : 'password',
	//     passReqToCallback : true // allows us to pass back the entire request to the callback
	// },function(req, email, password, done) {
	//
	//   process.nextTick(function() {
	//     User.findOne({
	//     'email': email
	//     }, function(err, user) {
	//       // if there are any errors, return the error
	//       if (err)
	//         return done(err);
	//
	//       // check to see if theres already a user with that email
	//       if (user) {
	//         return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
	//       } else {
	//         // if there is no user with that email create the user
	//         var newUser = new User();
	//
	//         // set the user's local credentials
	//         newUser.email = email;
	//         newUser.password = newUser.generateHash(password);
	//
	//         // save the user
	//         newUser.save(function(err) {
	//           if (err)
	//             throw err;
	//           return done(null, newUser);
	//         });
	//       }
	//     }); //End user find
	//   });
	// }));

	passport.use('local-login', new LocalStrategy({
	  // by default, local strategy uses username and password, we will override with email
	  usernameField : 'username',
	  passwordField : 'password',
	  passReqToCallback : true // allows us to pass back the entire request to the callback
	}, function(req, username, password, done) {
	  // find a user whose email is the same as the forms email we are checking to see if the user trying to login already exists
	  User.findOne({ 'username' :  username.toLowerCase() }, function(err, user) {

	    // if there are any errors, return the error before anything else
	    if (err) {
	      console.error(err);
	      return done(err);
	    }

	    // if no user is found, return the message
	    if (!user) {
	      console.log("No user found");
	      return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
	    }

	    // if the user is found but the password is wrong
	    if (!user.validPassword(password)) {
	      console.log("Invalid pass");
	      return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
	    }

	    // all is well, return successful user
	    return done(null, user);
	  });
	}));
}
