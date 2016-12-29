//'use strict';

marketPlaceApp.factory('userService', ['$http', '$q', '$localStorage', 'Session',

    function userServiceFactory($http, $q, $localStorage, Session) {
        var baseUrl = "";

        function changeUser(user) {
            angular.extend(currentUser, user);
        }

        function urlBase64Decode(str) {
            var output = str.replace('-', '+').replace('_', '/');
            switch (output.length % 4) {
                case 0:
                    break;
                case 2:
                    output += '==';
                    break;
                case 3:
                    output += '=';
                    break;
                default:
                    throw 'Illegal base64url string!';
            }
            return window.atob(output);
        }

        function getUserFromToken() {
            var token = $localStorage.token;
            //console.log("token: " + JSON.stringify(token));
            var user = {};
            if (typeof token !== 'undefined') {
                var encoded = token.split('.')[1];
                user = JSON.parse(urlBase64Decode(encoded));
            }
            return user;
        }

        var currentUser = getUserFromToken();

        var service = {
            isAuthenticated: function() {
                return $localStorage.Session != undefined && !!$localStorage.Session.userId;
            },

            isAuthorized: function(authorizedRoles) {
                //console.log("userRole: " + Session.userRole + ", authorizedRoles: " + authorizedRoles);

                if (!angular.isArray(authorizedRoles)) {
                    authorizedRoles = [authorizedRoles];
                }


                return (service.isAuthenticated() && authorizedRoles.indexOf($localStorage.Session.userRole) !== -1);
            },

            login: function (data) {
                var defer = $q.defer();

                $http.post(baseUrl + '/login', data)
                    .success(function (res) {
                        if (res.success == true) {
                            $localStorage.token = res.token;
                            currentUser = getUserFromToken();
                            Session.create(res.user.id, currentUser.id,
                                currentUser.role);
                            $localStorage.Session = Session.read();
                        }
                        defer.resolve(res);
                    })
                    .error(function (err) {
                        defer.reject(err);
                    });
                return defer.promise;
            },

            logout: function(success) {
                changeUser({});
                Session.destroy();
                delete $localStorage.token;
                delete $localStorage.Session;
                success();
            },

            currentUser: function() {
                currentUser = getUserFromToken();
                //console.log("user: " + JSON.stringify(currentUser));
                if (currentUser !== '') {
                    return currentUser;
                } else {
                    return {};
                }
            }
        };
        return service;
    }
]);

marketPlaceApp.service('Session', function() {
    this.create = function(sessionId, userId, userRole) {
        this.id = sessionId;
        this.userId = userId;
        this.userRole = userRole;
    };
    this.read = function() {
        return { id: this.id, userId: this.userId, userRole: this.userRole };
    };
    this.destroy = function() {
        this.id = null;
        this.userId = null;
        this.userRole = null;
    };
});
