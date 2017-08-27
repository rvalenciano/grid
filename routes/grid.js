var express = require('express');
var router = express.Router();
var fs = require("fs"),
  json;
var appRoot = require('app-root-path');
var auth = require('./auth');



function readJsonFileSync(filepath, encoding) {
  if (typeof (encoding) == 'undefined') {
    encoding = 'utf8';
  }
  var file = fs.readFileSync(filepath, encoding);
  return JSON.parse(file);
}

function getConfig(file) {
  var filepath = appRoot.toString() + '/' + file;
  return readJsonFileSync(filepath);
}

/* GET home page. */

router.get('/', auth.isLoggedIn, function (req, res) {
  var cobit = getConfig('config/cobit.json');
  res.render('grid', {
    cobit: cobit,
    title: 'Grid'
  });
});


module.exports = router;
