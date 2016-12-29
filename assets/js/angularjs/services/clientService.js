//'use strict';

marketPlaceApp.factory('clientService', function clientService($http, $q) {
    var service = {
        getAll: function () {
            var defer = $q.defer();

            $http.get("/client")
                .success(function (res) {
                    defer.resolve(res.results);
                })
                .error(function (err) {
                    defer.reject(err);
                });
            return defer.promise;
        },
        get: function (name) {
            var defer = $q.defer();
            var where = {
                or: [
                    { firstName: { 'contains': name } },
                    { lastName: { 'contains': name } }
                ]
            };
            $http.get("/client?where=" + JSON.stringify(where))
                .success(function (res) {
                    //alert(JSON.stringify(res,null,4));
                    defer.resolve(res.results);
                })
                .error(function (err) {
                    defer.reject(err);
                });
            return defer.promise;
        },
        getByCscsNumber: function (number) {
            var defer = $q.defer();
            var where = { cscsNumber: number };
            $http.get("/client?where=" + JSON.stringify(where))
                .success(function (res) {
                    //alert(JSON.stringify(res,null,4));
                    defer.resolve(res.results);
                })
                .error(function (err) {
                    defer.reject(err);
                });
            return defer.promise;
        },
        setCurrent: function (id) {
            var defer = $q.defer();
            $http.get("/client/setcurrent?id=" + id)
                .success(function (res) {
                    //alert(JSON.stringify(res,null,4));
                    defer.resolve(res);
                })
                .error(function (err) {
                    defer.reject(err);
                });
            return defer.promise;
        },
        getCurrent: function () {
            var defer = $q.defer();
            $http.get("/client/getcurrent")
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
});
