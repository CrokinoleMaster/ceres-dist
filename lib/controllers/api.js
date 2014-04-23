'use strict';

/**
 * Get map data
 */
exports.maps = function(req, res) {
  res.json([
    {
      name : 'Jeff Rerup',
      id : '1gwnJMQkTaavCQnk7uMWdC4f4HNzGP9n',
      centers : [{lat: 37.895111, lng: -121.122111, zoom: 15},
                 {lat: 37.924176, lng: -121.043542, zoom: 16 }],
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
        },
        DNVI: {
          name: 'NDVI',
          type: 'imageOverlay',
          visible: false,
          url: '/images/rerup/NDVI.png',
          // bounds: [[37.8794, -121.1396], [37.906532, -121.09050]],
          bounds: [[37.883823, -121.129016],[37.929894, -121.041404]],
          layerParams: { transparent: true, opacity: 0.4 },
          legend: {
              position: 'bottomleft',
              colors: [ '#fff',
                        '#FFD37F',
                        '#FFFF73',
                        '#4CE600',
                        '#38A800',
                        '#267300'],
              labels: [ '<strong> DNVI </strong>',
                        '0.335-0.564',
                        '0.565-0.58',
                        '0.581-0.593',
                        '0.594-0.622',
                        '0.623-0.635']
          }
        }
      }
    }, {

    }, {

    }, {

    }
  ]);
};