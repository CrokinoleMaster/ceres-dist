'use strict';

angular.module('ceresApp', [
  'ngRoute',
  'leaflet-directive',
  'ui-rangeSlider',
  'nvd3ChartDirectives'
]).config(['$routeProvider', function($routeProvider){
    $routeProvider.when('/', {
        templateUrl: 'partials/login',
        controller: 'LoginController'
    }).when('/login', {
        templateUrl: 'partials/login',
        controller: 'LoginController'
    }).when('/login/:demo', {
        templateUrl: 'partials/login',
        controller: 'LoginController'
    }).when('/index', {
        templateUrl: 'partials/index',
        controller: 'IndexController',
        reloadOnSearch: false
    }).otherwise({
        redirectTo: '/'
    });
}]).config(['$locationProvider', function($locationProvider){
    $locationProvider.html5Mode(true);
}]).run( function($rootScope, $location, $route){
    $rootScope.$on( '$locationChangeStart', function(event, next, current){
        if (!Userbin.user()){
          if (next === 'http://app.ceresimaging.net/login' ||
              next === 'http://localhost:9000/login' ||
              next === 'http://localhost:9000/login/demo' ||
              next === 'http://app.ceresimaging.net/login/demo'){

          } else{
              $location.path('/').search('');
          }
        } else {
          if (!/^(http:\/\/localhost:9000\/index)/.test(next) &&
              !/^(http:\/\/app.ceresimaging.net\/index)/.test(next) &&
              !/^(http:\/\/localhost:9000\/login\/demo)/.test(next) &&
              !/^(http:\/\/app.ceresimaging.net\/login\/demo)/.test(next)) {
            if (Userbin.currentProfile().email === 'demo@gmail.com') {
                Userbin.logout();
            }
          }
          if (next.templateUrl !== 'partials/index'){
              $location.path('/index');
          }
        }
    });
    $rootScope.$on('$viewContentLoaded', function () {
        $(document).foundation();
    });
});

$(function(){
    $('.inner-wrap').css('height', $(window).height()-45+'px');
    $('.inner-wrap').css('width', $(window).width()+'px');
    $(window).resize(function(){
        $('.inner-wrap').css('height', $(window).height()-45+'px');
        $('.inner-wrap').css('width', $(window).width()+'px');
    });
});
 'use strict';

angular.module('ceresApp')
.filter('latLng', function(){
  return function(deg) {
    var d = Math.floor (deg);
    var minfloat = (deg-d)*60;
    var m = Math.floor(minfloat);
    var secfloat = (minfloat-m)*60;
    var s = secfloat.toFixed(2);
    if (s==60) {
      m++;
      s=0;
    }
    if (m==60) {
      d++;
      m=0;
    }
    return ("" + d + "\u00B0 " + m + "' " + s + "\"");
  }
});

angular.module('ceresApp')
.filter('percentage', function(){
  return function(ratio){
    return ratio*100 + '%';
  }
});

