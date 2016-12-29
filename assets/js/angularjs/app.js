//'use strict';

var marketPlaceApp = angular.module('marketPlaceApp', ['kendo.directives', 'ngRoute', 'toaster', 'angular-loading-bar',
    'ngAnimate', 'ngStorage', 'highcharts-ng', 'uiSwitch']);
marketPlaceApp.value('portalUrl', 'oms.com');
marketPlaceApp.value('$', $);
marketPlaceApp.constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
});
marketPlaceApp.constant('USER_ROLES', {
    all: '*',
    admin: 'admin',
    client: 'client',
    guest: 'guest'
});

marketPlaceApp.config(
    ['$routeProvider', '$httpProvider', '$provide', 'USER_ROLES', 'cfpLoadingBarProvider',
        function ($routeProvider, $httpProvider, $provide, USER_ROLES, cfpLoadingBarProvider) {
        $routeProvider
            .when('/login', {
                templateUrl: 'templates/login.html',
                controller: 'loginController',
                roles: USER_ROLES.all
            })
            .when('/stock_trend', {
                templateUrl: 'templates/stock_trend.html',
                //controller: 'marketPlaceController',
                roles: USER_ROLES.admin
            })
            .when('/billing', {
                templateUrl: 'templates/billing.html',
                //controller: 'billingController',
                roles: USER_ROLES.admin
            })
            .otherwise({ redirectTo: '/login' });

        $provide.decorator('$exceptionHandler', ['$log', '$delegate',
            function($log, $delegate) {
                return function(exception, cause) {
                    $log.debug('Default exception handler.');
                    $delegate(exception, cause);
                };
            }
        ]);

        $httpProvider.interceptors.push('sessionInjector');

        cfpLoadingBarProvider.includeSpinner = true;
        cfpLoadingBarProvider.includeBar = true;
        //cfpLoadingBarProvider.latencyThreshold = 500;
        //cfpLoadingBarProvider.spinnerTemplate = '<div><span class="fa fa-spinner">Loading...</div>';        
    }
]);

marketPlaceApp.run(function($rootScope, $location, AUTH_EVENTS, userService) {
    $rootScope.$on('$routeChangeStart', function(event, next) {
        var authorizedRoles = next.roles;
        //console.log("Event:" + JSON.stringify(event, null, 4));
        //console.log("Next:" + JSON.stringify(next.roles, null, 4));
        if (!userService.isAuthorized(authorizedRoles)) {
            //event.preventDefault();
            if (userService.isAuthenticated()) {
                // user is not allowed
                $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
            } else {
                // user is not logged in
                $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
            }
            //$location.path('/login'); //needs to login
        }
    });
});
