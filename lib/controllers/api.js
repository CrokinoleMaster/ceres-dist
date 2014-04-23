'use strict';

/**
 * Get map data
 */
exports.maps = function(req, res) {
  res.json([
    {
      name : 'Jeff Rerup',
      id : '1gwnJMQkTaavCQnk7uMWdC4f4HNzGP9n',
      centers : [{lat: 37.895, lng: -121.122, zoom: 15},
                 {lat: 37.926176, lng: -121.043542, zoom: 15 }],
      overlays : {
        soloHeat: {
          name: 'Solo Heat',
          type: 'imageOverlay',
          visible: true,
          url: '/images/rerup/soloHeat.png',
          // bounds: [[37.8794, -121.1396], [37.906532, -121.09050]],
          bounds: [[37.883823, -121.129616],[37.930594, -121.041304]],
          layerParams: { transparent: true, opacity: 0.4 },
          legend: {
              position: 'bottomleft',
              colors: [ '#fff',
                        'blue',
                        'green',
                        'yellow',
                        'red' ],
              labels: [ '<strong> Solo Heat </strong>',
                        '67.5',
                        '70.5',
                        '73.5',
                        '76.5']

          }
        }
      }
    }, {

    }, {

    }, {

    }
  ]);
};