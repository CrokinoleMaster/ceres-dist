'use strict';

angular.module('ceresApp', [
  'ngRoute',
  'leaflet-directive',
  'ui-rangeSlider'
]).config(['$routeProvider', function($routeProvider){
    $routeProvider.when('/', {
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
}]).run( function($rootScope, $location){
    $rootScope.$on( '$locationChangeStart', function(event, next, current){
        if (!Userbin.user()){
            if (next.templateUrl === 'partials/login'){

            } else{
                $location.path('/');
            }
        } else {
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
})

angular.module('ceresApp')
  .controller('DefaultMapController',
  ['$scope', '$location', 'leafletData', 'leafletLegendHelpers', 'UserMapsFactory',
  function($scope, $location, leafletData, leafletLegendHelpers, UserMapsFactory) {

    $scope.center = {lat: 36.51, lng: -120.452, zoom: 10 };
    $scope.centerIndex = 0;
    function initLegends(){
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
      $scope.legendNDVI = $scope.addLegend({
              position: "bottomleft",
              colors: [
                "white",
                "red",
                "yellow",
                "#2f9706",
                "#0e2e01"
              ],
              labels: [
                "<strong> NDVI (Biomass) </strong>",
                "Low vigor",
                ".        ",
                ".         ",
                "High vigor"
              ]
            }, 'temperature');
    }

    $scope.moveCenter = function(i){
      $scope.centerIndex = i;
      $scope.center = $scope.centers[i];
    }

    // html2canvas
    $scope.export = function(e, split, callback) {
      var base = $scope.layers.baselayers.google;
        delete $scope.layers.baselayers.google;
        $scope.$apply();
        $scope.layers.baselayers.google = base;
        $scope.$apply();
      window.setTimeout(function(){
        var target = $(e.target).parents('.main-app').find('.main-section');
        var splitWidth = $(window).width() / 2;
        html2canvas( target , {
          useCORS: true,
          logging: true,
          onrendered: function(canvas) {
            var win = window.open('', '_blank');
            var img = document.createElement('img');
            img.src = canvas.toDataURL('image/jpeg');
            if ($scope.isSplit){
              canvas.width = splitWidth;
              if (split === 2){
                splitWidth = -splitWidth;
              } else { splitWidth = 0; }
              canvas.getContext('2d').drawImage(img, splitWidth, 0);
              img.src = canvas.toDataURL('image/jpeg');
            }
            var $body = $(win.document.body);
            $body.append(img);

            if (callback)
              callback(win);
            // var link = document.createElement('a');
            // link.href = canvas.toDataURL('image/jpeg');
            // $(link).attr('download', 'something');
            // link.click();
          }
        });
      }, 1000);
    };

    // print function
    $scope.print = function(e, split) {
      $scope.export(e, split, function(win){
        // chrome bug handle
        if (win.chrome !== null && win.navigator.vendor === 'Google Inc.') {
          win.PPClose = false;
          win.onbeforeunload = function() {
            if (win.PPCLose === false){
              return 'Leaving this page will block the parent window!\nPlease select "Stay on this Page option" and use the\nCancel button instead to close the Print Preview Window.\n';
            }
          }
        }
        //
        win.print();
        win.onfocus = win.close();
      });
    }

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
        $scope.dates.forEach(function(i){
          if (i.date === newvalue){
            $scope.layers.overlays = i.overlays;
          }
        });
      });
      $scope.$watch('isSplit', function(newvalue){
         $scope.leaflet.invalidateSize(false);
      });
      // opacity layers watch
      $scope.$watch('layers.overlays.NDVI.layerParams.opacity', function(newvalue){
        if ($scope.layers.overlays.NDVI){
          $scope.dates.forEach(function(i){
            if (i.overlays.NDVI)
              i.overlays.NDVI.layerParams.opacity = newvalue
          });
        }
      });
      $scope.$watch('layers.overlays.temp.layerParams.opacity', function(newvalue){
        if ($scope.layers.overlays.temp){
          $scope.dates.forEach(function(i){
            if (i.overlays.temp)
              i.overlays.temp.layerParams.opacity = newvalue
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
    // var baselayers = {
    //   baseLayer: {
    //     name: 'base',
    //     url:  'http://api.tiles.mapbox.com/v3/huaruiwu.ia037n1a/{z}/{x}/{y}.png',
    //     type: 'xyz',
    //   }
    // }

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
      var layers = {
        baselayers: baselayers,
        overlays: userData.dates.slice(-1)[0].overlays
      };
      angular.extend($scope, {
        layers: layers,
        centers: userData.centers,
        fields: userData.fields,
        center: userData.centers[0],
        dates: userData.dates,
        username: userData.name,
        currentDate: userData.dates.slice(-1)[0].date
      });

      /* add hashing for forward and back between maps */
      $scope.$on("centerUrlHash", function(event, centerHash) {
        var center = $scope.centers[$scope.centerIndex];
        var lat = center.lat.toFixed(4).toString();
        var lng = center.lng.toFixed(4).toString();
        var zoom = center.zoom.toString();
        if (centerHash === lat+':'+lng+':'+zoom ){
          $location.search({ c: centerHash });
          $location.hash('map_'+($scope.centerIndex+1) );
        }
      });
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

  $scope.showLayerControl = true;
  $scope.showLegend = true;
  $scope.isSplit = false;

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


}]);
 'use strict';

angular.module('ceresApp')
  .controller('LoginController', ['$scope', '$location', function($scope, $location){

}]); 'use strict';

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
  .factory('UserMapsFactory', ['$http', function($http){

    var url = '/api/maps/';
    var MapFactory = {};

    MapFactory.getMap = function (id) {
        return $http.get(url+Userbin.currentProfile().id);
    };

    return MapFactory;

}]);
