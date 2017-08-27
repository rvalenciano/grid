var express = require('express');
var router = express.Router();
var passport = require('passport');


/* GET home page. */

router.get('/', function (req, res) {
    res.render('login.ejs', { 
        title: 'Grid Login',
        message: req.flash('loginMessage') 
    });
});

router.post('/', passport.authenticate('local-login', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
}));

module.exports = router;
