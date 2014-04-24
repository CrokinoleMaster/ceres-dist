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
;'use strict';

angular.module('ceresApp')
  .controller('DefaultMapController',
  ['$scope', '$location', 'leafletData', 'leafletLegendHelpers', 'UserMapsFactory',
  function($scope, $location, leafletData, leafletLegendHelpers, UserMapsFactory){

    $scope.center = {lat: 36.51, lng: -120.452, zoom: 10 };
    $scope.centerIndex = 0;

    $scope.moveCenter = function(i){
      $scope.centerIndex = i;
      $scope.center = $scope.centers[i];
    }

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
        overlays: userData.dates.slice(-1)[0].overlays
      };
      angular.extend($scope, {
        layers: layers,
        centers: userData.centers,
        center: userData.centers[0]
      });
      Object.keys(layers.overlays).forEach(function(key){
        $scope.addLegend(layers.overlays[key].legend);
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
        maxZoom: 17,
        minZoom: 15
      },
    });

    leafletData.getMap().then(function(map) {
      map.touchZoom.disable();
      $scope.addLegend = function(value){
          var legend = L.control({ position: 'bottomleft' });
          legend.onAdd = leafletLegendHelpers.getOnAddArrayLegend(value, 'legend');
          legend.addTo(map);
      }
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
        var center = MapCentersFactory.getCenters()[index];
        var lat = center.lat;
        var lng = center.lng;
        MapCentersFactory.setIndex(index);
        $scope.centerIndex = index;


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