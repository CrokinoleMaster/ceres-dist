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
                "green",
                "yellow",
                "blue",
              ],
              labels: [
                "<strong> Water Stress </strong>",
                "High stress",
                "Moderate stress",
                "Low stress",
                "Well-watered"
              ]
            }, 'NDVI');
      $scope.legendNDVI = $scope.addLegend({
              position: "bottomleft",
              colors: [
                "white",
                "#97f073",
                "#44db08",
                "#2f9706",
                "#257904",
                "#0e2e01"
              ],
              labels: [
                "<strong> NDVI </strong>",
                "Low vigor",
                ".        ",
                ".         ",
                ".        ",
                "High vigor"
              ]
            }, 'temperature');
    }

    $scope.moveCenter = function(i){
      $scope.centerIndex = i;
      $scope.center = $scope.centers[i];
    }

    // html2canvas
    $scope.export = function(callback) {
      var base = $scope.layers.baselayers.google;
      leafletData.getMap().then(function(map) {
        delete $scope.layers.baselayers.google;
        $scope.$apply();
        $scope.layers.baselayers.google = base;
        $scope.$apply();
      });
      window.setTimeout(function(){
        html2canvas($('.main-section'), {
          useCORS: true,
          logging: true,
          onrendered: function(canvas) {
            var win = window.open('', '_blank');
            var img = document.createElement('img');
            img.src = canvas.toDataURL('image/jpeg');
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
    $scope.print = function() {
      $scope.export(function(win){
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

    function watches(){
      $scope.$watch('currentDate', function(newvalue){
        $scope.dates.forEach(function(i){
          if (i.date === newvalue){
            $scope.layers.overlays = i.overlays;
          }
        })
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
        center: userData.centers[0],
        dates: userData.dates,
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

    leafletData.getMap().then(function(map) {
      $scope.leaflet = map;
      $scope.addLegend = function(value, name){
        var legend = L.control({ position: 'bottomright' });
        legend.onAdd = leafletLegendHelpers.getOnAddArrayLegend(value, 'legend');
        legend.addTo(map);
        legend.name = name;
        return legend;
      }
      initLegends();

      map.touchZoom.disable();

      // resizes
      $('window').resize(function(){
        map.panTo($scope.center);
      });

    });


}]);

 'use strict';

angular.module('ceresApp')
  .controller('IndexController', ['$scope', '$location', function($scope, $location){


}]); 'use strict';

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
