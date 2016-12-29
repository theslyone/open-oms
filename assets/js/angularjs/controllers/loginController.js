//'use strict';

marketPlaceApp.controller('loginController', ['portalUrl', '$rootScope', '$scope', 'USER_ROLES', 'AUTH_EVENTS',
    '$http', '$location', '$localStorage', 'userService',
    function(portalUrl, $rootScope, $scope, USER_ROLES, AUTH_EVENTS,
        $http, $location, $localStorage, userService) {

        $scope.isLoginPage = true;
        $scope.currentUser = userService.currentUser();

        $scope.isLoggedIn = function() {
            $scope.currentUser = userService.currentUser();
            if (!$scope.isEmpty($scope.currentUser)) {
                return true;
            } else {
                return false;
            }
        };

        $scope.portalUrl = portalUrl;
        $scope.userRoles = USER_ROLES;
        $scope.isAuthorized = userService.isAuthorized;
        $scope.setCurrentUser = function(user) {
            $scope.currentUser = user;
        };

        $scope.login = function () {
            //alert($scope.UserName);
            var credentials = {
                username: $scope.UserName,
                password: $scope.Password
            }

            userService.login(credentials)
                .then(
                function (res) {
                    if (res.success == false || typeof res.success == undefined) {
                        alert(res.message);
                        //toaster.info(res.message);
                    } else {
                        $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                        $scope.setCurrentUser(userService.currentUser());
                        $localStorage.token = res.token;
                        $location.path('/stock_trend');
                    }
                },
                function (err) {
                    $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                    $rootScope.error = 'Login failed';
                });
        };

        $scope.me = function() {
            userService.me(function(res) {
                $scope.loggedInUser = res;
            }, function() {
                $rootScope.error = 'Failed to fetch details';
            })
        };

        $scope.logout = function() {
            userService.logout(function() {
                $location.path('/login');
            }, function() {
                alert("Failed to logout!");
            });
        };

        $scope.token = $localStorage.token;

        $scope.isEmpty = function(obj) {
            for (var x in obj) {
                if (obj.hasOwnProperty(x)) return false;
            }
            return true;
        };

    }
]);
