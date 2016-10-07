angular.module('micupon.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    // Form data for the login modal
    $scope.loginData = {};

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function() {
        $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function() {
        $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function() {
        console.log('Doing login', $scope.loginData);

        // Simulate a login delay. Remove this and replace with your login
        // code if using a login system
        $timeout(function() {
            $scope.closeLogin();
        }, 1000);
    };


})

.controller('BusquedaCtrl', ['$scope',function(s) {
    s.listado = [
    {nombre: 'Pizzería', imagen:'ico_comida1'},
    {nombre: 'Comida rápida', imagen:'ico_comida2'},
    {nombre: 'Rotisería', imagen:'ico_comida3'},
    {nombre: 'Desayunos', imagen:'ico_comida4'},
    {nombre: 'Restaurante', imagen:'ico_comida5'},
    {nombre: 'Sushi', imagen:'ico_comida6'},
    {nombre: 'Casa de té', imagen:'ico_comida7'},
    {nombre: 'Cervecería', imagen:'ico_comida8'},
    {nombre: 'Bares', imagen:'ico_comida9'}
    ];
}])
.controller('CuponesCtrl', ['$scope',function(s) {
    s.listado = [
    {nombre: 'Pizzería', imagen:'ico_comida1'},
    {nombre: 'Comida rápida', imagen:'ico_comida2'},
    {nombre: 'Rotisería', imagen:'ico_comida3'},
    {nombre: 'Desayunos', imagen:'ico_comida4'},
    {nombre: 'Restaurante', imagen:'ico_comida5'},
    {nombre: 'Sushi', imagen:'ico_comida6'},
    {nombre: 'Casa de té', imagen:'ico_comida7'},
    {nombre: 'Cervecería', imagen:'ico_comida8'},
    {nombre: 'Bares', imagen:'ico_comida9'}
    ];
}])
.controller('MapaCtrl', ['$scope','$rootScope','$cordovaGeolocation','$ionicLoading','$timeout', function(s,r,$cordovaGeolocation,$ionicLoading,$timeout) {
  s.location = $cordovaGeolocation;
    s.mapCreated = function(map) {
        s.map = map;
    };
    s.iniciarMapa = function($element) {
	var mapOptions = {
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            disableDefaultUI: true
        };
        s.map = new google.maps.Map(document.getElementById('mapa'), mapOptions);
        s.centrarMapa();				 
	}
    s.circulo = function(marker) {
                var sunCircle = {
                    strokeColor: "#62B2FC",
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: "#62B2FC",
                    fillOpacity: 0.35,
                    map: s.map,
                    radius: s.radioBusqueda // in meters
                };
                if (s.cityCircle) {
                    s.cityCircle.setMap(null);
                }
                s.cityCircle = new google.maps.Circle(sunCircle);
                s.cityCircle.bindTo('center', marker, 'position');
            }
    s.tracking = function(){
        $timeout(function(){
            console.log('consultando location');
            s.location.getCurrentPosition(options).then(function(position) {
                s.tracking();
            });
        },5000);
    }
    s.centrarMapa = function() {
        /*$ionicLoading.show({
            template: 'Cargando...'
        });*/
        var options = {
            timeout: 30000,
            enableHighAccuracy: true
        };
        s.location.getCurrentPosition(options).then(function(position) {
            r.lat = position.coords.latitude;
            r.long = position.coords.longitude;
            //r.lat= -0.205611; 
            //r.long= -78.485556;
            var latLong = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            //var latLong = new google.maps.LatLng(r.lat, r.long);
            s.map.setCenter(latLong);
            s.map.setZoom(15);
            if (s.markerLocation) {
                s.markerLocation.setMap(null);
            }
            s.markerLocation = new google.maps.Marker({
                position: latLong,
                map: s.map,
                icon: 'img/UbicacionUsuario_.png'
            });
            s.circulo(s.markerLocation);
            if (s.markerBusqueda) s.markerBusqueda.setMap(null);
            s.currPos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            s.consultarLocales();
            $ionicLoading.hide();

        }, function(error) {
            console.log(error.message);
        })
    }

    s.localesCercanosMarker = [];
    s.nombreLocal =[];
    s.consultarLocales = function() {
                $ionicLoading.show({
                    template: 'Buscando...'
                });
                Stamplay.Query('object', 'locales')
                    .near('Point', [s.currPos.lng, s.currPos.lat], 1500)
                    .exec().then(function(res) {
                        s.localesCercanos = res.data;
                        s.removeLocalesMarkers();
                        for (var i = 0; i < res.data.length; i++) {
                            var coord = res.data[i]._geolocation.coordinates;
                            s.nombreLocal[i] = res.data[i].nombre;
                            console.log(i+" "+s.nombreLocal[i]);
                            s.localesCercanosMarker.push(new google.maps.Marker({
                                position: new google.maps.LatLng(coord[1], coord[0]),
                                map: s.map,
                                title: res.data[i].nombre,
                                array_pos: i
                            }));

                            s.localesCercanosMarker[i].addListener('click', function() {
                                s.localSeleccionado = s.localesCercanos[this.array_pos];
                                s.coord = s.localSeleccionado._geolocation.coordinates;
                                var contentString = '<div id="content">'+
                                  '<div id="siteNotice">'+
                                  '</div>'+
                                  '<b>'+s.localSeleccionado.nombre+'</b>'+
                                  '<p>'+'Comercio asociado MiCupon'+'</p>'+
                                  '<p>'+'Cupones disponibles: '+ '<b> 1 </b>'+'</p>'+
                                  '</div>';
                                var infowindow = new google.maps.InfoWindow({
                                content: contentString
                                });
                                console.log(this.array_pos);
                                infowindow.open(s.map, s.localesCercanosMarker[this.array_pos]);
                              });
                            
                        }

                        $ionicLoading.hide();
                    });
    }
    s.removeLocalesMarkers = function() {
                for (var i = 0; i < s.localesCercanosMarker.length; i++) {
                    s.localesCercanosMarker[i].setMap(null)
                }
                s.localesCercanosMarker = [];
    }
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady () {

    /**
    * This callback will be executed every time a geolocation is recorded in the background.
    */
    var callbackFn = function(location) {
        console.log('[js] BackgroundGeolocation callback:  ' + location.latitude + ',' + location.longitude);
        var latLong = new google.maps.LatLng(location.latitude, location.longitude);
        s.map.setCenter(latLong);
        if (s.markerLocation) {
                s.markerLocation.setMap(null);
            }
            s.markerLocation = new google.maps.Marker({
                position: latLong,
                map: s.map,
                icon: 'img/UbicacionUsuario_.png'
            });
        backgroundGeolocation.finish();
    };

    var failureFn = function(error) {
        console.log('BackgroundGeolocation error');
    };

    // BackgroundGeolocation is highly configurable. See platform specific configuration options
    backgroundGeolocation.configure(callbackFn, failureFn, {
        desiredAccuracy: 10,
        stationaryRadius: 20,
        distanceFilter: 30,
        interval: 60000
    });

    // Turn ON the background-geolocation system.  The user will be tracked whenever they suspend the app.
    backgroundGeolocation.start();

    // If you wish to turn OFF background-tracking, call the #stop method.
    // backgroundGeolocation.stop();
}
}]);
