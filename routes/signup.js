var express = require('express');
var router = express.Router();
var passport = require('passport');


/* GET home page. */

router.get('/', function (req, res) {
    res.render('signup.ejs', { 
        message: req.flash('loginMessage'), 
        title: 'Grid Sign Up'
    });
});

// process the signup form
router.post('/', passport.authenticate('local-signup', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
}));

module.exports = router;
