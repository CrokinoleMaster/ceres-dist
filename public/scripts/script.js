'use strict';

angular.module('ceresApp', [
  'ngRoute',
  'leaflet-directive'
]).config(['$routeProvider', function($routeProvider){
    $routeProvider.when('/', {
        templateUrl: 'partials/login',
        controller: 'LoginController'
    }).when('/index', {
        templateUrl: 'partials/index',
        controller: 'IndexController',
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
;'use strict';

angular.module('ceresApp')
  .controller('DefaultMapController', ['$scope', 'leafletData', function($scope, leafletData){
    angular.extend($scope, {
      america: {
        lat: 36.51,
        lng: -120.452,
        zoom: 16
      },
      soloHeat:{
        lat: 37.895,
        lng: -121.122,
        zoom: 15
      },

      layers: {
        baselayers: {
          googleRoadmap: {
            name: 'Google Satelite',
            layerType: 'SATELLITE',
            type: 'google'
          },
          osm: {
            name: 'Huarui\s map',
            url: 'http://api.tiles.mapbox.com/v3/huaruiwu.i0ka23ad/{z}/{x}/{y}.png',
            type: 'xyz'
          },
          cloudmade2: {
            name: 'Cloudmade Tourist',
            type: 'xyz',
            url: 'http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png',
            layerParams: {
              key: '007b9471b4c74da4a6ec7ff43552b16f',
              styleId: 7
            }
          }
        },
        overlays: {
          ndvi: {
            name: 'NDVI',
            type: 'imageOverlay',
            visible: true,
            url: '/images/NDVI.png',
            bounds: [[36.5007, -120.4715], [36.5239, -120.4291]],
            layerParams: {
                transparent: true,
                opacity: 0.4
            }
          },
          soloHeat: {
            name: 'Solo Heat',
            type: 'imageOverlay',
            visible: true,
            url: '/images/solo_heat.png',
            bounds: [[37.8794, -121.1396], [37.906532, -121.09050]],
            layerParams: {
              transparent: true,
              opacity: 0.4
            }
          }
        }
      },

      legends:{
        ndvi: {
            position: 'bottomleft',
            colors: [ '#fff',
                      '#EC0306',
                      '#F16E04',
                      '#FFAA04',
                      '#F7F50D',
                      '#BAF801',
                      '#55FF00',
                      '#3EA600' ],
            labels: [ '<strong> NDVI </strong>',
                      '-1 - -0.74',
                      '-0.73 - -0.05',
                      '-0.04 - -0.16',
                      '0.17 - 0.37',
                      '0.38 - 0.55',
                      '0.56 - 0.68',
                      '0.69 - 0.81']
        },
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
        },

      },

      defaults: {
        zoomControlPosition: 'bottomleft',
        touchZoom: false
      }
    });
    leafletData.getMap().then(function(map) {
      map.touchZoom.disable();
    });

}]);
;'use strict';

angular.module('ceresApp')
  .controller('IndexController', ['$scope', '$location', function($scope, $location){

}]);;'use strict';

angular.module('ceresApp')
  .controller('LoginController', ['$scope', '$location', function($scope, $location){

}]);;'use strict';

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