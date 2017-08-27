var express = require('express');
var router = express.Router();
var passport = require('passport');

var auth = require('./auth');

/* GET home page. */
router.get('/', auth.isLoggedIn, function (req, res) {
    res.render('profile.ejs', {
        user: req.user,
        title: 'Grid Profile',
        message: req.flash('connectMessage')
    });
});

module.exports = router;