angular.module('ceresApp')
  .controller('DefaultMapController',
  ['$scope', '$location', 'leafletData', 'leafletLegendHelpers', 'UserMapsFactory',
   'MapStatsFactory',
  function($scope, $location, leafletData, leafletLegendHelpers, UserMapsFactory, MapStatsFactory) {

    function initLegends(){
      $scope.legendNDVI = $scope.addLegend({
              position: "bottomleft",
              colors: [
                "white",
                "#81F781",
                "#01DF3A",
                "#04B404",
                "#2f9706",
                "#0e2e01"
              ],
              labels: [
                "<strong> NDVI (Biomass) </strong>",
                "Low vigor",
                ".        ",
                ".         ",
                ".         ",
                "High vigor"
              ]
            }, 'temperature');
      $scope.legendTemp = $scope.addLegend({
              position: "bottomleft",
              colors: [
                "white",
                "red",
                "yellow",
                "green",
                "blue",
              ],
              labels: [
                "<strong> Water Stress </strong>",
                "High stress",
                "Moderate stress",
                "Low stress",
                "Unstressed"
              ]
            }, 'NDVI');
    }

    $scope.$on('resetMaps', function(e) {
      var base = $scope.layers.baselayers.google;
      delete $scope.layers.baselayers.google;
      $scope.$apply();
      $scope.layers.baselayers.google = base;
      $scope.$apply();
    });

    $scope.moveCenter = function(i){
      $scope.$parent.centerIndex = i;
    }

    // stats
    MapStatsFactory.getStats().then(function(stats) {
      $scope.stats = stats.data;
      $scope.toolTipContent = function() {
        return function(key, x, y) {
          return '<strong>'+key+'</strong>' + '<p>'+y+'</p>'
        }
      }
      var tempColors = { 'high': "red",
                        'moderate': "yellow",
                        'low': "green",
                        'unstressed': "blue"};
      $scope.tempColor = function() {
        return function(d, i) {
          return tempColors[d.key];
        }
      }

      if ($scope.currentDate) {
        if ($scope.stats[$scope.center.name] &&
          $scope.stats[$scope.center.name][$scope.currentDate]) {
            var dateIndex = Object.keys($scope.stats[$scope.center.name]).indexOf($scope.currentDate);
            $scope.prevDate = Object.keys($scope.stats[$scope.center.name])[dateIndex-1];
            $scope.prevPrevDate = Object.keys($scope.stats[$scope.center.name])[dateIndex-2];
            if ($scope.stats[$scope.center.name][$scope.currentDate].temp) {
              $scope.stattemp = $scope.stats[$scope.center.name][$scope.currentDate].temp;
                $scope.stattempPrev = $scope.stats[$scope.center.name][$scope.prevDate].temp || null;
                $scope.stattempPrevPrev = $scope.stats[$scope.center.name][$scope.prevPrevDate].temp || null;
            }
            if ($scope.stats[$scope.center.name][$scope.currentDate].NDVI) {
              $scope.statNDVI = $scope.stats[$scope.center.name][$scope.currentDate].NDVI;
                $scope.statNDVIPrev = $scope.stats[$scope.center.name][$scope.prevDate].NDVI || null;
                $scope.statNDVIPrevPrev = $scope.stats[$scope.center.name][$scope.prevPrevDate].NDVI || null;
            }
        }
      }

    });

    // sync maps
    $scope.sync = function() {
      var move1;
      var move2;
      var zoom1;
      var zoom2;
      leafletData.getMap('map1').then(function(map1) {
        leafletData.getMap('map2').then(function(map2){
            move1 = function (){
              // map1.setView(map2.getCenter(), map2.getZoom(), {animate: false, duration: 1});
              map1.panTo(map2.getCenter(), {animate: false, duration: 1});
            }
            move2 = function (){
              // map2.setView(map1.getCenter(), map1.getZoom(), {animate: false, duration: 1});
              map2.panTo(map1.getCenter(), {animate: false, duration: 1});
            }
            zoom1 = function(){
              map1.setZoom(map2.getZoom(), {animate: false, duration: 0});
            }
            zoom2 = function(){
              map2.setZoom(map1.getZoom(), {animate: false, duration: 0});
            }
            map2.on('drag', move1);
            map1.on('drag', move2);
            map2.on('zoomend', zoom1);
            map1.on('zoomend', zoom2);
        });
      });
    }

    function watches(){
      $scope.$watch('currentDate', function(newvalue){
        Object.keys($scope.dates).forEach(function(date) {
          if (date === newvalue) {
            $scope.layers.overlays = $scope.dates[date].overlays;
          }
        });
        // get layer stats and set to $scope['stat'+layerType]
        if ($scope.stats) {
          if ($scope.stats[$scope.center.name] &&
            $scope.stats[$scope.center.name][newvalue]) {
            var dateIndex = Object.keys($scope.stats[$scope.center.name]).indexOf($scope.currentDate);
            $scope.prevDate = Object.keys($scope.stats[$scope.center.name])[dateIndex-1];
            $scope.prevPrevDate = Object.keys($scope.stats[$scope.center.name])[dateIndex-2];
              if ($scope.stats[$scope.center.name][newvalue].temp) {
                $scope.stattemp = $scope.stats[$scope.center.name][newvalue].temp;
                $scope.stattempPrev = $scope.stats[$scope.center.name][$scope.prevDate].temp || null;
                $scope.stattempPrevPrev = $scope.stats[$scope.center.name][$scope.prevPrevDate].temp || null;
              } else {
                $scope.stattemp = null;
              }
              if ($scope.stats[$scope.center.name][newvalue].NDVI) {
                $scope.statNDVI = $scope.stats[$scope.center.name][newvalue].NDVI;
                $scope.statNDVIPrev = $scope.stats[$scope.center.name][$scope.prevDate].NDVI || null;
                $scope.statNDVIPrevPrev = $scope.stats[$scope.center.name][$scope.prevPrevDate].NDVI || null;
              } else {
                $scope.statNDVI = null;
              }
            } else {
              $scope.stattemp = null;
              $scope.stattempPrev = null;
              $scope.stattempPrevPrev = null;
              $scope.statNDVI = null;
              $scope.statNDVIPrev = null;
              $scope.statNDVIPrevPrev = null;
            }
        }
      });
      $scope.$watch('isSplit', function(newvalue){
        $scope.leaflet.invalidateSize(false);
      });
      $scope.$parent.$watch('centerIndex', function(newvalue){
        var dates = $scope.fields[newvalue].dates;
        $scope.center = $scope.centers[newvalue];
        $scope.leaflet.panTo(new L.LatLng($scope.center.lat, $scope.center.lng));
        $scope.layers.overlays = dates[Object.keys(dates)[0]].overlays;
        $scope.dates = $scope.fields[newvalue].dates;
        $scope.currentDate = Object.keys(dates).pop();
      })
      // opacity layers watch
      $scope.$watch('layers.overlays.NDVI.layerParams.opacity', function(newvalue){
        if ($scope.layers.overlays.NDVI){
          Object.keys($scope.dates).forEach(function(date) {
            if ($scope.dates[date].overlays.NDVI)
              $scope.dates[date].overlays.NDVI.layerParams.opacity = newvalue;
          });
        }
      });
      $scope.$watch('layers.overlays.temp.layerParams.opacity', function(newvalue){
        if ($scope.layers.overlays.temp){
          Object.keys($scope.dates).forEach(function(date) {
            if ($scope.dates[date].overlays.temp)
              $scope.dates[date].overlays.temp.layerParams.opacity = newvalue;
          });
        }
      });
    }

    var userData;
    var baselayers = {
      google: {
        name: 'Google Satelite',
        layerType: 'SATELLITE',
        type: 'google'
      }
    };

    function getUser(){
      UserMapsFactory.getMap()
        .then(function(response){
          userData = response.data
          initUserMap();
          userData = null;
          watches();
        });
    }

    function initUserMap(){
      var dates = userData.fields[0].dates;
      Object.keys(dates).forEach(function(date) {
        if (dates[date].overlays.NDVI){
          var ndvi = dates[date].overlays.NDVI;
          delete dates[date].overlays.NDVI;
          dates[date].overlays.NDVI = ndvi;
        }
      });
      var layers = {
        baselayers: baselayers,
        overlays: dates[Object.keys(dates)[0]].overlays
      };

      angular.extend($scope, {
        layers: layers,
        centers: userData.fields,
        fields: userData.fields,
        center: userData.fields[0],
        dates: dates,
        username: userData.user
      });

      /* add hashing for forward and back between maps */
      $scope.$on("centerUrlHash", function(event, centerHash) {
        var center = $scope.centers[$scope.$parent.centerIndex];
        var lat = center.lat.toFixed(4).toString();
        var lng = center.lng.toFixed(4).toString();
        var zoom = center.zoom.toString();
        if (centerHash === lat+':'+lng+':'+zoom ){
          $location.search({ c: centerHash });
          $location.hash('map_'+($scope.$parent.centerIndex+1) );
        }
      });
      $scope.moveCenter(0);
    }

    /* calling init functions */

    getUser();
    angular.extend($scope, {
      layers: {
        baselayers: baselayers
      },
      defaults: {
        zoomControlPosition: 'bottomleft',
        touchZoom: false,
        minZoom: 15,
        maxZoom: 20
      },
    });

    $scope.mapInit = function(map){

      leafletData.getMap(map).then(function(map) {
        $scope.leaflet = map;
        var $modal = $('#marker-modal');
        // draw tools
        var drawItems = new L.FeatureGroup();
        map.addLayer(drawItems);

        // hack to keep more than one popup open at a time
        map.openPopup = function(popup, latlng, options) {
          if (!(popup instanceof L.Popup)) {
            var content = popup;
            popup = new L.Popup(options).setContent;
          }
          if (latlng) {
            popup.setLatLng(latlng);
          }
          if (this.hasLayer(popup)) {
            return this;
          }
          this._popup = popup;
          return this.addLayer(popup);
        }
        var drawControl = new L.Control.Draw({
          position: 'topleft',
          draw: {
            // polyline: {
            //   metric: false,
            //   shapeOptions: {
            //     color: 'magenta',
            //     weight: 10
            //   }
            // },
            polyline: false,
            // polygon: {
            //   showArea: true,
            //   allowIntersection: false,
            //   metric: false,
            //   drawError: {
            //     color: '#e1e100',
            //     message: '<strong>do not intersect<strong>'
            //   },
            //   shapeOptions: {
            //     color: 'purple',
            //     weight: 10
            //   }
            // },
            polygon: false,
            // circle: {
            //   metric: false,
            //   shapeOptions: {
            //     color: 'red',
            //     weight: 10
            //   }
            // },
            circle: false,
            rectangle: {
              showArea: true,
              shapeOptions: {
                color: 'blue',
                weight: 10
              },
              metric: false
            }
          },
          edit: {
            featureGroup: drawItems
          }
        });
        map.addControl(drawControl);
        map.on('draw:created', function(e) {
          var type = e.layerType;
          var layer = e.layer;
          var text = null;
          var area = null;
          if (type === 'marker') {
            $modal.foundation('reveal', 'open');
            $modal.find('.button').off('click');
            $modal.find('.button').click(function() {
              text = $modal.find('input').val();
              if (text) {
                layer.bindPopup(text,{closeButton: false, autoPan: false});
              }
              drawItems.addLayer(layer);
              layer.openPopup();
              // hack to keep popups open
              map.on('click', function(e) {
                layer.openPopup();
              });
              $modal.foundation('reveal', 'close');
            });
          } else if (type === 'rectangle' || type === 'polygon'){
            area = L.GeometryUtil.geodesicArea(layer._latlngs);
            area = L.GeometryUtil.readableArea(area);
            layer.bindPopup('<strong>' + area + '</strong>');
            drawItems.addLayer(layer);
          } else if (type === 'circle'){
            area = Math.pow(layer.getRadius(), 2) * Math.PI;
            area = (area / 4047).toFixed(2);
            layer.bindPopup('<strong>' + area + ' acres</strong>');
            drawItems.addLayer(layer);
          } else {
            drawItems.addLayer(layer);
          }
        });

        $scope.addLegend = function(value, name){
          var legend = L.control({ position: 'bottomright' });
          legend.onAdd = leafletLegendHelpers.getOnAddArrayLegend(value, 'legend');
          legend.addTo(map);
          legend.name = name;
          return legend;
        }
        if ($scope.legendTemp === undefined){
          initLegends();
        }

        map.touchZoom.disable();
        map.on('mousemove', function(e) {
          $scope.cursor = {};
          $scope.cursor.lat = e.latlng.lat;
          $scope.cursor.lng = e.latlng.lng;
        });

        // resizes
        $('window').resize(function(){
          map.panTo($scope.center);
        });

        $scope.sync();

      });
    }


}]);

 'use strict';

