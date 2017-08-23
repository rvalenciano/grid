var express = require('express');
var router = express.Router();
var fs = require("fs"),
  json;
var appRoot = require('app-root-path');


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

function find(array, name) {
  if (typeof array != 'undefined') {
    for (var i = 0; i < array.length; i++) {
      if (array[i].name == name) return [name];
      var a = find(array[i].children, name);
      if (a != null) {
        a.unshift(array[i].name);
        return a;
      }
    }
  }
  return null;
}

/* GET home page. */

router.get('/', function (req, res) {
  res.render('treemap', {
    title: 'Cobit',
    path: JSON.stringify([]),
    name: undefined,
    description: undefined,
    percentage: undefined,
    category: undefined
  });
});

router.post('/', function (req, res) {
  cobit = getConfig('config/cobit.json');
  var path = [];
  // We push root
  path = find(cobit.children, req.body.category);
  console.log(path);
  // Wwe build the path to show. The path will be an array.
  res.render('treemap', {
    title: 'Cobit',
    path: JSON.stringify(path),
    name: req.body.name,
    description: req.body.description,
    percentage: req.body.percentage,
    category: req.body.category
  });
});

module.exports = router;
