//'use strict';

marketPlaceApp.factory('clientStockService', ['$http', '$q', 'kendoService',
    function clientStockServiceFactory($http, $q, kendoService) {        
        var service = {
            read: function (clientId, options) {
                var defer = $q.defer();
                clientId = clientId == undefined ? 0 : clientId;
                if (clientId == undefined || clientId <= 0) {
                    data = {
                        "Data": [],
                        "Total": 0,
                        "AggregateResults": null,
                        "Errors": null
                    };
                    defer.resolve(data);
                }
                else {
                    var clientFilter = "{\"clientId\":\"" + clientId + "\", state: { '!': 3 } }";
                    var sailsGetFilter = kendoService.sailsGet("/clientStock/findByClient", "", "dateCreated DESC", options);
                    //alert(sailsGetFilter);
                    $http.get(sailsGetFilter + "&clientId=" + clientId)
                        .success(function (resp) {
                            data = {
                                "Data": resp.results,
                                "Total": resp.total,
                                "AggregateResults": null,
                                "Errors": null
                            };
                            defer.resolve(data);
                        })
                        .error(function (err) {
                            data = {
                                "Data": [],
                                "Total": 0,
                                "AggregateResults": null,
                                "Errors": err
                            };
                            defer.reject(data);
                        });
                }
                return defer.promise;

            },
            statistics: function (clientId) {
                clientId = clientId == undefined ? 0 : clientId;
                var defer = $q.defer();
                $http.get("/clientstock/statistics?clientId=" + clientId)
                    .success(function (resp) {                        
                        defer.resolve(resp);
                    })
                    .error(function (err) {                        
                        defer.reject(err);
                    });
                return defer.promise;
            },
            on: function (eventName, callback) {
                io.socket.on(eventName, function (result) {
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback(result);
                        }
                    });
                });
            },
        };
        return service;
    }
]);
