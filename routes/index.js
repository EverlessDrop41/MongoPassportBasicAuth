module.exports = function (app) {
	app.get('/', function(req, res) {
    res.render('index', {
      user : req.user, // get the user out of session and pass to template
			messages: {
				success: req.flash("success"),
				error: req.flash("error"),
				info: req.flash("info")
			}
    });
  });
}
