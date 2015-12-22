var User = require('../models/user.js');
var async = require('async');
var crypto = require('crypto');

var sendgrid = require('sendgrid')("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");

module.exports = function (app, passport, LocalStrategy) {

	app.get('/login', function (req, res) {
		res.render('login', { message: req.flash('loginMessage') });
	});

	app.get('/register', function (req, res) {
		res.render('register', { message: req.flash('signupMessage') });
	});

	app.get('/profile', app.locals.isLoggedIn, function (req, res) {
		res.render('profile', {
      user : req.user // get the user out of session and pass to template
    });
	});

	app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  app.post('/login', function (req, res, next) {
		console.log(req.body);
		next();
  }, passport.authenticate('local-login', {
	  successRedirect : '/profile', // redirect to the secure profile section
	  failureRedirect : '/login', // redirect back to the signup page if there is an error
	  failureFlash : true // allow flash messages
  }));

	app.post('/signup', function(req, res) {
		var newUser = new User();

	  // set the user's local credentials
		newUser.username = req.body.username.toLowerCase()
	  newUser.email = req.body.email;
	  newUser.password = newUser.generateHash(req.body.password);

	  newUser.save(function(err) {
			if (err) {
				req.flash('signupMessage', 'Error signing up: ' + err);
				res.redirect('/register');
			} else {
				req.flash('loginpMessage', 'Successfully signed up, you can now login');
		    res.redirect('/login');
			}
	  });
	});

	app.get('/forgot', function(req, res) {
		// success = req.flash("success");
		// error = req.flash("error");
		// info = req.flash("info");
	  res.render('forgot', {
	    user: req.user,
			messages: {
				success: req.flash("success"),
				error: req.flash("error"),
				info: req.flash("info")
			}
	  });
	});

	app.post('/forgot', function(req, res, next) {
	  async.waterfall([
	    function(done) {
	      crypto.randomBytes(20, function(err, buf) {
	        var token = buf.toString('hex');
	        done(err, token);
	      });
	    },
	    function(token, done) {
	      User.findOne({ email: req.body.email }, function(err, user) {
	        if (!user) {
	          req.flash('error', 'No account with that email address exists.');
	          return res.redirect('/forgot');
	        }

	        user.resetPasswordToken = token;
	        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

	        user.save(function(err) {
	          done(err, token, user);
	        });
	      });
	    },
	    function(token, user, done) {
				var email = new sendgrid.Email({
					to: user.email,
					from: 'passwordreset@demo.com',
					subject: 'Node.js password reset',
					text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
		          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
		          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
		          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
				});

				sendgrid.send(email, function(err, json) {
		      if (err) { return console.error(err); }
					req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
	        done(err, 'done');
		    });
	    }
	  ], function(err) {
	    if (err) return next(err);
	    res.redirect('/forgot');
	  });
	});

	app.get('/reset/:token', function(req, res) {
	  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
	    if (!user) {
	      req.flash('error', 'Password reset token is invalid or has expired.');
	      return res.redirect('/forgot');
	    }
	    res.render('reset', {
	      user: req.user
	    });
	  });
	});

	app.post('/reset/:token', function(req, res) {
		console.log("Post reset token/" + req.params.token);
	  async.waterfall([
	    function(done) {
				console.log("About to find user");
	      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
					console.log("Found user: " + user);
	        if (!user) {
	          req.flash('error', 'Password reset token is invalid or has expired.');
	          return res.redirect('back');
	        }

	        user.password = user.generateHash(req.body.password);
	        user.resetPasswordToken = undefined;
	        user.resetPasswordExpires = undefined;

	        user.save(function(err) {
	          req.logIn(user, function(err) {
	            done(err, user);
	          });
	        });
	      });
	    },
	    function(user, done) {
				var email = new sendgrid.Email({
	        to: user.email,
	        from: 'passwordreset@demo.com',
	        subject: 'Your password has been changed',
	        text: 'Hello,\n\n' +
	          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
	      });

				sendgrid.send(email, function(err, json) {
		      if (err) { return console.error(err); }
					req.flash('success', 'Your password has been changed!');
	        done(err, 'done');
		    });
	    }
	  ], function(err) {
	    res.redirect('/');
	  });
	});
}
