'user strict';

var path = require('path');
var db = require('../db/db').db;

exports.stats = function(req, res) {
      var userId = req.params.id;
      db.collection('stats').findOne({'id': userId},
        function(err,item) {
          if (err) throw err;
          if (item) {
            var fields = item.fields;
            // format
            var data = {};
            fields.forEach(function(field) {
              data[field.name] = {};
              Object.keys(field.dates).forEach(function(date) {
                data[field.name][date] = {temp: null, NDVI: null};
                Object.keys(field.dates[date]).forEach(function(type) {
                  var set = [];
                  Object.keys(field.dates[date][type]).reverse().forEach(function(key) {
                    switch (key) {
                      case 'unstressed':
                        set[0] = {key: key,
                                  values: [ [1, field.dates[date][type][key]],
                                            [2, field.dates[date][type][key]] ]}
                        break;
                      case 'low':
                        set[1] = {key: key,
                                  values: [ [1, field.dates[date][type][key]],
                                            [2, field.dates[date][type][key]] ]}
                        break;
                      case 'moderate':
                        set[2] = {key: key,
                                  values: [ [1, field.dates[date][type][key]],
                                            [2, field.dates[date][type][key]] ]}
                        break;
                      case 'high':
                        set[3] = {key: key,
                                  values: [ [1, field.dates[date][type][key]],
                                            [2, field.dates[date][type][key]] ]}
                        break;
                    }
                  });
                  data[field.name][date][type] = set;
                });
              });
              //
            })
            res.json(data);
          } else {
            res.send(null);
          }
        });
    };
