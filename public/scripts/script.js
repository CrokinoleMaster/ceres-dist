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
            url: '/images/NDVI.jpg',
            bounds: [[36.4895, -120.4647], [36.5235, -120.439]],
            layerParams: {
                transparent: true,
                opacity: 0.4
            }
          }
        }
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