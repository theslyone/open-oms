marketPlaceApp.directive('disable', function($interpolate) {
    return function(scope, elem, attrs) {
        var exp = $interpolate(elem.attr('data-disable'));

        function updateDisabled() {
            var val = scope.$eval(exp);
            if (val == "true") {
                elem[0].disabled = 'disabled';
            } else {
                elem[0].disabled = '';
            }
        }

        scope.$watch(exp, function(value) {
            updateDisabled();
        });
    }
});

marketPlaceApp.directive('flash', function($) {
    return function(scope, elem, attrs) {
        var flag = elem.attr('data-flash');
        var $elem = $(elem);
        //alert($elem.html());
        function flashRow() {
            var value = scope.stock.LastChange;
            var changeStatus = scope.$eval(flag);
            if (changeStatus) {
                var bg = value === 0 ? '255,216,0' // yellow
                    : value > 0 ? '154,240,117' // green
                    : '255,148,148'; // red

                $elem.flash(bg, 1000);
            }
        }

        scope.$watch(flag, function(value) {
            flashRow();
        });
    }
});

marketPlaceApp.directive('scrollTicker', function($) {
    return function(scope, elem, attrs) {
        var $scrollTickerUI = $(elem);
        var flag = elem.attr('data-scroll-ticker');
        scroll();

        function scroll() {
            if (scope.$eval(flag)) {
                var w = $scrollTickerUI.width();
                $scrollTickerUI.css({ marginLeft: w });
                $scrollTickerUI.animate({ marginLeft: -w }, 15000, 'linear', scroll);
            } else
                $scrollTickerUI.stop();
        }

        scope.$watch(flag, function(value) {
            scroll();
        });
    }
});

marketPlaceApp.directive("myDirective", function() {
    return {
        restrict: "AE",
        link: function(scope, element) {
            if (scope.dataItem.Discontinued) {
                element.css("background-color", "red");
            } else {
                element.css("background-color", "green");
            }
        }
    };
});

marketPlaceApp.directive('blink', function($timeout) {
    return {
        restrict: 'E',
        transclude: true,
        scope: {},
        link: function($scope, $element) {
            function showElement() {
                $element.css("display", "inline");
                $timeout(hideElement, 1000);
            }

            function hideElement() {
                $element.css("display", "none");
                $timeout(showElement, 1000);
            }
            showElement();
        },
        template: '<strong><span ng-transclude></span></strong>',
        replace: true
    };
});

marketPlaceApp.directive('showHide', function() {
    return {
        link: function(scope, element, attributes, controller) {
            scope.$watch(attributes.showHide, function(v) {
                if (v) {
                    element.show();
                } else {
                    element.hide();
                }
            });
        }
    };
});

marketPlaceApp.directive('loginDialog', function(AUTH_EVENTS) {
    return {
        restrict: 'A',
        template: '<div ng-if="visible" ng-include="\'/templates/login.html\'"></div>',
        link: function(scope) {
            var showDialog = function() {
                scope.visible = true;
            };

            scope.visible = false;
            scope.$on(AUTH_EVENTS.notAuthenticated, showDialog);
            scope.$on(AUTH_EVENTS.sessionTimeout, showDialog)
        }
    };
});


