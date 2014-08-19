angular.module('dm.widgets.map', ['adf.provider', 'leaflet-directive', 'dashboardServices'])
    .config(function (dashboardProvider) {
        // template object for widgets
        var widget = {
            templateUrl: 'dashboard/app/widgets/map/map.html',
            edit: {
                templateUrl: 'dashboard/app/widgets/map/edit.html'
            }
        };

        // register chart template by extending the template object
        dashboardProvider
            .widget('map', angular.extend({
                title: 'Map',
                description: 'Leaflet Map',
                controller: 'mapController'
            }, widget))
    })

    .controller('mapController', function ($scope, $timeout, $filter, config, msgBus, leafletData, leafletBoundsHelpers) {


        angular.extend($scope, {
            events: {
                map: {
                    enable: ['click', 'blur', 'dragend'],
                    logic: 'emit'
                }
            },
            austin: {
                lat: 30.22050,
                lng: -97.76647,
                zoom: 10
            },
            controls: {
                custom: [ ]
            },
            markers: {
                m1: {
                    lat: 30.22347,
                    lng: -97.75497
                }
            },
            layers: {
                baselayers: {
                    googleTerrain: {
                        name: 'Terrain',
                        layerType: 'TERRAIN',
                        type: 'google'
                    },
                    googleHybrid: {
                        name: 'Hybrid',
                        layerType: 'HYBRID',
                        type: 'google'
                    },
                    googleRoadmap: {
                        name: 'Streets',
                        layerType: 'ROADMAP',
                        type: 'google'
                    },
                    osm: {
                        name: 'StreetMap',
                        type: 'xyz',
                        url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        layerOptions: {
                            subdomains: ['a', 'b', 'c'],
                            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                            continuousWorld: true
                        }
                    },
                    cycle: {
                        name: 'CycleMap',
                        type: 'xyz',
                        url: 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
                        layerOptions: {
                            subdomains: ['a', 'b', 'c'],
                            attribution: '&copy; <a href="http://www.opencyclemap.org/copyright">OpenCycleMap</a> contributors - &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                            continuousWorld: true
                        }
                    }
                },
                overlays: {
                    hillshade: {
                        name: 'Hillshade Europa',
                        type: 'wms',
                        table: 'hillshade',
                        url: 'http://129.206.228.72/cached/hillshade',
                        visible: true,
                        layerOptions: {
                            layers: 'europe_wms:hs_srtm_europa',
                            format: 'image/png',
                            opacity: 0.25,
                            attribution: 'Hillshade layer by GIScience http://www.osm-wms.de',
                            crs: L.CRS.EPSG900913
                        }
                    },
                    fire: {
                        name: 'OpenFireMap',
                        type: 'xyz',
                        table: 'fire',
                        url: 'http://openfiremap.org/hytiles/{z}/{x}/{y}.png',
                        layerOptions: {
                            attribution: '&copy; <a href="http://www.openfiremap.org">OpenFireMap</a> contributors - &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                            continuousWorld: true
                        }
                    },
                    cars: {
                        name: 'Cars',
                        table: 'cars',
                        type: 'group',
                        visible: true
                    },
                    bikes: {
                        name: 'Bicycles',
                        table: 'bikes',
                        type: 'group',
                        visible: false
                    }
                }
            },
            markers: {
                m1: {
                    lat: 30.2643,
                    lng: -97.82363,
                    layer: 'cars',
                    message: "I'm a car"
                },
                m2: {
                    lat: 30.23588,
                    lng: -97.80355,
                    layer: 'cars',
                    message: "I'm a car"
                },
                m3: {
                    lat: 30.20588,
                    lng: -97.84355,
                    layer: 'bikes',
                    message: 'A bike!!'
                },
                m4: {
                    lat: 30.29588,
                    lng: -97.86355,
                    layer: 'bikes'
                },
                m5: {
                    lat: 30.32588,
                    lng: -97.88355
                },
                m6: {
                    lat: 30.34588,
                    lng: -97.90355
                }
            }
        });

        $scope.oneAtATime = true;

        $scope.maps = [];
        angular.forEach($scope.layers.baselayers, function (value, key) {
            console.log(key + ': ' + value);
            var maps = {};
            maps.name = key;
            maps.title = value.name;
            maps.content = value.type;
            maps.top = value.visible;
            maps.type = value.type;
            maps.url = value.url;
            maps.layerOptions = value.layerOptions;
            $scope.maps.push(maps)

        });
        $scope.mapLayers = [];
        angular.forEach($scope.layers.overlays, function (value, key) {
            console.log(key + ': ' + value);
            var mapLayer = {};
            mapLayer.name = key;
            mapLayer.table = value.table;
            mapLayer.title = value.name;
            mapLayer.content = value.type;
            mapLayer.visible = value.visible;
            if (mapLayer.visible) {
                mapLayer.label = 'Remove This Layer'
            } else {
                mapLayer.label = 'Add This Layer'
            }
            $scope.mapLayers.push(mapLayer)

        });

        $scope.layerUp = function (index, event) {
            // stop accordion behavior
            event.preventDefault();
            event.stopPropagation();

            if (index <= 0 || index >= $scope.mapLayers.length)
                return;
            var temp = $scope.mapLayers[index];
            $scope.mapLayers[index] = $scope.mapLayers[index - 1];
            $scope.mapLayers[index - 1] = temp;
        };

        $scope.layerDown = function (index, event) {
            // stop accordion behavior
            event.preventDefault();
            event.stopPropagation();

            if (index < 0 || index >= ($scope.mapLayers.length - 1))
                return;
            var temp = $scope.mapLayers[index];
            $scope.mapLayers[index] = $scope.mapLayers[index + 1];
            $scope.mapLayers[index + 1] = temp;
        };

        $scope.layerRemove = function (index, event) {
            // stop accordion behavior
            event.preventDefault();
            event.stopPropagation();

            $scope.mapLayers.splice(index, 1);
        };


        $scope.$on('leafletDirectiveMap.click', function (event, args) {
            var latlng = args.leafletEvent.latlng;
            msgBus.emitMsg(config.publish, {'latLng': latlng}, 'mapclick', 'map' );
        });

        $scope.$on('leafletDirectiveMap.dragend', function (event, args) {

            leafletData.getMap().then(function (map) {
                msgBus.emitMsg(config.publish, {'mapBounds': map.getBounds()}, 'mapdrag', 'map' );

            });
        });

        msgBus.onMsg(config.subscribe, function (event, data) {

            // assume noise in channel
            if(data.latLng) {
                toastr.info('Lat: ' + data.latLng.lat + '<br>Lng: ' + data.latLng.lng);
            }
            if(data.mapBounds) {
                leafletData.getMap().then(function (map) {
                    var newScopeBounds = {
                        northEast: {
                            lat: data.mapBounds._northEast.lat,
                            lng: data.mapBounds._northEast.lng
                        },
                        southWest: {
                            lat: data.mapBounds._southWest.lat,
                            lng: data.mapBounds._southWest.lng
                        }
                    };
                    map.fitBounds(leafletBoundsHelpers.createLeafletBounds(newScopeBounds));

                });
            }
        }, $scope);


        var origMapConfig = angular.copy($scope.layers);

         $scope.toggleLayer = function (layer) {
            $scope.layers.overlays[layer].visible = !$scope.layers.overlays[layer].visible;
            angular.forEach($scope.mapLayers, function (value) {
                if (value.name == layer) {
                    if (value.label == 'Add This Layer') {
                        value.label = 'Remove This Layer'
                    } else {
                        value.label = 'Add This Layer'
                    }
                }

            });
        };

        $scope.toggleMap = function (mapName, MapTitle) {
            leafletData.getMap().then(function (map) {
                delete $scope.layers.baselayers;
                $scope.layers.baselayers = {};
                var topMap = angular.copy(origMapConfig.baselayers[mapName]);
                $scope.layers.baselayers[MapTitle] = angular.copy(topMap);
            });
        };



    })

;