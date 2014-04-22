'use strict';

/**
 * Get awesome things
 */
exports.maps = function(req, res) {
  res.json([
    {
      name : 'Jeff Rerup',
      id : '1gwnJMQkTaavCQnk7uMWdC4f4HNzGP9n',
      centers : [{lat: 37.895, lng: -121.122, zoom: 15},
                 {lat: 36.51, lng: -120.452, zoom: 16 }],
      overlays : {
        soloHeat: {
          name: 'Solo Heat',
          type: 'imageOverlay',
          visible: true,
          url: '/images/solo_heat.png',
          bounds: [[37.8794, -121.1396], [37.906532, -121.09050]],
          layerParams: { transparent: true, opacity: 0.4 },
          legends: {
            soloHeat: {
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
      }
    }, {
      name : 'AngularJS',
      info : 'AngularJS is a toolset for building the framework most suited to your application development.',
      awesomeness: 10
    }, {
      name : 'Karma',
      info : 'Spectacular Test Runner for JavaScript.',
      awesomeness: 10
    }, {
      name : 'Express',
      info : 'Flexible and minimalist web application framework for node.js.',
      awesomeness: 10
    }
  ]);
};