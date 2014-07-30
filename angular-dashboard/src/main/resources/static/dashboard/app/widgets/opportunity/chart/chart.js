angular.module('dm.widgets.opportunityChart', ['adf.provider', "ngQuickDate", 'nvd3', 'dashboardServices'])
    .config(function (dashboardProvider) {
        // template object for widgets
        var widget = {
            templateUrl: 'dashboard/app/widgets/opportunity/chart/chart.html',
            reload: true,
            resolve: {
                cData: function (opportunityChartService) {
                        return opportunityChartService.get();
                }
            },
            edit: {
                templateUrl: 'dashboard/app/widgets/opportunity/chart/editChart.html'
            }
        };

        // register github template by extending the template object
        dashboardProvider
            .widget('opportunityChart', angular.extend({
                title: 'Opportunity History',
                description: 'Opportunities by salesman - by expected revenue or deal',
                controller: 'opportunityChartController'
            }, widget))
    })
    .service('opportunityChartService', function ($q, $http) {
        return {
            get: function () {
                var deferred = $q.defer();
                var url =  dmApplicationEntryPoint + '/opportunities/search/findAllOpportunities';
                $http.get(url)
                    .success(function (data) {
                        if (data && data._embedded) {
                            deferred.resolve(data._embedded);
                        } else {
                            deferred.reject();
                        }
                    })
                    .error(function () {
                        deferred.reject();
                    });
                return deferred.promise;
            }
        };
    })
    .filter('dateChartObjectFilter', function () {

        return function (chartObj, filterDate) {
            if (!filterDate) return chartObj;

            var d = new Date(filterDate).getTime();

            var matches = [];

            angular.forEach(chartObj, function (type) {
                if (type.opportunityDate >= d) {
                    matches.push(type);
                }
            });
            return matches;
        };

    })

    .controller('opportunityChartController', function ($scope, $timeout, $filter, config, cData, msgBus) {

        var chartData = {};
        var savedData;
        var inProcess = false;

        $scope.selectedDate = new Date(2012, 1, 16).getTime();
        $scope.options =  {
            chart: {
                type: 'multiBarHorizontalChart',
                    height: 450,
                    margin: {
                    top: 20,
                        right: 50,
                        bottom: 60,
                        left: 150
                },
                x: function (d) {
                    return d.label;
                },
                y: function (d) {
                    return d.value;
                },
                showControls: true,
                    showValues: true,
                    valueFormat: function (d) {
                    return d3.format('s,.4f')(d);
                },
                transitionDuration: 500,
                    xAxis: {
                    showMaxMin: false
                },
                yAxis: {
                    axisLabel: 'Opportunities',
                        tickFormat: function (d) {
                        return d3.format('s,.2f')(d);
                    }
                }
            }

        }
        ;

        $scope.opportunityData = cData.opportunities;
        $scope.opportunityDataBySalesPerson = {};

        if(config.counts){
            $scope.countValue = true;
        }

        //send to chart draw function
        sliceAndDice();

        /*organize opportunity data into chart data categories */
        function sliceAndDice() {
            if ($scope.opportunityData.length) {

                $scope.opportunityDataBySalesPerson = {};


                angular.forEach($scope.opportunityData, function (opportunity) {
//sales person
                    if ($scope.opportunityDataBySalesPerson[opportunity.statusDescription]) {
                        if ($scope.opportunityDataBySalesPerson[opportunity.statusDescription][opportunity.salesPersonId]) {
                            $scope.opportunityDataBySalesPerson[opportunity.statusDescription][opportunity.salesPersonId].count += 1;
                            if (opportunity.potentialRevenue){
                                if (typeof opportunity.potentialRevenue === 'string') {
                                    var money = parseFloat(opportunity.potentialRevenue.replace(/[^\d\.]/g, ''));
                                }else{
                                    money = opportunity.potentialRevenue;
                                }
                                $scope.opportunityDataBySalesPerson[opportunity.statusDescription][opportunity.salesPersonId].money += money;
                            }
                        } else {
                            $scope.opportunityDataBySalesPerson[opportunity.statusDescription][opportunity.salesPersonId] = {};
                            $scope.opportunityDataBySalesPerson[opportunity.statusDescription][opportunity.salesPersonId].name = opportunity.salesPersonDescription;
                            $scope.opportunityDataBySalesPerson[opportunity.statusDescription][opportunity.salesPersonId].count = 1;
                            if (opportunity.potentialRevenue){
                                if (typeof opportunity.potentialRevenue === 'string') {
                                    var money = parseFloat(opportunity.potentialRevenue.replace(/[^\d\.]/g, ''));
                                }else{
                                    money = opportunity.potentialRevenue;
                                }
                                $scope.opportunityDataBySalesPerson[opportunity.statusDescription][opportunity.salesPersonId].money = money;
                            }
                        }
                    } else {
                        $scope.opportunityDataBySalesPerson[opportunity.statusDescription] = {};
                        $scope.opportunityDataBySalesPerson[opportunity.statusDescription].name = opportunity.statusDescription;
                        $scope.opportunityDataBySalesPerson[opportunity.statusDescription][opportunity.salesPersonId] = {};
                        $scope.opportunityDataBySalesPerson[opportunity.statusDescription][opportunity.salesPersonId].name = opportunity.salesPersonDescription;
                        $scope.opportunityDataBySalesPerson[opportunity.statusDescription][opportunity.salesPersonId].count = 1;
                        if (opportunity.potentialRevenue){
                            if (typeof opportunity.potentialRevenue === 'string') {
                                var money = parseFloat(opportunity.potentialRevenue.replace(/[^\d\.]/g, ''));
                            }else{
                                money = opportunity.potentialRevenue;
                            }
                            $scope.opportunityDataBySalesPerson[opportunity.statusDescription][opportunity.salesPersonId].money = money;
                        }
                    }
                });

            } else {
                //no data!
                $scope.opportunityDataBySalesPerson = {};
            }
            barChartDataFormatter();
        }

        function barChartDataFormatter() {

            chartData.multiBarHorizontalChart = [];
            chartData.multiBarHorizontalChart.sales = [];
            var items = 0;
            angular.forEach($scope.opportunityDataBySalesPerson, function (opportunity) {
                var values = [];
                angular.forEach(opportunity, function (type) {
                    if (typeof type === 'object') {
                        if($scope.countValue){
                            values.push({"label": type.name, "value": type.count});
                        }else{
                            values.push({"label": type.name, "value": type.money});
                        }
                        items++;
                    }
                });
                if(values.length){
                    chartData.multiBarHorizontalChart.sales.push({"key": opportunity.name, "values": values});
                }
            });
            $scope.data = chartData.multiBarHorizontalChart.sales;
            $scope.options.chart.height = items * 30 + 100;
            if($scope.countValue){
                $scope.options.chart.yAxis.axisLabel = 'Opportunities by Deals'
            }else{
                $scope.options.chart.yAxis.axisLabel = 'Opportunities by Revenue'
            }
        }


        // when the date changes, we want to filter and redraw the chart
        $scope.$watch("countValue", function (value) {

            barChartDataFormatter();
        });

        // when the revenue/deal button changes , we want to redraw the chart
        $scope.$watch("selectedDate", function (newDate) {

            if(!inProcess){
                if(config.dateSync){
                    msgBus.emitMsg(config.publish, {'date': newDate});
                }else{
                    dateChanged(newDate);
                }
            }



        });
        msgBus.onMsg(config.subscribe, function (event, data) {

            dateChanged(data.date);

        }, $scope);

        function dateChanged(dt) {
            inProcess = true;

            $scope.selectedDate = dt;
            if (savedData) {
                $scope.opportunityData = angular.copy(savedData);
            } else {
                savedData = angular.copy($scope.opportunityData);
            }
            $scope.opportunityData = $filter("dateChartObjectFilter")($scope.opportunityData, dt);
            // now run function to load/filter the data
            sliceAndDice();

            inProcess = false;

        }


    })
;