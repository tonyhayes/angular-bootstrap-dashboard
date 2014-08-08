/**
 * Created by anthonyhayes on 4/16/14.
 */
angular.module('dashboardControllers', [])

    .controller("ApplicationController", [
        "$scope", "$timeout", "$q", '$location', '$ocLazyLoad', 'dashboardService','socketService',

        function ($scope, $timeout, $q, $location, $ocLazyLoad, dashboardService, socketService) {

            $scope.isCurrentPath = function (path) {
                return $location.path() == path;
            };



            $scope.loadingDone = false;
            $scope.dbs = dashboardService.getDashboards();

            socketService.getSocket();


            $q.all([


            $ocLazyLoad.load({
                    name: 'dm.widgets.opportunityChart',
                    reconfig: true,
                    files: ['dashboard/components/ng-quick-date/ng-quick-date.css',
                        'dashboard/components/ng-quick-date/ng-quick-date.js',
                    'dashboard/components/d3/d3.min.js', 'dashboard/components/d3/nv.d3.min.css', 'dashboard/components/d3/nv.d3.min.js',
                        'dashboard/components/d3/angular-nvd3.min.js', 'dashboard/app/widgets/opportunity/chart/chart.js'
                    ]
                }),
                $ocLazyLoad.load({
                    name: 'dm.widgets.randommsg',
                    reconfig: true,
                    files: ['dashboard/app/widgets/randommsg/randommsg.js']
                }),
                $ocLazyLoad.load({
                        name: 'dm.widgets.news',
                        reconfig: true,
                        files: ['dashboard/app/widgets/news/news.js']
                    }
                ),
                $ocLazyLoad.load({
                        name: 'dm.widgets.markdown',
                        reconfig: true,
                        files: ["dashboard/components/showdown/showdown.js", "dashboard/components/angular-markdown-directive/markdown.js", "dashboard/app/widgets/markdown/markdown.js"]
                    }
                ),
                $ocLazyLoad.load({
                        name: 'dm.widgets.github',
                        reconfig: true,
                        files: ["dashboard/components/highcharts/highcharts.js", "dashboard/components/highcharts/highcharts-ng.js", "dashboard/app/widgets/github/github.js"]
                    }
                ),
                $ocLazyLoad.load({
                        name: 'dm.widgets.linklist',
                        reconfig: true,
                        files: ['dashboard/app/widgets/linklist/linklist.js']
                    }
                ),
                $ocLazyLoad.load({
                    name: 'dm.widgets.weather',
                    reconfig: true,
                    files: ['dashboard/app/widgets/weather/weather.js']

                })
            ]).then(
                function (data) {

                    console.log('All modules are resolved!');
                    // when evdrything has loaded, flip the switch, and let the
                    // routes do their work
                    $scope.loadingDone = true;
                },
                function (reason) {
                    // if any of the promises fails, handle it
                    // here, I'm just throwing an error message to
                    // the user.
                    console.log(reason);
                    $scope.failure = reason;
                });
        }
    ])
    //this controller is in charge of the loading bar,
    // it's quick and dirty, and does nothing fancy.
    .controller("LoadingController", [
        "$scope", "$timeout",
        function ($scope, $timeout) {
            $scope.percentDone = 0;

            function animateBar() {
                // very crude timeout based animator
                // just to illustrate the sample
                $scope.percentDone += 25;
                if ($scope.loadingDone) {
                    // this is thighly coupled to the appController
                    return;
                }
                $timeout(animateBar, 200);

            }

            animateBar();
        }
    ])
    .controller('DashboardController', function ($scope, $routeParams, dashboardService, localStorageService) {

        var db = $routeParams.dashboardId;

        var model = dashboardService.getDashboard(db);
        $scope.name = db;
        $scope.model = model;
        $scope.collapsible = false;


        $scope.$on('adfDashboardChanged', function (event, name, model) {
            dashboardService.setDashboard(name, model);
            localStorageService.set(name, model);
        });
    })
    .controller('NavigationController', function ($scope, $location, $ocLazyLoad) {

        $scope.navCollapsed = true;


        $scope.toggleNav = function () {
            $scope.navCollapsed = !$scope.navCollapsed;
        };

        $scope.$on('$routeChangeStart', function () {
            $scope.navCollapsed = true;
        });


    })
;
