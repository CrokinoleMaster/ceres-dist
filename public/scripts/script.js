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
  .controller('DefaultMapController',
  ['$scope', 'leafletData', 'UserMapsFactory', 'MapCentersFactory',
  function($scope, leafletData, UserMapsFactory, MapCentersFactory){

    $scope.centerIndex = 0;
    $scope.center = {lat: 36.51, lng: -120.452, zoom: 16 };
    $scope.$watch('centerIndex', function (centerIndex) {
      $scope.center = MapCentersFactory.getCenters()[centerIndex];
    });
    $scope.$watch(function(){return MapCentersFactory.getIndex(); },
      function(index){
        $scope.centerIndex = index;
    });
    $scope.$watch(function(){return MapCentersFactory.getCenters();},
      function(centers){
        $scope.centers = centers;
    });

    var userData;
    var baselayers = {
          googleRoadmap: {
            name: 'Google Satelite',
            layerType: 'SATELLITE',
            type: 'google'
          }
        };

    function getUser(){
      UserMapsFactory.getMap()
        .then(function(response){
          userData = filterUser(response.data, Userbin.currentProfile().id)
          initUserMap();
          MapCentersFactory.setCenters(userData.centers);
          MapCentersFactory.setIndex(0);
        });
    }

    function filterUser(mapData, id){
      var data = mapData.filter(function(user) {
        return user.id === id;
      })[0];
      return data;
    }

    function initUserMap(){
      var layers = {
        baselayers: baselayers,
        overlays: userData.overlays,
      };
      angular.extend($scope, {
        layers: layers
      });
    }

    getUser();
    angular.extend($scope, {
      layers: {
        baselayers: baselayers
      },
      defaults: {
        zoomControlPosition: 'bottomleft',
        touchZoom: false
      },
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
}]);;'use strict';

angular.module('ceresApp')
  .controller('MenuController', ['$scope', '$location', 'MapCentersFactory',
    function($scope, $location, MapCentersFactory){

      $scope.$watch(function(){return MapCentersFactory.getIndex(); },
        function(index){
          $scope.centerIndex = index;
      });
      $scope.getCenters = MapCentersFactory.getCenters;
      $scope.moveCenter = function(index) {
        MapCentersFactory.setIndex(index);
        $scope.centerIndex = index;
      }

}]);;'use strict';

angular.module('ceresApp')
  .factory('MapCentersFactory', [function(){
    var index = 1;
    var centers =[{ lat: 37.895, lng: -121.122, zoom: 10}];

    return{
      getCenters: function(){
        return centers;
      },
      setCenters: function(value){
        centers = value;
      },
      getIndex: function(){
        return index;
      },
      setIndex: function(value){
        index = value;
      }
    }

}]);;'use strict';

angular.module('ceresApp')
  .factory('UserMapsFactory', ['$http', function($http){

    var url = '/api/maps';
    var MapFactory = {};

    MapFactory.getMap = function (id) {
        return $http.get(url);
    };

    return MapFactory;

}]);