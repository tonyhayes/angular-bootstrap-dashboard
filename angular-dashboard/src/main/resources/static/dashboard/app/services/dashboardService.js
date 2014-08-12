/* Services */


angular.module('dashboardServices', []).
    value('version', '0.1')

// simple message\ing (pub/sub)
// -- if we need something more complex -
// http://codingsmackdown.tv/blog/2013/04/29/hailing-all-frequencies-communicating-in-angularjs-with-the-pubsub-design-pattern/
    .factory('msgBus', ['$rootScope','socketService', function ($rootScope, socketService) {
        var msgBus = {};

        msgBus.emitMsg = function (channel, data, action, type) {
            data = data || {};
            $rootScope.$emit(channel, data);
            socketService.sendSocketMessage(channel, data, action, type);

        };
        msgBus.broadcastMsg = function (channel, data, action, type) {
            data = data || {};
            $rootScope.$broadcast(channel, data);
            socketService.sendSocketMessage(channel, data, action, type);
        };
        msgBus.onMsg = function (msg, func, scope) {
            var unbind = $rootScope.$on(msg, func);
            if (scope) {
                scope.$on('$destroy', unbind);
            }
        };

        msgBus.queueMsg = function (channel, data, action, type) {
            socketService.sendSocketMessage(channel, data, action, type);
        };

        return msgBus;
    }])
    .service('socketService', function ($rootScope, dashboardService) {


        var stompClient = null;

        var token = dashboardService.getToken();
        var socket = new SockJS(dmApplicationEntryPoint+'/socket');

        this.getSocket = function () {
            stompClient = Stomp.over(socket);
            stompClient.connect({}, function (frame) {
                console.log('Connected: ' + frame);
                stompClient.subscribe('/widget', function (message) {
                    console.log(message);
                    var msg = JSON.parse(message.body);
                    if (token == msg.token ) {
                        if(msg.action == 'initialize'){
                            $rootScope.$emit(msg.channel, msg.message);
                            console.log('initial message -- same token');
                        }else{
                            console.log('discarding message -- same token');
                        }
                    }else{
                        if(msg.action == 'initialize'){
                            console.log('discarding message -- initialize for new dashboard user');
                        }else{
                            $rootScope.$emit(msg.channel, msg.message);
                        }
                    }
                });
            });
        };
        this.sendSocketMessage = function (channel, data, action, type ) {
            if(!channel){
                channel = 'missingChannel';
                console.log('socket configuration error -- channel not defined');
            }
            if(!action){
                action = 'message';
            }
            if(!type){
                type = 'message';
            }
            var payLoad = JSON.stringify({ token:token, channel:channel, action:action, type: type, message: data });
            stompClient.send("/app/socket", {} , payLoad);
        };




    })
    .service('dashboardService', function (localStorageService) {

        var token = makeToken();
              // if widget needs a unique identifier within its message
        this.getToken = function () {
            return token;
        };

        this.getUniqueToken = function () {

            var newToken = makeToken();
            return newToken;
        };

        function makeToken()
        {
            var token = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for( var i=0; i < 5; i++ )
                token += possible.charAt(Math.floor(Math.random() * possible.length));

            return token;
        }

        this.getDashboards = function () {
            //need service to read from server
            return db;
        };
        this.getDashboard = function (name) {
            var model = localStorageService.get(name);
            if (model) {
                return model;
            }

            angular.forEach(db, function (dashboard) {
                if (dashboard.id == name) {
                    return dashboard;
                }
             });
            // this is probably dangerous -- change this to show a dashboard splash page
            if(db.length > 0){
                return db[0];
            }

        };
        this.setDashboard = function (name, model) {
            var found = false;
            localStorageService.set(name, model);
            angular.forEach(db, function (dashboard) {
                if (dashboard.id == name) {
                    dashboard = model;
                    found = true;
                }
            });
            if(!found){
                db.push(model);
            }
        };

        this.removeDashboard = function (name) {
            localStorageService.remove(name);
            angular.forEach(db, function (dashboard, idx) {
                if (dashboard.id == name) {
                    db.splice(idx, 1);
                }
            });
        };

        var db = [
            {
                title: "Dashboard 01",
                id: "dashboard1",
                structure: "4-8",
                rows: [
                    {
                        columns: [
                            {
                                styleClass: "col-md-4",
                                widgets: [
                                    {
                                        type: "linklist",
                                        config: {
                                            links: [
                                                {
                                                    title: "SCM-Manager",
                                                    href: "http://www.scm-manager.org"
                                                },
                                                {
                                                    title: "Github",
                                                    href: "https://github.com"
                                                },
                                                {
                                                    title: "Bitbucket",
                                                    href: "https://bitbucket.org"
                                                },
                                                {
                                                    title: "Stackoverflow",
                                                    href: "http://stackoverflow.com"
                                                }
                                            ]
                                        },
                                        title: "Links"
                                    },
                                    {
                                        type: "weather",
                                        config: {
                                            location: "Hildesheim"
                                        },
                                        title: "Weather Hildesheim"
                                    },
                                    {
                                        type: "weather",
                                        config: {
                                            location: "Edinburgh"
                                        },
                                        title: "Weather"
                                    },
                                    {
                                        type: "weather",
                                        config: {
                                            location: "Dublin,IE"
                                        },
                                        title: "Weather"
                                    }
                                ]
                            },
                            {
                                styleClass: "col-md-8",
                                widgets: [
                                    {
                                        type: "randommsg",
                                        config: {},
                                        title: "Douglas Adams"
                                    },
                                    {
                                        type: "markdown",
                                        config: {
                                            content: "![scm-manager logo](https://bitbucket.org/sdorra/scm-manager/wiki/resources/scm-manager_logo.jpg)\n\nThe easiest way to share and manage your Git, Mercurial and Subversion repositories over http.\n\n* Very easy installation\n* No need to hack configuration files, SCM-Manager is completely configureable from its Web-Interface\n* No Apache and no database installation is required\n* Central user, group and permission management\n* Out of the box support for Git, Mercurial and Subversion\n* Full RESTFul Web Service API (JSON and XML)\n* Rich User Interface\n* Simple Plugin API\n* Useful plugins available ( f.e. Ldap-, ActiveDirectory-, PAM-Authentication)\n* Licensed under the BSD-License"
                                        },
                                        title: "Markdown"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                title: "Dashboard 02",
                id: "dashboard2",
                structure: "6-6",
                rows: [
                    {
                        columns: [
                            {
                                styleClass: "col-md-6",
                                widgets: [
                                    {
                                        type: "markdown",
                                        config: {
                                            content: "# angular-dashboard-framework\n\n> Dashboard framework with Angular.js, Twitter Bootstrap and Font Awesome.\n\nThe api of angular-dashboard-framework (adf) is documented [here](http://sdorra.github.io/angular-dashboard-framework/docs/).\n\n## Demo\n\nA live demo of the adf can be viewed [here](http://sdorra.github.io/angular-dashboard-framework/). The demo uses html5 localStorage to store the state of the dashboard. The source of the demo can be found [here](https://github.com/sdorra/angular-dashboard-framework/tree/master/sample).\n\n## Getting started\n\nInstall bower and grunt:\n\n```bash\nnpm install -g bower\nnpm install -g grunt-cli\n```\n\nClone the repository:\n\n```bash\ngit clone https://github.com/sdorra/angular-dashboard-framework\ncd angular-dashboard-framework\n```\n\nInstall npm and bower dependencies:\n\n```bash\nnpm install --save\nbower install\n```\n\nYou can start the sample dashboard, by using the server grunt task:\n\n```bash\ngrunt server\n```\n\nNow you open the sample in your browser at http://localhost:9001/sample\n\nOr you can create a release build of angular-dashboard-framework and the samples:\n\n```bash\ngrunt\ngrunt sample\n```\nThe sample and the final build of angular-dashboard-framework are now in the dist directory."
                                        },
                                        title: "Markdown"
                                    }
                                ]
                            },
                            {
                                styleClass: "col-md-6",
                                widgets: [
                                    {
                                        type: "githubAuthor",
                                        config: {
                                            path: "angular/angular.js"
                                        },
                                        title: "Github Author"
                                    },
                                    {
                                        type: "githubHistory",
                                        config: {
                                            path: "sdorra/angular-dashboard-framework"
                                        },
                                        title: "Github History"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                title: "Dashboard 06",
                id: "dashboard4",
                structure: "4-8",
                rows: [{
                    columns: [
                        {
                            styleClass: "col-md-6",
                            widgets: [
                            ]
                        },
                        {
                            styleClass: "col-md-6",
                            widgets: [
                            ]
                        }

                    ]
                }

                ]
            }

        ];


    })
    .service('ModalService', ['$modal',
        function ($modal) {

            var modalDefaults = {
                backdrop: true,
                keyboard: true,
                modalFade: true,
                templateUrl: 'app/partials/util/modal.html'
            };

            var modalOptions = {
                closeButtonText: 'Close',
                actionButtonText: 'OK',
                headerText: 'Proceed?',
                bodyText: 'Perform this action?',
                record: null,
                model1: null,
                model2: null,
                model3: null,
                model4: null
            };

            this.showModal = function (customModalDefaults, customModalOptions) {
                if (!customModalDefaults) customModalDefaults = {};
                customModalDefaults.backdrop = 'static';
                return this.show(customModalDefaults, customModalOptions);
            };

            this.show = function (customModalDefaults, customModalOptions) {
                //Create temp objects to work with since we're in a singleton service
                var tempModalDefaults = {};
                var tempModalOptions = {};

                //Map angular-ui modal custom defaults to modal defaults defined in this service
                angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

                //Map modal.html $scope custom properties to defaults defined in this service
                angular.extend(tempModalOptions, modalOptions, customModalOptions);

                if (!tempModalDefaults.controller) {
                    tempModalDefaults.controller = function ($scope, $modalInstance) {
                        $scope.modalOptions = tempModalOptions;
                        $scope.modalOptions.ok = function (result) {
                            $modalInstance.close('ok');
                        };
                        $scope.modalOptions.close = function (result) {

                            $modalInstance.close('cancel');
                        };
                    };
                }

                return $modal.open(tempModalDefaults).result;
            };


        }
    ])
    .service('DialogService', ['$dialog',
        function ($dialog) {
            var dialogDefaults = {
                backdrop: true,
                keyboard: true,
                backdropClick: true,
                dialogFade: true,
                templateUrl: 'app/partials/util/dialog.html'
            };

            var dialogOptions = {
                closeButtonText: 'Close',
                actionButtonText: 'OK',
                headerText: 'Proceed?',
                bodyText: 'Perform this action?'
            };

            this.showModalDialog = function (customDialogDefaults, customDialogOptions) {
                if (!customDialogDefaults) customDialogDefaults = {};
                customDialogDefaults.backdropClick = false;
                this.showDialog(customDialogDefaults, customDialogOptions);
            };

            this.showDialog = function (customDialogDefaults, customDialogOptions) {
                //Create temp objects to work with since we're in a singleton service
                var tempDialogDefaults = {};
                var tempDialogOptions = {};

                //Map angular-ui dialog custom defaults to dialog defaults defined in this service
                angular.extend(tempDialogDefaults, dialogDefaults, customDialogDefaults);

                //Map dialog.html $scope custom properties to defaults defined in this service
                angular.extend(tempDialogOptions, dialogOptions, customDialogOptions);

                if (!tempDialogDefaults.controller) {
                    tempDialogDefaults.controller = function ($scope, dialog) {
                        $scope.dialogOptions = tempDialogOptions;
                        $scope.dialogOptions.close = function (result) {
                            dialog.close(result);
                        };
                        $scope.dialogOptions.callback = function () {
                            dialog.close();
                            customDialogOptions.callback();
                        };
                    };
                }

                var d = $dialog.dialog(tempDialogDefaults);
                d.open();
            };

            this.showMessage = function (title, message, buttons) {
                var defaultButtons = [
                    {
                        result: 'ok',
                        label: 'OK',
                        cssClass: 'btn-primary'
                    }
                ];
                var msgBox = new $dialog.dialog({
                    dialogFade: true,
                    templateUrl: 'template/dialog/message.html',
                    controller: 'MessageBoxController',
                    resolve: {
                        model: function () {
                            return {
                                title: title,
                                message: message,
                                buttons: buttons === null ? defaultButtons : buttons
                            };
                        }
                    }
                });
                return msgBox.open();
            };
        }

    ]);