angular.module('ceresApp')
  .controller('IndexController', ['$scope', '$location', 'leafletData',
      function($scope, $location, leafletData){


  if (Userbin.currentProfile().email === 'demo@gmail.com') {
  }

  $scope.showLayerControl = true;
  $scope.showLegend = true;
  $scope.showStats = true;
  $scope.statNumber = 1;
  $scope.isSplit = false;
  $scope.centerIndex = 0;
  var statContainer = $('.layerStats.row');

  function resetMaps(){
    $scope.$broadcast('resetMaps');
  }

  $scope.$watch('statNumber', function(num) {
    if (num === 1) {
      statContainer.width('150px');
    } else if (num === 2) {
      statContainer.width('250px')
    } else {
      statContainer.width('380px');
    }
  });

  // split maps
  $scope.split = function() {
    var legend1 = $('#split-one .legend');
    $scope.isSplit = !$scope.isSplit;
    if (!$scope.isSplit && $scope.showLegend){
      legend1.show();
    } else {
      legend1.hide();
    }
  }

  // toggle layer controls
  $scope.toggleLayerControl = function(){
    $scope.showLayerControl = !$scope.showLayerControl;
  }

  $scope.toggleStats = function() {
    $scope.showStats = !$scope.showStats;
  }

  // toggle legends
  $scope.toggleLegend = function(){
    var legend1 = $('#split-one .legend');
    var legends = $('.legend');
    $scope.showLegend = !$scope.showLegend;
    if ($scope.showLegend){
      legends.show();
    } else {
      legends.hide();
    }
    if ($scope.isSplit){
      legend1.hide();
    }
  }

  $scope.toggleStatNumber = function(num) {
    $scope.statNumber = num;
  }

}]);
 'use strict';

