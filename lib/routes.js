'use strict';

var api = require('./controllers/api'),
    index = require('./controllers');
var mongo = require('mongoskin');
var db = mongo.db("mongodb://huarui:jiang546@oceanic.mongohq.com:10049/app24361728");

/**
 * Application routes
 */
module.exports = function(app) {

  // Server API Routes
  // app.route('/api/maps')
  //   .get(api.maps);

  app.route('/api/maps/:id')
    .get(function(req, res){
      var userId = req.params.id;
      db.collection('users').findOne({'id': userId}, function(err, item){
        if(err) throw err;
        res.json(item);
      })
    });

  // All undefined api routes should return a 404
  app.route('/api/*')
    .get(function(req, res) {
      res.send(404);
    });

  // All other routes to use Angular routing in app/scripts/app.js
  app.route('/partials/*')
    .get(index.partials);
  app.route('/*')
    .get( index.index);
};
