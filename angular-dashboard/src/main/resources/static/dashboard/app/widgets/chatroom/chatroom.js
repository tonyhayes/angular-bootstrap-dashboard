angular.module('dm.widgets.chatroom', ['adf.provider', 'dashboardServices'])
    .config(function (dashboardProvider) {
        // template object for widgets
        var widget = {
            templateUrl: 'dashboard/app/widgets/chatroom/chatroom.html',
            edit: {
                templateUrl: 'dashboard/app/widgets/chatroom/editChat.html'
            }
        };

        // register chart template by extending the template object
        dashboardProvider
            .widget('chatroom', angular.extend({
                title: 'Chat Room',
                description: 'Chat',
                controller: 'chatController'
            }, widget))
    })

    .controller('chatController', function ($scope, $timeout, $filter, config, msgBus, dashboardService) {

        $scope.messages = [];
        $scope.chat = {};
        $scope.chat.connect = false;

        var sessionDate = new Date().getTime();
        var token = dashboardService.getToken();

        $scope.connect = function () {
            msgBus.queueMsg(config.publish, {'chatdate': sessionDate}, 'initialize', 'chatSession' );
            msgBus.queueMsg(config.publish, {'chatdate': sessionDate}, 'getUsers', 'chatSessionUsers' );
            $scope.chat.connect = true;
         };

        $scope.disconnect = function () {
            msgBus.queueMsg(config.publish, {'chatdate': sessionDate}, 'disconnect', 'chatSession' );
            $scope.messages = [];
            $scope.chat.connect = false;
        };

        $scope.send = function () {
            msgBus.emitMsg(config.publish, {id:token, name:'someone', 'messageText': angular.copy($scope.userMessage)}, 'send', 'chatSession' );
            $scope.userMessage = '';
        };



        msgBus.onMsg(config.subscribe, function (event, data) {

            // assume noise in channel
            if($scope.chat.connect && data.messageText){

                // if the date has been changed via a socket connection
                // then I need to wrap the chart function in a timeout
                // to force angular to call thier digest/apply function
                //http://stackoverflow.com/questions/21658490/angular-websocket-and-rootscope-apply

                $timeout(function () {
                    if (data.id == token){
                        data.name = 'me'
                    }
                    $scope.messages.push(data)
                }, 0);
            }


        }, $scope);


    })
;