marketPlaceApp.directive('panel', function() {
    'use strict';
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            panelClass: '@',
            heading: '@',
            panelIcon: '@',
            ngDrag: '@'
        },
        templateUrl: 'templates/panel.html',
        link: function(scope, element, attrs) {
            if (attrs.ngDrag === 'true') {
                element.find('.panel-heading').attr('ng-drag-handle', '');
            }
        }
    };
});
marketPlaceApp.directive('panelControls', [function() {
    'use strict';
    return {
        restrict: 'E',
        require: '?^tabset',
        replace: true,
        link: function(scope, element) {
            var panel = angular.element(element).closest('.panel');
            if (panel.hasClass('.ng-isolate-scope') === false) {
                angular.element(element).children().appendTo(panel.find('.panel-ctrls'));
            }
        }
    };
}]);
marketPlaceApp.directive('panelControlCollapse', function() {
    'use strict';
    return {
        restrict: 'EAC',
        link: function(scope, element) {
            element.html('<button class="button-icon"><i class="glyphicon glyphicon-minus"></i></button>');
            element.bind('click', function() {
                angular.element(element).find('i').toggleClass('glyphicon-plus glyphicon-minus');
                angular.element(element).closest('.panel').find('.panel-body').slideToggle({
                    duration: 200
                });
                angular.element(element).closest('.panel-heading').toggleClass('rounded-bottom');
            });
            return false;
        }
    };
});
marketPlaceApp.directive('panelControlRefresh', function() {
    'use strict';
    return {
        restrict: 'EAC',
        scope: {
            isLoading: '=',
            type: '@'
        },
        link: function(scope, element) {
            var type = (scope.type) ? scope.type : 'circular';
            element.append('<button class="button-icon"><i class="glyphicon glyphicon-refresh"></i></button>');
            element.find('button').bind('click', function() {
                element.closest('.panel')
                    .append('<div class="panel-loading"><div class="panel-loader-' + type + '"></div></div>');
            });
            scope.$watch('isLoading', function(n) {
                if (n === false) {
                    element.closest('.panel').find('.panel-loading').remove();
                }
            });
        }
    };
});
marketPlaceApp.directive('panelControlColors', ['$compile', function($compile) {
    'use strict';
    return {
        restrict: 'EAC',
        replace: true,
        link: function(scope, element) {
            var controls = '<span class="button-icon" dropdown="" dropdown-toggle="">' +
                '<i class="glyphicon glyphicon-tint"></i>' +
                '<ul class="dropdown-menu dropdown-tint" role="menu">' +
                '<li><span class="btn btn-default" data-class="panel-default"></span></li>' +
                '<li><span class="btn btn-midnightblue" data-class="panel-midnightblue"></span></li>' +
                '<li><span class="btn btn-danger" data-class="panel-danger"></span></li>' +
                '<li><span class="btn btn-success" data-class="panel-success"></span></li>' +
                '<li><span class="btn btn-primary" data-class="panel-primary"></span></li>' +
                '<li><span class="btn btn-inverse" data-class="panel-inverse"></span></li>' +
                '<li><span class="btn btn-indigo" data-class="panel-indigo"></span></li>' +
                '</ul>' +
                '</span>';
            element.append($compile(controls)(scope));
            element.find('li span').bind('click', function() {
                element.closest('.panel').removeClass(function(index, css) {
                    return (css.match(/(^|\s)panel-\S+/g) || []).join(' ');
                });
                element.closest('.panel').removeClass('panel-*').addClass(angular.element(this).attr('data-class'));
            });
            return false;
        }
    };
}]);
marketPlaceApp.directive('panelControlTitle', ['$compile', '$timeout', function($compile, $t) {
    'use strict';
    return {
        restrict: 'EAC',
        scope: true,
        link: function(scope, element) {
            var controls = '<span class="button-icon" dropdown="" dropdown-toggle="" is-open="showInputBox">' +
                '<i class="glyphicon glyphicon-edit"></i>' +
                '<ul class="dropdown-menu dropdown-edit" role="menu" ng-keyup="processKeyUp($event)">' +
                '<li><input class="form-control" type="text" ng-model="title" id="lolput" ng-click="$event.preventDefault();$event.stopPropagation()" /></li>' +
                '</ul>' +
                '</span>';
            element.append($compile(controls)(scope));
            scope.processKeyUp = function(event) {
                if (event.keyCode === 32) { // space pressed
                    event.preventDefault();
                } else if (event.keyCode === 13) {
                    scope.showInputBox = false;
                }
            };
            scope.$watch('showInputBox', function(n) {
                if (n) {
                    $t(function() {
                        element.find('input').val(element.closest('.panel').find('.panel-heading h2').text()).focus();
                    }, 10);
                }
            });
            scope.$watch('title', function(n) {
                element.closest('.panel').find('.panel-heading h2').html(n);
            });
            return false;
        }
    };
}]);
