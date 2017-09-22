var express = require('express');
var router = express.Router();
var auth = require('./auth');


/* GET home page. */

router.get('/', auth.isLoggedIn, function (req, res) {
  res.render('admin', {
    title: 'Admin',
    user: req.user
  });
});

module.exports = router;
