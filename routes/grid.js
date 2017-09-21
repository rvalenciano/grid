var express = require('express');
var router = express.Router();
var fs = require("fs"),
  json;
var appRoot = require('app-root-path');
var auth = require('./auth');
var async = require('async');


var Grid = require('../models/grid');


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
  var grids = [];
  var cobit = getConfig('config/cobit.json');
  var grid = JSON.stringify({ nodes: [], edges: [] });
  Grid.loadHeaderNodes(req.user._id, function (err, loadedGrids) {
    res.render('grid', {
      cobit: cobit,
      user: req.user,
      grid: grid,
      grids: JSON.stringify(loadedGrids),
      errors: '',
      successes: '',
      name: 'Unsaved grid!',
      title: 'Grid'
    });
  });

});

router.post('/load', auth.isLoggedIn, function (req, res) {
  var grids = [];
  var cobit = getConfig('config/cobit.json');
  var grid = { nodes: [], edges: [] };
  var selectedHeaderNode = req.body.gridsSelect;
  Grid.loadHeaderNodes(req.user._id, function (err, loadedGrids) {
    Grid.loadGrid(selectedHeaderNode, function (err, loadedGrid) {
      grid.nodes = loadedGrid.map(function (node) {
        if (node.node) {
          return node.node.properties;
        }

      });

      grid.edges = loadedGrid.filter(function (edge) {
        if (edge.r && edge.r.type == 'uses') {
          return true;
        }
        else {
          return false;
        }
      }).map(function (edge) {
        return edge.r.properties;
      }).filter((elem, pos, arr) => {
        return arr.indexOf(elem.id) == pos;
      });

      console.log('PROCESSED GRID EDGES', grid.edges);

      /*     grid.edges.forEach(function (edge) {
             if (!this[edge.name]) {
               this[a.name] = { name: a.name, contributions: 0 };
               result.push(this[a.name]);
             }
             this[a.name].contributions += a.contributions;
           }, Object.create(null));
     */

      res.render('grid', {
        cobit: cobit,
        user: req.user,
        grid: JSON.stringify(grid),
        grids: JSON.stringify(loadedGrids),
        errors: req.flash('error', ''),
        successes: req.flash('success', ''),
        name: selectedHeaderNode,
        title: 'Grid'
      });
    });
  });

});

router.post('/', auth.isLoggedIn, function (req, res, next) {
  /**console.log('Current user', req.user);
  console.log('Grid', req.body.grid);
  
   * We proceed to create the nodes and the edges
   * 
   */

  var cobit = getConfig('config/cobit.json');
  var existingGrid = req.body.grid;
  var responseGrid = {nodes: [], edges: []};
  var response = {};



  Grid.loadHeaderNodes(req.user._id, function (err, loadedGrids) {
    Grid.deleteExistingGraph(req.body.name, function (err) {

      var response = {
        cobit: cobit,
        grid: responseGrid,
        grids: JSON.stringify(loadedGrids),
        user: req.user,
        name: '',
        errors: '',
        successes: '',
        title: 'Grid'
      }

      var onComplete = function () {
        res.render('grid', response);
      }

      if (err) {
        console.error(err.stack);
        message = 'Error saving grid!';
        res.render('grid', response);
      }

      Grid.create(req.body.name, req.user.properties.username, function (err, grid) {
        var message = 'Grid successfully saved!';
        response.name = grid.properties.name;
        if (err) {
          console.error(err.stack);
          message = 'Error saving grid!';

        }
        Grid.addUserRelationship('creates', grid._id, req.user._id, function (err) {
          if (err) {
            console.error(err.stack);
            message = 'Error saving grid!';
            res.render('grid', response);
          }
          if (JSON.parse(existingGrid).nodes && JSON.parse(existingGrid).nodes.length > 0) {
            console.log('Going to create nodes');
            /**
             * We proceed to create the nodes
             */
            Grid.createGraph(JSON.parse(existingGrid), grid._id, function (objNode) {
              if (objNode.result) {
                console.log('Returned from createGraph with true');
                console.log('JSON.parse(existingGrid).edges', JSON.parse(existingGrid).edges);
                //if(false) {
                responseGrid.nodes = objNode.nodes;
               if (JSON.parse(existingGrid).edges.length > 0) {
                  Grid.createGraphEdges(JSON.parse(existingGrid), function (resultGraph) {
                    if (resultGraph.result) {
                      responseGrid.edges = resultGraph.edges;
                      response.grid = JSON.stringify(responseGrid);
                      response.errors = '';
                      response.successes = 'Success saving graph with nodes and edges';
                      res.render('grid', response);
                    } else {
                      response.grid = JSON.stringify(responseGrid);
                      response.successes = '';
                      response.errors = 'Error saving graph edges';
                      res.render('grid', response);
                    }
                  });
                } else {
                  response.grid = JSON.stringify(responseGrid);
                  response.successes = 'Success saving graph nodes';
                  res.render('grid', response);
                }
                
              }
            });

          } else {
            res.render('grid', response);
          }
        });
      });
    });
  });








});


module.exports = router;
