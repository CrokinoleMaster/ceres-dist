'user strict';

var path = require('path');
var db = require('../db/db').db;
var fs = require('fs');

var createFile = function(filePath, data, res) {
  fs.writeFile(filePath, data, function(err) {
    if (err) throw err;
    console.log('saved')
    res.send('saved');
  });
}

exports.export = function(req, res){
  var drawingData = req.body.drawing;
  var directory = path.join(__dirname, '../../public/tmp/');
  var file = 'drawing.json';
  if (!fs.existsSync(directory)) {
    fs.mkdir(directory, 0755, function(err) {
      if (err) {
        console.log(err);
      } else {
        createFile(directory+file, drawingData, res);
      }
    });
  } else {
    createFile(directory+file, drawingData, res);
  }
};

exports.drawing = function(req, res) {
  var filePath = path.join(__dirname, '../../public/tmp/') + 'drawing.json';
  res.download(filePath, 'drawing.json', function() {
    fs.unlink(filePath);
  });
}

exports.save = function(req, res) {
  var user = req.params.id;
  var field = req.params.field;
  var date = req.params.date;
  var drawing = JSON.parse(req.body.drawing);
  db.collection('drawings').update(
    {user: user, field: field, date: date},
    {user: user, field: field, date: date, drawing: drawing},
    {upsert: true},
    function(err) {
      if (err) {
        res.send(err);
      } else {
        res.send('success');
      }
    }
  );
}

exports.find = function(req, res) {
  var user = req.params.id;
  var field = req.params.field;
  var date = req.params.date;
  db.collection('drawings').findOne(
    {user: user, field: field, date: date},
    function(err, data) {
      if (err) {
        res.send(err);
      } else {
        if (data) {
          res.send(data.drawing);
        } else {
          res.send({});
        }
      }
    }
  );
}
