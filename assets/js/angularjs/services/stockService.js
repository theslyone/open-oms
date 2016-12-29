//'use strict';

marketPlaceApp.factory('stockService', ['$http', '$q',
    function stockService($http, $q) {
        var service = {
            getAll: function () {
                var defer = $q.defer();
                $http.get('/stock')
                    .success(function (res) {
                        defer.resolve(res.results);
                    })
                    .error(function (err) {
                        defer.reject(err);
                    });
                return defer.promise;;
            },
            get: function (filter) {
                var defer = $q.defer();
                $http.get("/stock?where={'symbol':{'contains':'" + filter + "'}}")
                    .success(function (res) {
                        defer.resolve(res.results);
                    })
                    .error(function (err) {
                        defer.reject(err);
                    });
                return defer.promise;
            },
            statistics: function (stockId) {
                stockId = stockId == undefined ? 0 : stockId;
                var defer = $q.defer();
                $http.get('/stock/statistics?stockId=' + stockId)
                    .success(function (resp) {
                        defer.resolve(resp);
                    })
                    .error(function (err) {
                        defer.reject(err);
                    });
                return defer.promise;
            },
            gainers: function (count) {
                var defer = $q.defer();
                $http.get('/api/shareprice/statistics/top_gainers/' + count)
                    .success(function (res) {
                        //alert(JSON.stringify(res,null,4));
                        defer.resolve(res);
                    })
                    .error(function (err) {
                        defer.reject(err);
                    });
                return defer.promise;
            },
            losers: function (count) {
                var defer = $q.defer();
                $http.get('/api/shareprice/statistics/top_losers/' + count)
                    .success(function (res) {
                        defer.resolve(res);
                    })
                    .error(function (err) {
                        defer.reject(err);
                    });
                return defer.promise;
            },
            unchanged: function (count) {
                var defer = $q.defer();
                $http.get('/api/shareprice/statistics/top_unchanged/' + count)
                    .success(function (res) {
                        defer.resolve(res);
                    })
                    .error(function (err) {
                        defer.reject(err);
                    });
                return defer.promise;
            },
            trades: function (count) {
                var defer = $q.defer();
                $http.get('/api/shareprice/statistics/top_trades/' + count)
                    .success(function (res) {
                        defer.resolve(res);
                    })
                    .error(function (err) {
                        defer.reject(err);
                    });
                return defer.promise;
            },
            volume: function (count) {
                var defer = $q.defer();
                $http.get('/api/shareprice/statistics/top_volume/' + count)
                    .success(function (res) {
                        defer.resolve(res);
                    })
                    .error(function (err) {
                        defer.reject(err);
                    });
                return defer.promise;
            },
            value: function (count) {
                var defer = $q.defer();
                $http.get('/api/shareprice/statistics/top_value/' + count)
                    .success(function (res) {
                        defer.resolve(res);
                    })
                    .error(function (err) {
                        defer.reject(err);
                    });
                return defer.promise;
            }
        };

        return service;
    }]);


