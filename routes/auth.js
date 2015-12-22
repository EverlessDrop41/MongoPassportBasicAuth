var User = require('../models/user.js');

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

 	// process the signup form
  // app.post('/signup', passport.authenticate('local-signup', {
  //     successRedirect : '/profile', // redirect to the secure profile section
  //     failureRedirect : '/register', // redirect back to the signup page if there is an error
  //     failureFlash : true // allow flash messages
  // }));

  app.post('/login', function (req, res, next) {
		console.log(req.body);
		next();
  }, passport.authenticate('local-login', {
	  successRedirect : '/profile', // redirect to the secure profile section
	  failureRedirect : '/login', // redirect back to the signup page if there is an error
	  failureFlash : true // allow flash messages
  }));
	//
	// app.post('/login', function(req, res, next) {
  // passport.authenticate('local-login', function(err, user, info) {
	//     if (err) return next(err)
	//     if (!user) {
	//       return res.redirect('/login')
	//     }
	//     req.logIn(user, function(err) {
	//       if (err) return next(err);
	//       return res.redirect('/');
	//     });
	//   })(req, res, next);
	// });

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
}
