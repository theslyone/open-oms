//'use strict';

marketPlaceApp.factory('executionReportService', ['$http', '$q', 'kendoService',
    function executionReportServiceFactory($http, $q, kendoService) {        
        var service = {
            read: function (orderBookId, options) {
                orderBookId = orderBookId == undefined ? 0 : orderBookId;
                var orderBookFilter = "{\"orderBook\":\"" + orderBookId + "\"}";
                var defer = $q.defer();
                var sailsGetFilter = kendoService.sailsGet("/executionReport", orderBookFilter, "date DESC", options);
                $http.get(sailsGetFilter)
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
