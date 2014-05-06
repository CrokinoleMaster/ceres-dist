'user strict';

var path = require('path');
var db = require('../db/db').db;
var flash = {};
/**
 * Send user pages
 */
exports.userlist = function(req, res){
  db.collection('users').find().toArray(function(err, items){
    res.json(items);
  });
};

exports.user = function(req, res){
  var username = req.params.name;
  db.collection('users').findOne({'name': username}, function(err, item){
    if (err){
      console.log(err);
      throw err;
    } else {
      res.json(item);
    }
  });
};

exports.update = function(req, res){
  var username = req.params.name;
  var data = req.body;
  db.collection('users').findOne({'name': username}, function(err, item){
    data._id = item._id;
    db.collection('users').save(data, function(err){
      if (err) throw err;
      else {
        res.json(req.body);
      }
    });
  });

};
