//'use strict';

marketPlaceApp.factory('sessionInjector', ['$rootScope', '$q', '$location', '$localStorage', 'AUTH_EVENTS',

    function sessionInjector($rootScope, $q, $location, $localStorage, AUTH_EVENTS) {
        console.log('Registering authentication token interceptor');

        var token = null;

        var setToken = function setToken(someToken) {
            console.log('Token set on session interceptor');
            token = someToken;
        }

        var getToken = function getToken() {
            return token;
        }

        var sessionInjector = {
            setToken: setToken,
            getToken: getToken,
            request: function(config) {
                config.headers = config.headers || {};

                if ($localStorage.token) {
                    config.headers.Authorization = 'Bearer ' + $localStorage.token;
                    //console.log("Authorization token " + config.headers.Authorization + " added");
                }
                return config;
            },
            responseError: function(response) {
                if (response.status === 401 || response.status === 403) {
                    $location.path('/login');
                }

                $rootScope.$broadcast({
                    401: AUTH_EVENTS.notAuthenticated,
                    403: AUTH_EVENTS.notAuthorized,
                    419: AUTH_EVENTS.sessionTimeout,
                    440: AUTH_EVENTS.sessionTimeout
                }[response.status], response);

                return $q.reject(response);
            }
        };
        return sessionInjector;
    }
]);
