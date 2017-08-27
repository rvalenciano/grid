var express = require('express');
var router = express.Router();
var auth = require('./auth');
var User = require('../models/user');



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

router.post('/update', auth.isLoggedIn, function (req, res) {
  var updateUser = {};
  updateUser.id = req.user._id;
  updateUser.props = {};
  if (req.body.username) {
    updateUser.props.username = req.body.username;
  }
  User.update(updateUser, function (err, user) {
    if (err)
      throw err;
    res.redirect('/profile');
  });
});

/**
 * 		User.getBy('user.username', req.params.username, function (err, user) {
			if (err) return next(err);
			User.getUserRelationships(user._id, function (err, relationships) {
				if (err) return next(err);

				res.render('pages/user', {
					u: req.user,
					user: user,
					relationships: relationships
				});
			});
		});
 */

router.get('/:username', function (req, res) {
  User.getBy('user.username', req.params.username, function (err, user) {
    if (err) return next(err);
    User.getUserRelationships(user._id, function (err, relationships) {
      if (err) return next(err);

      res.render('pages/user', {
        u: req.user,
        user: user,
        relationships: relationships
      });
    });
  });
});

router.post('/:username/:relation', function (req, res) {
  if (!req.user) {
    res.status(401).body({ redirectTo: '/login' });
  }

  User.getBy('user.username', req.params.username, function (err, user) {
    if (err) return next(err);

    User.addUserRelationship(req.params.relation, req.user._id, user._id, function (err, huh) {
      res.status(201).json({ status: 'success' });
    })
  });
});

module.exports = router;


