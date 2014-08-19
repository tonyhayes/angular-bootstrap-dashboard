

'use strict';

angular.module('dm.widgets.iframe', ['adf.provider'])
    .config(function (dashboardProvider) {
        dashboardProvider
            .widget('iframe', {
                title: 'Web Page',
                description: 'Displays an external web page',
                controller: 'iFrameController',
                templateUrl: 'dashboard/app/widgets/iframe/iframe.html',
                reload: true,
                edit: {
                    templateUrl: 'dashboard/app/widgets/iframe/edit.html'
                }
            });
    }).controller('iFrameController', function ($scope, $sce, config) {
        if (!config.URL) {
            return;
        }
        $scope.detailFrame = $sce.trustAsResourceUrl(config.URL);
    });
