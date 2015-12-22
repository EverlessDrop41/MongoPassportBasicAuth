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
  app.post('/signup', passport.authenticate('local-signup', {
      successRedirect : '/profile', // redirect to the secure profile section
      failureRedirect : '/register', // redirect back to the signup page if there is an error
      failureFlash : true // allow flash messages
  }));

  app.post('/login', passport.authenticate('local-login', {
	  successRedirect : '/profile', // redirect to the secure profile section
	  failureRedirect : '/login', // redirect back to the signup page if there is an error
	  failureFlash : true // allow flash messages
  }));
}