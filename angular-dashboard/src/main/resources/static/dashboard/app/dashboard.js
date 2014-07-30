angular.module('db', [
    'adf', 'LocalStorageModule', 'ngRoute', 'oc.lazyLoad', 'dashboardControllers', 'dashboardServices'
])
    .config(function ($routeProvider, localStorageServiceProvider, $ocLazyLoadProvider) {
        localStorageServiceProvider.setPrefix('adf');

        $routeProvider.when('/dashboard', {
            templateUrl: 'dashboard/app/partials/dashboard.html',
            controller: 'DashboardController'
        })
            .when('/dashboard/:dashboardId', {
                templateUrl: 'dashboard/app/partials/dashboard.html',
                controller: 'DashboardController'
            })
            .otherwise({
                redirectTo: '/dashboard'
            });


        $ocLazyLoadProvider.config({
            asyncLoader: $script
        });


    });

