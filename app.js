var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session      = require('express-session');

var passport = require('passport');
var flash = require('connect-flash');

var grid = require('./routes/grid');
var index = require('./routes/index');
var treemap = require('./routes/treemap');
var info = require('./routes/info');
var cobit = require('./routes/cobit');
var users = require('./routes/user');
var profile = require('./routes/profile');
var signup = require('./routes/signup');
var login = require('./routes/login');
var logout = require('./routes/logout');
var user = require('./routes/user');

require('./config/passport')(passport); // pass passport for configuration


var app = express();

var env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';

// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// required for passport
app.use(session({ secret: 'yoursecret' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.use('/grid', grid);
app.use('/', index);
app.use('/treemap', treemap);
//json for cobit data
app.use('/cobit', cobit);
app.use('/info', info);
app.use('/login', login);
app.use('/logout', logout);
app.use('/signup', signup);
app.use('/profile', profile);
app.use('/user', user);



/// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace

if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
      title: 'error'
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
    title: 'error'
  });
});


module.exports = app;
