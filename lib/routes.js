'use strict';

var api = require('./controllers/api'),
    admin = require('./controllers/admin'),
    index = require('./controllers'),
    users = require('./controllers/users');
var db = require('./db/db').db;

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
      });
    });

  // All undefined api routes should return a 404
  app.route('/api/*')
    .get(function(req, res) {
      res.send(404);
    });

  // Admin
  app.route('/admin')
    .get(admin.admin);
  // Admin login
  app.route('/login')
    .post(admin.login);
  // list users
  app.route('/userlist')
    .get(users.userlist);
  // get user
  app.route('/user/:name')
    .get(users.user);
  // Admin Adduser
  app.route('/user/:name')
    .post(users.update);

  // All other routes to use Angular routing in app/scripts/app.js
  app.route('/partials/*')
    .get(index.partials);
  app.route('/*')
    .get( index.index);
};