angular.module('ceresApp')
  .controller('LoginController', ['$scope', '$location', '$routeParams',
  function($scope, $location, $routeParams){
    function init() {
      if ($routeParams.demo === 'demo') {
        Userbin.login('demo@gmail.com', 'ceres123');
      }
    }
    init();
}]);
 'use strict';

angular.module('ceresApp')
  .controller('MainController', ['$scope', '$location', function($scope, $location){
    $scope.user = {};
    $scope.user.currentProfile = Userbin.user();
    Userbin.on('logout.success', function(){
        $scope.user.currentProfile = Userbin.user();
        $scope.$apply();
        $scope.$apply(function() { $location.path("/"); });
    });
    Userbin.on('login.success', function(){
        $scope.user.currentProfile = Userbin.user();
        $scope.$apply();
        $scope.$apply(function() { $location.path("/index"); });
    });
}]);
 'use strict';

angular.module('ceresApp')
  .controller('MenuController', ['$scope', '$location', 'MapCentersFactory',
    function($scope, $location, MapCentersFactory){

      $scope.$watch(function(){return MapCentersFactory.getIndex(); },
        function(index){
          $scope.centerIndex = index;
      });
      $scope.getCenters = MapCentersFactory.getCenters;
      $scope.moveCenter = function(index) {
        var center = MapCentersFactory.getCenters()[index];
        var lat = center.lat;
        var lng = center.lng;
        MapCentersFactory.setIndex(index);
        $scope.centerIndex = index;


      }
}]); 'use strict';

