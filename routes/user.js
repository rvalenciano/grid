var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res) {
  User.getAll(function (err, users) {
    if (err) return next(err);
    res.render('users', {
      User: User,
      users: users,
      username: req.query.username,   // Support pre-filling create form
      error: req.query.error,     // Errors creating; see create route
    });
  });
});

module.exports = router;


