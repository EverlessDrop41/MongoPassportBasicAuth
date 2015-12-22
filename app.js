var express = require('express');
var logger = require('morgan');
var nunjucks = require('nunjucks');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');
var nunjucks = require('nunjucks');
var mongoose = require('mongoose');
var flash = require('connect-flash');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var app = express();

app.set('view engine', 'nunjucks');

var nEnv = nunjucks.configure('templates', {
    autoescape: false,
    noCache: true,
    express: app
});

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('public'));
app.use(flash());

app.locals.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/');
}

app.locals.isNotLoggedIn = function(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }

  res.redirect('/');
}

// required for passport
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

require('./config/passport.js')(app, passport, LocalStrategy);

// mongoose
mongoose.connect('mongodb://localhost/passport-tut');

require('./routes/index.js')(app);
require('./routes/auth.js')(app, passport, LocalStrategy);

var server = app.listen(process.env.PORT || 3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});