angular.module('ceresApp')
  .controller('RssController', ['$scope', 'FeedService', function($scope, FeedService){
    $scope.feedSrc = 'http://w1.weather.gov/xml/current_obs/KOAK.rss';
    $scope.feedDisplay = false;
    $scope.loadFeed = function( e ){
      FeedService.parseFeed($scope.feedSrc).then(function(res){
        $scope.feed = res.data.responseData.feed.entries[0];
        var i = ($scope.feed.content.indexOf('<br>'));
        $scope.feed = $scope.feed.content.slice(i+4);
      })
        $scope.feedDisplay = !$scope.feedDisplay;
    }
    $scope.loadFeed();

}]);
 'use strict';

angular.module('ceresApp')
  .factory('FeedService', ['$http', function($http){
    return {
      parseFeed: function(url){
        return $http.jsonp('//ajax.googleapis.com/ajax/services/feed/'+
          'load?v=1.0&num=50&callback=JSON_CALLBACK&q=' +
          encodeURIComponent(url));
      }
    }

}]);
 'use strict';

angular.module('ceresApp')
  .factory('MapStatsFactory', ['$http', function($http){

    var url = '/api/stats/';
    var MapStatsFactory = {};

    MapStatsFactory.getStats = function (userId) {
        return $http.get(url+Userbin.currentProfile().id);
    };

    return MapStatsFactory;

}]);
 'use strict';

angular.module('ceresApp')
  .factory('UserMapsFactory', ['$http', function($http){

    var url = '/api/maps/';
    var MapFactory = {};

    MapFactory.getMap = function (id) {
        return $http.get(url+Userbin.currentProfile().id);
    };

    return MapFactory;

}]);
