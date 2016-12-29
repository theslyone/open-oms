//'use strict';
marketPlaceApp.factory('enumService', function enumService($http) {
    var service = {
        getSides: function () {
            return $http.get('/enum/sides')
                .success(function (result) {
                    return result;
                });
        },
        getOrderTypes: function () {
            return $http.get('/enum/orderTypes')
                .success(function (result) {
                    return result;
                });
        },
        getOrderStatus: function () {
            return $http.get('/enum/orderStatus')
                .success(function (result) {
                    return result;
                });
        },
        getExecTypes: function () {
            return $http.get('/enum/execTypes')
                .success(function (result) {
                    return result;
                });
        },
    };

    return service;
});


