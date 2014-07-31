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
