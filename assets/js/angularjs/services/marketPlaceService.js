//'use strict';

marketPlaceApp.factory('marketPlaceService', ['$rootScope', '$http', '$q', 'portalUrl',
    function ($rootScope, $http, $q, portalUrl) {
        function marketPlaceServiceFactory(serverUrl, hubName, startOptions) {
            //io.sails.url = serverUrl;
            //io.sails.autoConnect = false;
            var connection;

            return {
                connect: function(callback) {
                    connection = io.sails.connect();
                    //$rootScope.$apply(function () {
                    if (callback) {
                        //console.log('market place service started');
                        callback();
                    }
                    //});
                },
                disconnect: function(callback) {
                    if (io.socket.isConnected()) {
                        io.sails.disconnect();
                        $rootScope.$apply(function() {
                            if (callback) {
                                callback(result);
                            }
                        });
                    }
                },
                reconnect: function(callback) {
                    if (!io.socket.isConnected()) {
                        io.sails.reconnect();
                        $rootScope.$apply(function() {
                            if (callback) {
                                callback(result);
                            }
                        });
                    }
                },
                on: function(eventName, callback) {
                    io.socket.on(eventName, function(result) {
                        $rootScope.$apply(function() {
                            if (callback) {
                                callback(result);
                            }
                        });
                    });
                },
                off: function(eventName, callback) {
                    io.socket.off(eventName, function(result) {
                        $rootScope.$apply(function() {
                            if (callback) {
                                callback(result);
                            }
                        });
                    });
                },
                invoke: function(methodName, callback) {
                    io.socket.get(methodName, function(result) {
                        $rootScope.$apply(function() {
                            if (callback) {
                                callback(result);
                            }
                        });
                    });
                    //.fail(function (error) {
                    //    console.error('Error invoking ' + methodName + ' on server: ' + error);
                    //});
                },
                get: function (methodName) {
                    var defer = $q.defer();
                    $http.get("/marketPlace/" + methodName)
                        .success(function (res) {
                            defer.resolve(res);
                        })
                        .error(function (err) {
                            defer.reject(err);
                        });                    
                    return defer.promise;
                },
                post: function(methodName, data) {
                    var defer = $q.defer();
                    $http.post("/marketPlace/" + methodName, data)
                        .success(function (res) {
                            defer.resolve(res);
                        })
                        .error(function (err) {
                            defer.reject(err);
                        });
                    return defer.promise;
                },
                request: function(options, callback) {
                    /*
                    {
                      method: 'get',
                      url: '/user/3/friends',
                      headers: {
                        'x-csrf-token': 'ji4brixbiub3'
                      }
                    */
                    io.socket.request(options, function(result) {
                            $rootScope.$apply(function() {
                                if (callback) {
                                    callback(result);
                                }
                            });
                        })
                        .fail(function(error) {
                            console.error('Error invoking ' + methodName + ' on server: ' + error);
                        });
                },
                http: function(url, method, callback) {
                    $http({
                        method: method,
                        url: url
                    }).then(function successCallback(response) {
                        if (callback) {
                            callback(result);
                        }
                    }, function errorCallback(response) {
                        console.error('Service error: ' + url + ' on server: ' + response);
                    });
                },
            };
        };

        return marketPlaceServiceFactory;
    }
]);
