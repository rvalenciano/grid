var express = require('express');
var router = express.Router();

/* GET home page. */

router.get('/', function (req, res) {
  res.render('info', {
    title: 'Info'
  });
});

module.exports = router;
