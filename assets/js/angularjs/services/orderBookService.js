//'use strict';

marketPlaceApp.factory('orderBookService', ['$http', '$q', 'kendoService',
    function orderBookServiceFactory($http, $q, kendoService) {        
        var service = {
            'read': function (clientId, options) {
                clientId = clientId == undefined ? 0 : clientId;
                var clientFilter = "{\"client\":\"" + clientId + "\"}";
                var defer = $q.defer();
                var sailsGetFilter = kendoService.sailsGet("/orderbook", clientFilter, "date DESC", options);
                $http.get(sailsGetFilter)
                    .success(function (resp) {
                        //alert(JSON.stringify(resp, null, 4));

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
                return defer.promise;
            },
            trade: function (clientId, orderBook) {
                var defer = $q.defer();
                $http.post('/orderbook/trade?clientId=' + clientId, orderBook)
                    .success(function (resp) {
                        data = {
                            "Data": [resp],
                            "Total": 1,
                            "AggregateResults": null,
                            "Errors": null
                        };
                        defer.resolve(data);
                    }).error(function (err) {
                        data = {
                            "Data": [],
                            "Total": 0,
                            "AggregateResults": null,
                            "Errors": err
                        };
                        defer.reject(data);
                    });
                return defer.promise;
            },
            retrade: function (clientId, orderBook) {
                var defer = $q.defer();
                $http.post('/orderbook/retrade?clientId=' + clientId, orderBook)
                    .success(function (resp) {
                        data = {
                            "Data": [resp],
                            "Total": 1,
                            "AggregateResults": null,
                            "Errors": null
                        };
                        defer.resolve(data);
                    }).error(function (err) {
                        data = {
                            "Data": [],
                            "Total": 0,
                            "AggregateResults": null,
                            "Errors": err
                        };
                        defer.reject(data);
                    });
                return defer.promise;
            },
            cancel: function (id) {
                var defer = $q.defer();
                $http.get('/orderbook/cancel?id=' + id)
                    .success(function (resp) {
                        data = {
                            "Data": resp,
                            "Total": 1,
                            "AggregateResults": null,
                            "Errors": null
                        };
                        defer.resolve(data);
                    }).error(function (err) {
                        data = {
                            "Data": [],
                            "Total": 0,
                            "AggregateResults": null,
                            "Errors": err
                        };
                        defer.reject(data);
                    });
                return defer.promise;
            },
            status: function (id) {
                var defer = $q.defer();
                $http.get('/orderbook/status?id=' + id)
                    .success(function (resp) {
                        data = {
                            "Data": resp,
                            "Total": 1,
                            "AggregateResults": null,
                            "Errors": null
                        };
                        defer.resolve(data);
                    }).error(function (err) {
                        data = {
                            "Data": [],
                            "Total": 0,
                            "AggregateResults": null,
                            "Errors": err
                        };
                        defer.reject(data);
                    });
                return defer.promise;
            },
            statusAll: function (ids) {
                var defer = $q.defer();
                $http.get('/orderbook/statusAll?ids=' + ids)
                    .success(function (resp) {
                        data = {
                            "Data": resp,
                            "Total": ids.length,
                            "AggregateResults": null,
                            "Errors": null
                        };
                        defer.resolve(data);
                    }).error(function (err) {
                        data = {
                            "Data": [],
                            "Total": 0,
                            "AggregateResults": null,
                            "Errors": err
                        };
                        defer.reject(data);
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
