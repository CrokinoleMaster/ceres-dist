'use strict';

var path = require('path');
var flash = {};
var db = require('../db/db').db;

/**
 * Send the admin page
 */
exports.admin = function(req, res) {
  res.render('admin');
};

exports.login = function(req, res){
  var username = req.body.username;
  var password = req.body.password;
  db.collection('admin').findOne({'username': username}, function(err, item){
    if (err){
      flash = { type: 'alert-danger', message: '' };
      flash.messages = [{ msg: 'error fetching user' }];
      res.render('admin', {flash: flash});
    }
    else if (item.username === username && item.password === password){
      res.render('addUser');
    }else {
      console.log('fail');
      flash = { type: 'alert-danger', messages: '' };
      flash.messages = [{ msg: 'Wrong username or password' }];
      res.render('admin', {flash: flash});
    }
  });
};
