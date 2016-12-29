//'use strict';

marketPlaceApp.controller('marketPlaceController', ['$scope', '$filter', '$http', "$compile", 'marketPlaceService',
    'orderBookService', 'toaster', 'userService', 'stockService', 'clientService', 'clientStockService', 'executionReportService',
    'enumService', 'USER_ROLES', 'AUTH_EVENTS',

    function ($scope, $filter, $http, $compile, marketPlaceService, orderBookService, toaster,
        userService, stockService, clientService, clientStockService, executionReportService,
        enumService, USER_ROLES, AUTH_EVENTS) {
        var marketPlaceService = marketPlaceService("", 'MarketPlace', { logging: true });
        
        toaster.options = {
            "closeButton": true,
            "debug": false,
            "positionClass": "toast-bottom-right",
            "onclick": null,
            "showDuration": "600",
            "hideDuration": "1000",
            "timeOut": "3000",
            "extendedTimeOut": "1000",
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "fadeIn",
            "hideMethod": "fadeOut",
            "escapeHtml": "true",
            "preventDuplicates": true
        };

        $scope.notifications = [];

        $scope.setSeen = function (item, $event) {
            $event.preventDefault();
            $event.stopPropagation();
            item.seen = true;
        };

        $scope.setUnseen = function (item, $event) {
            $event.preventDefault();
            $event.stopPropagation();
            item.seen = false;
        };

        $scope.setSeenAll = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            angular.forEach($scope.notifications, function (item) {
                item.seen = true;
            });
        };

        $scope.unseenCount = $filter('filter')($scope.notifications, {
            seen: false
        }).length;

        $scope.lastNotification = {};
        $scope.$watch('notifications', function (notifications) {
            notify = notifications.pop();
            if (notify != undefined && $scope.lastNotification != undefined) {
                /*if (notify.class == $scope.lastNotification.class &&
                    notify.event == $scope.lastNotification.event &&
                    (notify.time - $scope.lastNotification.time) < 5000) {
                    return;
                }*/
                if (notify.text == $scope.lastNotification.text) {
                    return;
                } else {
                    //console.log(notify.time - $scope.lastNotification.time)

                    $scope.lastNotification = notify;
                    if (notify.isHtml) {
                        toaster.pop(notify.class, notify.event, notify.text, null, 'trustedHtml');
                    } else {
                        toaster.pop(notify.class, notify.event, notify.text);
                    }
                }
            }
            $scope.unseenCount = $filter('filter')(notifications, {
                seen: false
            }).length;
        }, true);
        $scope.connectionStatus = "";

        $scope.currentUser = userService.currentUser();

        $scope.userRoles = USER_ROLES;
        $scope.isAuthorized = userService.isAuthorized;


        $scope.connect = function () {
            if ($scope.wsOpen) {
                $scope.closeMarket();
                $scope.connectionStatus = "Disconnecting, please wait...";
            } else {
                $scope.openMarket();
                $scope.connectionStatus = "Attempting to connect, please wait...";
            }
        };

        $scope.clear_poke = function () {
            $scope.poke_data = [];
        }

        $scope.openMarket = function () {
            $scope.notifications.push({
                event: "nse::opening",
                text: 'Opening market place',
                time: clock.now,
                class: 'info',
                seen: false
            })
            marketPlaceService.connect(function () {
                $scope.getCurrentClient();
            });
        };

        $scope.closeMarket = function () {
            $scope.notifications.push({
                event: "nse::closing",
                text: 'Closing market place',
                time: clock.now,
                class: 'info',
                seen: false
            })
            marketPlaceService.disconnect(function () {

            });
        };

        $scope.reset = function () {
            marketPlaceService.reconnect(function () {

            });
        };

        $scope.tickers = {};

        $scope.keys = ["open", "high", "low", "close", "change", "p_age", "volume", "52_week_high"];
        $scope.labels = {
            open: "Open",
            high: "High",
            low: "Low",
            close: "Close",
            change: "Change",
            p_age: "Percentage",
            last_trade: "Last",
            market_cap: "Market Cap",
            pe_ratio: "PE",
            eps: "EPS",
            volume: "Volume",
            "52_week_high": "52 Week High",
            dividend: "Dividend",
            eps_est_annual: "EPS Annual Estimate"
        };

        $scope.myStockClick = function (stock) {
            //alert(stock.checked);
            if (!stock.checked) {
                $scope.tickers[stock.id] = stock.data;
            } else {
                delete $scope.tickers[stock.id];
            }
        };

        function setMarketState(isOpen) {
            $scope.marketStatusOpen = isOpen;
        }

        $scope.initializeStockMarket = function () {
            $scope.stocks.length = 0;
            clientStockService.statistics($scope.currentClient.id[0])
                .then(function (stocks) {
                    if (stocks.length > 0) {
                        stocks.forEach(function (dataItem) {
                            $scope.stocks.push({
                                id: dataItem.symbol,
                                checked: false,
                                data: {
                                    "shareId": dataItem.shareId,
                                    "symbol": dataItem.symbol,
                                    "open": dataItem.open,
                                    "high": dataItem.high,
                                    "low": dataItem.low,
                                    "close": dataItem.close,
                                    "change": dataItem.changeValue,
                                    "p_age": dataItem.percentageChange,
                                    "last_trade": "",
                                    "market_cap": "",
                                    "pe_ratio": "",
                                    "eps": "",
                                    "volume": dataItem.Value,
                                    "52_week_high": "",
                                    "dividend": "",
                                    "eps_est_annual": "",
                                    "eps_est_nextquarter": "",
                                    "last_trade_date": ""
                                }
                            });
                        });
                        //console.log("scope data: " + JSON.stringify($scope.stocks));
                    }
                })
                .catch(function (err) {
                    $scope.notifications.push({
                        event: "server::error",
                        text: 'Error retrieving client stock statistics from server: ' + err,
                        time: clock.now,
                        class: 'error',
                        seen: false
                    })
                });

            marketPlaceService.invoke('connectionStatus', function (status) {
                setMarketState(status);
            });

        };

        $scope.initializeStatistics = function () {
            stockService.gainers('10')
                .then(function (data) {
                    if (data.length > 0) {
                        data.forEach(function (dataItem) {
                            $scope.top_gainers.push({
                                id: dataItem.symbol,
                                checked: false,
                                data: {
                                    "symbol": dataItem.symbol,
                                    "open": dataItem.open,
                                    "high": dataItem.ligh,
                                    "low": dataItem.low,
                                    "close": dataItem.close,
                                    "change": dataItem.changeValue,
                                    "p_age": dataItem.percentageChange,
                                    "volume": dataItem.units,
                                    "value": dataItem.value,
                                }
                            });
                        });
                    }
                })
                .catch(function (err) {
                    $scope.notifications.push({
                        event: "server::error",
                        text: 'Error retrieving top gainers from server: ' + err,
                        time: clock.now,
                        class: 'error',
                        seen: false
                    })
                });

            stockService.losers('10')
                .then(function (data) {
                    if (data.length > 0) {
                        data.forEach(function (dataItem) {
                            $scope.top_losers.push({
                                id: dataItem.symbol,
                                checked: false,
                                data: {
                                    "symbol": dataItem.symbol,
                                    "open": dataItem.open,
                                    "high": dataItem.ligh,
                                    "low": dataItem.low,
                                    "close": dataItem.close,
                                    "change": dataItem.changeValue,
                                    "p_age": dataItem.percentageChange,
                                    "volume": dataItem.units,
                                    "value": dataItem.value,
                                }
                            });
                        });
                    }
                })
                .catch(function (err) {
                    $scope.notifications.push({
                        event: "server::error",
                        text: 'Error retrieving top losers from server: ' + err,
                        time: clock.now,
                        class: 'error',
                        seen: false
                    })
                });

            stockService.unchanged('10')
                .then(function (data) {
                    if (data.length > 0) {
                        data.forEach(function (dataItem) {
                            $scope.top_unchanged.push({
                                id: dataItem.symbol,
                                checked: false,
                                data: {
                                    "symbol": dataItem.symbol,
                                    "open": dataItem.open,
                                    "high": dataItem.ligh,
                                    "low": dataItem.low,
                                    "close": dataItem.close,
                                    "change": dataItem.changeValue,
                                    "p_age": dataItem.percentageChange,
                                    "volume": dataItem.units,
                                    "value": dataItem.value,
                                }
                            });
                        });
                    }
                })
                .catch(function (err) {
                    $scope.notifications.push({
                        event: "server::error",
                        text: 'Error retrieving unchanged from server: ' + err,
                        time: clock.now,
                        class: 'error',
                        seen: false
                    })
                });

            stockService.trades('10')
                .then(function (data) {
                    if (data.length > 0) {
                        data.forEach(function (dataItem) {
                            $scope.top_trades.push({
                                id: dataItem.symbol,
                                checked: false,
                                data: {
                                    "symbol": dataItem.symbol,
                                    "open": dataItem.open,
                                    "high": dataItem.ligh,
                                    "low": dataItem.low,
                                    "close": dataItem.close,
                                    "change": dataItem.changeValue,
                                    "p_age": dataItem.percentageChange,
                                    "volume": dataItem.units,
                                    "value": dataItem.value,
                                }
                            });
                        });
                    }
                })
                .catch(function (err) {
                    $scope.notifications.push({
                        event: "server::error",
                        text: 'Error retrieving top trades from server: ' + err,
                        time: clock.now,
                        class: 'error',
                        seen: false
                    })
                });
        }
        $scope.initializeStatistics();

        $scope.stocks = [];

        $scope.top_gainers = [];
        $scope.top_losers = [];
        $scope.top_unchanged = [];
        $scope.top_trades = [];

        $scope.marketStatusOpen = false;
        $scope.wsOpen = false;

        $scope.lastPrice = 0;
        $scope.lastBid = 0;
        $scope.lastOffer = 0;
        $scope.lowRange = 0;
        $scope.highRange = 0;
        $scope.volume = 0;
        $scope.lastPriceChange = 0;
        $scope.lastPriceChangePercentage = "0%";

        $scope.offerLimit = -5;
        $scope.bidLimit = -5;
        $scope.tradeLimit = -10;
        $scope.indexLimit = -50;

        $scope.offers = [{ price: "---", quantity: "---" }, { price: "---", quantity: "---" }, { price: "---", quantity: "---" }];
        $scope.bids = [{ price: "---", quantity: "---" }, { price: "---", quantity: "---" }, { price: "---", quantity: "---" }];
        $scope.trades = [];
        $scope.index = [];

        $scope.timekeys = [
            { count: 1, type: "minutes", text: "1-min" },
            { count: 3, type: "minutes", text: "3-min" },
            { count: 5, type: "minutes", text: "5-min" },
            { count: 15, type: "minutes", text: "15-min" },
            { count: 30, type: "minutes", text: "30-min" },
            { count: 1, type: "hours", text: "1-hour" },
            { count: 2, type: "hours", text: "2-hour" },
            { count: 4, type: "hours", text: "4-hour" },
            { count: 6, type: "hours", text: "6-hour" },
            { count: 12, type: "hours", text: "12-hour" },
            { count: 1, type: "days", text: "1-day" },
            { count: 3, type: "days", text: "3-day" },
            { count: 7, type: "days", text: "1-week" },
            { count: 1, type: "months", text: "1-month" }
        ];

        $scope.timekeyClick = function (timekey) {
            var toTime = new Date($scope.navigator.select.to);
            var count = parseInt(timekey.count) * -1;
            var fromTime = new Date();

            if (timekey.type == "minutes") { //case for mins
                fromTime = toTime.addMinutes(count);
            } else if (timekey.type = "hours") { //case for hours
                fromTime = toTime.addHours(count);
            } else if (timekey.type = "days") { //case for days
                fromTime = toTime.addDays(count);
            } else if (timekey.type = "months") { //case for month
                fromTime = toTime.addMonths(count);
            }
            //alert("From time: " + fromTime);
            $scope.navigator.select.from = fromTime;
            $scope.navigator.categoryAxis.baseUnit = timekey.type;
        };

        $scope.stockChartTitle = new kendo.data.ObservableObject({
            text: "---"
        });

        $scope.stockChartOptions = {
            name: "kstockchart",
            /*dataSource: {
                transport: {
                    read: {
                        url: "../../../stockdatapoints.json",
                        dataType: "json"
                    }
                },
                schema: {
                    model: {
                        fields: {
                            Date: { type: "date" }
                        }
                    }
                }
            },*/
            dataSource: new kendo.data.ObservableArray([]),
            title: {
                text: $scope.stockChartTitle.text
            },
            dateField: "Date",
            panes: [{
                name: "ohlcPane",
                title: "OHLC",
                height: 300
            }, {
                    name: "volumePane",
                    title: "Volume",
                    height: 100 // pixels
                }],
            categoryAxis: {
                labels: {
                    rotation: "auto"
                },
                pane: "ohlcPane",
                //baseUnit: "fit",
                /*autoBaseUnitSteps: {
                    // Would produce 31 groups
                    // => Skip to weeks
                    days: [1],
    
                    // Not allowed as no steps are defined
                    // => Skip to months
                    weeks: [],
    
                    // Results in 2 groups
                    // => Chosen
                    months: [1]
                },*/
                crosshair: {
                    visible: true,
                    dashType: "dashDot",
                    tooltip: {
                        visible: true,
                        template: "#= kendo.format('{0:dd/MM/yyyy}',value) #"
                    }
                },
            },
            valueAxes: [{
                // Default axis
                name: "ohlcAxis",
                pane: "ohlcPane",
                visible: true,
                line: {
                    visible: false
                },
                labels: {
                    format: "₦{0:N}"
                },
                crosshair: {
                    visible: true,
                    dashType: "dashDot",
                    tooltip: {
                        visible: true,
                        format: "{0:N}"
                    }
                },
            }, {
                    name: "volumeAxis",
                    pane: "volumePane",
                    visible: false,
                    labels: {
                        format: "₦{0:N}"
                    },
                }],
            series: [{
                type: "candlestick",
                openField: "Open",
                highField: "High",
                lowField: "Low",
                closeField: "Close",
                tooltip: {
                    visible: true,
                    //template: "#= kendo.format('{0:dd/MM/yyyy}',category) # \n #= value #",
                    format: "<table>" +
                    "<tr><td colspan='2'></td></tr>" +
                    "<tr><td>Open:</td><td>₦{0:N}</td></tr>" +
                    "<tr><td>High:</td><td>₦{1:N}<//td></tr>" +
                    "<tr><td>Low:</td><td>₦{2:N}<//td></tr>" +
                    "<tr><td>Close:</td><td>₦{3:N}</td></tr>" +
                    "</table>",
                },
            }, {
                    type: "column",
                    field: "Volume",
                    axis: "volumeAxis",
                    tooltip: {
                        format: "₦{0:N}"
                    }
                }],
            navigator: {
                series: {
                    type: "area",
                    field: "Close"
                },
                select: {
                    from: '01/01/2014', //new Date().addMonths(-3),
                    to: '10/10/2015' //new Date()
                },
                hint: {
                    template: "<div>#= kendo.format('{0:dd/MM/yyyy}',from) # - #= kendo.format('{0:dd/MM/yyyy}',to) #</div>",
                    format: "From: {0:d} To: {1:d}"
                },
                categoryAxis: {
                    labels: {
                        rotation: "auto"
                    },
                    baseUnit: "fit",
                    crosshair: {
                        visible: true,
                        dashType: "dash",
                    }
                },
            }
        };

        var ohlc = [];
        var volume = [];
        var dataLength = 1; //data.length;
        var groupingUnits = [
            ['week', [1]],
            ['month', [1, 2, 3, 4, 6]]
        ];
        var i = 0;

        $scope.highstockChatConfig = {
            options: {
                chart: {
                    zoomType: 'x'
                },
                rangeSelector: {
                    enabled: true
                },
                navigator: {
                    enabled: true
                }
            },
            rangeSelector: {
                selected: 1
            },
            series: [{
                type: 'candlestick',
                name: 'AAPL',
                data: ohlc,
                dataGrouping: {
                    units: groupingUnits
                }
            }, {
                    type: 'column',
                    name: 'Volume',
                    data: volume,
                    yAxis: 1,
                    dataGrouping: {
                        units: groupingUnits
                    }
                }],
            title: {
                text: '---'
            },
            yAxis: [{
                labels: {
                    align: 'left',
                    x: -3
                },
                title: {
                    text: 'OHLC'
                },
                height: '60%',
                lineWidth: 2
            }, {
                    labels: {
                        align: 'left',
                        x: -3
                    },
                    title: {
                        text: 'Volume'
                    },
                    top: '65%',
                    height: '35%',
                    offset: 0,
                    lineWidth: 2
                }],
            xAxis: {
                type: 'datetime',
                /*labels: {
                    formatter: function () {
                        return Highcharts.dateFormat('%a %d %b %H:%M', this.value);
                    },
                    dateTimeLabelFormats: {
                        minute: '%H:%M',
                        hour: '%H:%M',
                        day: '%e. %b',
                        week: '%e. %b',
                        month: '%b \'%y',
                        year: '%Y'
                    }
                }*/
            },
            useHighStocks: true,
            size: {
                //width: 100,
                //height: 600
            },
        }

        $scope.sideDataSource = [];
        $scope.orderTypeDataSource = [];
        $scope.orderStatusDataSource = [];
        $scope.execTypeDataSource = [];
        $scope.allSecuritiesDataSource = [];

        $scope.loadData = function () {
            stockService.getAll()
                .then(function (res) {
                    //alert(JSON.stringify(res,null,4));
                    res.forEach(function (dataItem) {
                        var en = { value: dataItem.id, text: dataItem.symbol }
                        $scope.allSecuritiesDataSource.push(en);
                    });

                    /*enumService.getSides().then(function (res) {
                        $scope.sideDataSource = res.data;

                        enumService.getOrderTypes().then(function (res) {
                            $scope.orderTypeDataSource = res.data;

                            enumService.getOrderStatus().then(function (res) {
                                $scope.orderStatusDataSource = res.data;

                                enumService.getExecTypes().then(function (res) {
                                    $scope.execTypeDataSource = res.data;
                                    $scope.initializeGrids();
                                });
                            });
                        });
                    });*/
                });
        };

        $scope.custom_info = function (info) {
            $scope.notifications.push({
                event: "server::info",
                text: info,
                time: clock.now,
                class: 'info',
                seen: false
            })
        }

        $scope.cancelOrderClick = function (dataItem) {
            orderBookService.cancel(dataItem.id)
                .then(function (data) {
                    $scope.orderBookDataSource.read();
                })
                .catch(function (err) {
                    $scope.orderBookDataSource.read();
                    $scope.notifications.push({
                        event: "server::error",
                        text: 'Error cancelling order: ' + err,
                        time: clock.now,
                        class: 'error',
                        seen: false
                    })
                });
        };

        $scope.orderStatusClick = function (dataItem) {
            orderBookService.status(dataItem.id)
                .then(function (data) {
                    $scope.orderBookDataSource.read();
                })
                .catch(function (err) {
                    $scope.orderBookDataSource.read();
                    $scope.notifications.push({
                        event: "server::error",
                        text: 'Error getting order status: ' + err,
                        time: clock.now,
                        class: 'error',
                        seen: false
                    })
                });
        };

        $scope.orderStatusAllClick = function () {
            var ids = [];
            orderBookService.status(ids)
                .then(function (data) {
                    $scope.orderBookDataSource.read();
                })
                .catch(function (err) {
                    $scope.orderBookDataSource.read();
                    $scope.notifications.push({
                        event: "server::error",
                        text: 'Error getting order status: ' + err,
                        time: clock.now,
                        class: 'error',
                        seen: false
                    })
                });
        };

        var OrderBook = kendo.data.Model.define({
            id: "id",
            fields: {
                id: { editable: false, field: "id", type: "number", nullable: true },
                clOrdID: { editable: false, field: "clOrdID", type: "string" },
                date: { editable: false, field: "date", type: "date", defaultValue: new Date() },
                symbol: { editable: false, field: "symbol", type: "string" },
                shareId: {
                    editable: false,
                    field: "shareId",
                    type: "number",
                    validation: {
                        //required: true,
                        sharevalidation: function (input) {
                            if (input.is("[data-bind='value: shareId']")) {
                                return input.val() > 0;
                                //return false;
                            }
                            return true;
                        }
                    }
                },
                ordType: { field: "ordType", type: "number", defaultValue: 1, validation: { required: true } },
                side: { field: "side", type: "number", validation: { required: true, min: 1 } },
                quantity: {
                    field: "quantity",
                    type: "number",
                    format: "{0:#.##}",
                    validation: {
                        //required: true,
                        qtyvalidation: function (input) {
                            if (input.is("[data-bind='value: quantity']")) {
                                return input.val() > 0;
                                //return false;
                            }
                            return true;
                        }
                    }
                },
                limitPrice: {
                    field: "limitPrice",
                    type: "number",
                    format: "{0:N2}",
                    validation: {
                        //required: true,
                        min: 0,
                        limitvalidation: function (input) {
                            if (input.is("[data-bind='value: limitPrice']")) {
                                var limitPrice = input.val();
                                var ordType = $("[name='ordType']").val();
                                //alert(limitPrice + " " + ordType);
                                if (limitPrice == 0 && ordType == 2) {
                                    //input.attr("data-limitvalidation-msg", "Limit price is required");
                                    return limitPrice > 0;
                                }
                                return true;
                            }
                            return true;
                        }
                    }
                },
                status: { editable: false, field: "status", type: "string" },


                units: { editable: false, field: "units", type: "number" },
                shareOpeningPrice: { editable: false, field: "openingPrice", type: "number" },
                shareClosingPrice: { editable: false, field: "closingPrice", type: "number" },
                pendingUnits: { editable: false, field: "pendingUnits", type: "number" },
                stateValue: { editable: false, field: "stateValue", type: "string" },
                dateCreated: { editable: false, field: "dateCreated", type: "date" },
            },
        });

        function getSecurity(id) {
            var data = $scope.allSecuritiesDataSource;
            for (var i = 0; i < data.length; i++) {
                if (data[i].value == id) {
                    return data[i];
                }
            }
        }

        $scope.editStockChanged = function (e, dataItem) {
            //alert(JSON.stringify(dataItem));
            dataItem.dirty = true;
            //dataItem.shareId
            $scope.stockChanged(e);
        }

        $scope.editOrderTypeChanged = function (e, dataItem) {
            //alert(JSON.stringify(dataItem));
            dataItem.dirty = true;
            if (dataItem.ordType == 1) {
                dataItem.limitPrice = 0;
            }
        }

        $scope.ordTypeDropDownEditor = function (container, options) {
            var editor = $('<input kendo-drop-down-list required k-data-text-field="\'text\'" k-data-value-field="\'value\'" ' +
                'k-data-source="orderTypeDataSource" k-on-change="orderTypeChanged(kendoEvent,dataItem)" ' +
                'data-bind="value:' + options.field + '"/>')
                .appendTo(container);
        }

        $scope.limitPriceNumericEditor = function (container, options) {
            var editor = $('<input kendo-numeric-text-box k-min="0" k-step="0.01" ' +
                'k-on-change="dataItem.dirty=true" ng-disabled="dataItem.ordType == 1" ' +
                'data-bind="value:' + options.field + '"/>')
                .appendTo(container);
        }

        $scope.orderTypeDataSource = [{ value: 1, text: "Market" }, { value: 2, text: "Limit" }];

        $scope.sideDataSource = [{ value: 1, text: "Buy" }, { value: 2, text: "Sell" }];

        $scope.orderStatusDataSource = [
            { value: 'A', text: "Pending New" },
            { value: '0', text: "New" },
            { value: '1', text: "Partially Filled" },
            { value: '2', text: "Filled" },
            { value: '4', text: "Canceled" },
            { value: '5', text: "Replaced" },
            { value: '8', text: "Rejected" },
            { value: '9', text: "Suspended" },
            { value: 'B', text: "Calculated" },
            { value: 'C', text: "Expired" },
            { value: 'D', text: "Accepted For Bidding" },
            { value: '3', text: "Done For Day" },
            { value: '6', text: "Pending Cancel" },
            { value: '6', text: "Pending Cancel Replace" },
            { value: 'E', text: "Pending Replace" },
            { value: '7', text: "Stopped" }];

        $scope.execTypeDataSource = [
            { value: 'B', text: 'Calculated' },
            { value: '3', text: 'Done For Day' },
            { value: 'C', text: 'Expired' },
            { value: '2', text: 'Fill' },
            { value: '0', text: 'New' },
            { value: 'I', text: 'Order Status' },
            { value: '1', text: 'Partially Filled' },
            { value: '6', text: 'Pending Cancel' },
            { value: '6', text: 'Pending Cancel Replace' },
            { value: 'A', text: 'Pending New' },
            { value: '8', text: 'Rejected' },
            { value: '5', text: 'Replaced' },
            { value: 'D', text: 'Restated' },
            { value: '6', text: 'Pending Cancel' },
            { value: '7', text: 'Stopped' },
            { value: '9', text: 'Suspended' },
            { value: 'F', text: 'Trade' },
            { value: 'H', text: 'Trade Cancel' },
            { value: 'G', text: 'Trade Correct' },
            { value: 'K', text: 'Trade Released To Clearing' },
            { value: 'J', text: 'Trade In Clearing Hold' },
            { value: 'L', text: 'Triggered Or Activated By System' }];

        $scope.stockState = {
            processing: 1,
            processed: 2,
            verified: 3,
            complete: 4,
        };

        $scope.orderBookDataSource = new kendo.data.DataSource({
            transport: {
                read: function (options) {
                    orderBookService.read($scope.currentClient.id[0], options.data)
                        .then(function (data) {
                            options.success(data);
                        })
                        .catch(function (err) {
                            options.error(err);
                        });
                },
                create: function (options) {
                    orderBookService.trade($scope.currentClient.id[0], options.data)
                        .then(function (data) {
                            options.success(data);
                        })
                        .catch(function (err) {
                            options.error(err);
                        });
                },
                update: function (options) {
                    orderBookService.retrade($scope.currentClient.id[0], options.data)
                        .then(function (data) {
                            options.success(data);
                        })
                        .catch(function (err) {
                            options.error(err);
                        });
                },
                destroy: function (options) {
                    orderBookService.delete(options.data)
                        .then(function (data) {
                            options.success(data);
                        })
                        .catch(function (err) {
                            options.error(err);
                        });
                },
                push: function (callbacks) {
                    orderBookService.on("orderbook::traded", function (result) {
                        console.log("order book push trade");
                        callbacks.pushCreate(result);
                    });
                    orderBookService.on("orderbook::retraded", function (result) {
                        console.log("order book retrade");
                        callbacks.pushUpdate(result);
                    });
                    orderBookService.on("orderbook::status", function (result) {
                        console.log("order book status");
                        //callbacks.pushDestroy(result);
                    });
                    orderBookService.on("orderbook::destroy", function (result) {
                        console.log("order book destroy");
                        callbacks.pushDestroy(result);
                    });
                },
                parameterMap: function (options, operation) {
                    if (operation !== "read" && options.models) {
                        return { models: kendo.stringify(options.models) };
                    }
                },
            },
            pageSize: 10,
            type: 'json',
            schema: {
                data: "Data",
                total: "Total",
                errors: 'Errors',
                model: OrderBook
            },
            batch: false,
            serverPaging: true,
            serverSorting: true,
            serverFiltering: true,
            error: function (args) {
                //alert(JSON.stringify(args.xhr,null,4));
                var errors = args.xhr.Errors;
                if (errors) {
                    var validationTemplate = kendo.template($("#validationMessageTemplate").html());
                    var renderedTemplate = validationTemplate({ field: "propertyName", messages: errors });
                    $scope.notifications.push({
                        event: "server::error",
                        text: renderedTemplate,
                        time: clock.now,
                        class: 'error',
                        seen: false,
                        isHtml: true
                    })
                    $scope.orderBookDataSource.read();
                }
            },
            requestStart: function () {
                //$("#orderBookGrid").mask("Please wait...");
            },
            requestEnd: function (e) {
                if (e.type == "update" && !e.response.Errors) {
                    $scope.custom_info("Update request forwarded successfully, awaiting response...");
                }

                if (e.type == "create" && !e.response.Errors) {
                    $scope.custom_info("Trade request forwarded successfully, awaiting response...");
                }

                if (e.type == "destroy" && !e.response.Errors) {
                    $scope.custom_info("Deleted successfully");
                }

                if (e.type == "create" || e.type == "update" || e.type == "destroy") {
                    //$scope.orderBookDataSource.read();
                }
                if (e.response !== undefined && e.response.Errors) {
                    alert(JSON.stringify(e.response.Errors, null, 4));
                    $scope.notifications.push({
                        event: "server::error",
                        text: e.response.Errors,
                        time: clock.now,
                        class: 'error',
                        seen: false,
                        isHtml: true
                    })
                }
                //$("#orderBookGrid").unmask();
            }
        });

        $scope.clientSharesDataSource = new kendo.data.DataSource({
            transport: {
                read: function (options) {
                    clientStockService.read($scope.currentClient.id[0], options.data)
                        .then(function (data) {
                            options.success(data);
                        })
                        .catch(function (err) {
                            options.error(err);
                        });
                },
                update: function (options) {
                    orderBookService.retrade($scope.currentClient.id[0], options.data)
                        .then(function (data) {
                            options.success(data);
                        })
                        .catch(function (err) {
                            options.error(err);
                        });
                },
                push: function (callbacks) {
                    clientStockService.on("clientstock::created", function (result) {
                        console.log("client stock push created");
                        callbacks.pushCreate(result);
                    });
                    clientStockService.on("clientstock::retraded", function (result) {
                        console.log("client stock retrade");
                        callbacks.pushUpdate(result);
                    });
                },
            },
            pageSize: 10,
            type: 'json',
            schema: {
                data: "Data",
                total: "Total",
                errors: 'Errors',
                model: OrderBook,
            },
            batch: false,
            serverPaging: true,
            serverSorting: true,
            serverFiltering: true,
            error: function (args) {
                if (args.errors) {
                    var validationTemplate = kendo.template($("#validationMessageTemplate").html());
                    $.each(args.errors, function (propertyName) {
                        var renderedTemplate = validationTemplate({ field: "propertyName", messages: this.errors });
                        $scope.notifications.push({
                            event: "server::error",
                            text: renderedTemplate,
                            time: clock.now,
                            class: 'error',
                            seen: false,
                            isHtml: true
                        })
                    });
                    $scope.clientSharesDataSource.read();
                }
            },
            requestEnd: function (e) {
                if (e.type == "update" && !e.response.Errors) {
                    $scope.custom_info("Update request forwarded successfully, awaiting response...");
                    //$scope.orderBookDataSource.read();
                }

                if (e.response !== undefined && e.response.Errors) {
                    alert(JSON.stringify(e.response.Errors, null, 4));
                    $scope.notifications.push({
                        event: "server::error",
                        text: e.response.Errors,
                        time: clock.now,
                        class: 'error',
                        seen: false,
                        isHtml: true
                    })
                }
            }
        });

        $scope.orderbookGridOptions = {
            dataSource: $scope.orderBookDataSource,
            dataBound: function (e) { },
            selectable: "row",
            sortable: true,
            filterable: true,
            groupable: true,
            pageable: {
                refresh: true,
                pageSizes: true
            },
            //height: '450',
            toolbar: [
                { name: "create", text: "Create Order" }, {
                    name: "upateAll",
                    text: "Update All",
                    template: '<a ng-click="orderStatusAllClick()" class="k-button k-button-icontext k-i-grid pull-right" href="\\#"><span class="k-font-icon k-i-refresh"></span>Update All Status</a>'
                }
            ],
            columns: [
                { field: "Id", hidden: true },
                //{
                //    field: "admin",
                //    template: '<input type="checkbox" />'
                //},
                { field: "date", title: "Date", width: "50px", format: "{0:MM/dd/yyyy}" },
                { field: "symbol", title: "Symbol", width: "70px" },
                { field: "shareId", title: "Symbol", width: "20px", hidden: true },
                /*{
                    field: "shareId",
                    title: "Symbol",
                    width: "70px",
                    values: $scope.allSecuritiesDataSource,
                    sortable: {
                        compare: function(a, b) {
                            var securityA = getSecurity(a.ShareId).text;
                            var securityB = getSecurity(b.ShareId).text;
                            if (securityA < securityB)
                                return -1
                            else if (securityA === securityB)
                                return 0
                            else if (securityA > securityB)
                                return 1;
                        }
                    }
                },*/
                { field: "ordType", title: "Type", width: "50px", values: $scope.orderTypeDataSource, editor: $scope.ordTypeDropDownEditor },
                { field: "side", title: "Side", width: "50px", values: $scope.sideDataSource },
                { field: "quantity", title: "Quantity", format: "{0:N0}", width: "50px", groupable: false, filterable: false },
                { field: "limitPrice", title: "Price", width: "50px", format: "{0:N2}", groupable: false, editor: $scope.limitPriceNumericEditor },
                { field: "status", title: "Status", width: "60px", values: $scope.orderStatusDataSource, filterable: false }, {
                    command: [{
                        name: 'edit',
                        attributes: { "class": "actions-column" },
                        template: '<div class="btn-group btn-group-xs pull-right" role="group">' +
                        "<button class=\'btn btn-default dropdown-toggle\' type=\'button\'" +
                        "data-toggle=\'dropdown\' aria-haspopup=\'true\' aria-expanded=\'false\'>" +
                        "Action <span class=\'k-icon k-i-custom\'></span>" +
                        "</button>" +
                        '<ul class="dropdown-menu dropdown-menu-right">' +
                        '<li ng-class="{\'disabled\': !dataItem.IsEditable, \'\': dataItem.IsEditable}">' +
                        '<a class="k-grid-edit"><i class="k-icon k-i-pencil"></i> Edit</a>' +
                        '</li>'
                    }, {
                            name: 'status',
                            attributes: { "class": "actions-column" },
                            template: '<li ng-class="{\'disabled\': !dataItem.IsEditable, \'\': dataItem.IsEditable}">' +
                            '<a class="k-grid-status" ng-click=\'orderStatusClick(dataItem)\'><i class="k-icon k-i-refresh"></i> Status</a>' +
                            '</li>'
                        }, {
                            name: 'cancel',
                            attributes: { "class": "actions-column" },
                            template: '<li ng-class="{\'disabled\': !dataItem.IsEditable, \'\': dataItem.IsEditable}">' +
                            '<a class="k-grid-cancel" ng-click=\'cancelOrderClick(dataItem)\'><i class="k-icon k-i-close"></i> Cancel</a>' +
                            '</li>'
                        }, {
                            name: 'delete',
                            attributes: { "class": "actions-column" },
                            template: '<li class="disabled">' +
                            '<a class="k-grid-delete"><i class="k-icon k-i-lock"></i> Delete</a>' +
                            '</li>' +
                            '</ul>' +
                            '</div>'
                        }],
                    title: "Action",
                    width: "40px"
                },
            ],
            edit: function (e) {
                var commandCell = e.container.find("td:last");
                commandCell.html('<div class="btn-group btn-group-xs" role="group">' +
                    '<a role="button" title="Save" class="btn btn-success k-grid-update">' +
                    '<span class="k-icon k-update"></span>' +
                    '</a>' +
                    '<a role="button" title="Cancel" class="btn btn-danger k-grid-cancel">' +
                    '<span class="k-icon k-cancel"></span>' +
                    '</a>' +
                    '</div>');

                e.model.set("ordType", 1);
                e.model.set("side", 1);
                e.model.set("limitPrice", 0);
                if (e.model.isNew()) {
                    e.container.kendoWindow("title", "New Order");
                    e.model.set("shareId", $scope.currentStockId);
                } else {
                    e.container.kendoWindow("title", "Edit Order");
                }
                //alert("Selected: " +
                //    $scope.currentStockId + JSON.stringify(e.model, null, 4));

                e.container.find(".k-grid-update").html("Trade");
            },
            editable: {
                mode: "popup",
                template: kendo.template($("#order_template").html()),
                confirmaDelete: "Are you sure you want to delete this order?",
            },
            change: function (kendoEvent) {
                var grid = kendoEvent.sender;
                var selectedData = grid.dataItem(grid.select());
                $scope.stockSelected(selectedData.shareId);
            }
        };

        $scope.detailExecutionReportGridOptions = function (dataItem) {
            return {
                dataSource: {
                    type: "json",
                    transport: {
                        read: function (options) {
                            executionReportService.read(dataItem.id, options.data)
                                .then(function (data) {
                                    options.success(data);
                                })
                                .catch(function (err) {
                                    options.error(err);
                                });
                        },
                        push: function (callbacks) {
                            executionReportService.on("executionreport::received", function (result) {
                                console.log("exec report push received");
                                callbacks.pushCreate(result);
                            });
                        },
                    },
                    serverPaging: true,
                    serverSorting: true,
                    serverFiltering: true,
                    pageSize: 10,
                    schema: {
                        data: "Data",
                        total: "Total",
                        errors: 'Errors',
                        model: {
                            id: "id",
                            fields: {
                                id: { editable: false, nullable: true },
                                date: { editable: false, field: "date", type: "date" },
                                shareId: { editable: false, field: "shareId", type: 'string' },
                                symbol: { editable: false, field: "symbol", type: 'string' },
                                execType: { editable: false, field: "execType", type: "number" },
                                side: { editable: false, field: "side", type: "number" },
                                lastQty: { editable: false, field: "lastQty", type: "number" },
                                leavesQty: { editable: false, field: "leavesQty", type: "number" },
                                avgPx: { editable: false, field: "avgPx", type: "number", format: "{0:N2}" },
                                orderStatus: { editable: false, field: "orderStatus", type: "string" },
                            }
                        }
                    },
                },
                scrollable: false,
                selectable: "row",
                sortable: true,
                filterable: true,
                groupable: true,
                pageable: {
                    refresh: true,
                    pageSizes: true
                },
                //height: '450',
                width: '100%',
                columns: [
                    { field: "date", title: "Date", width: "60px", format: "{0:MM/dd/yyyy}" },
                    //{ field: "execType", title: "Type", width: "60px", values: $scope.execTypeDataSource },
                    { field: "side", title: "Side", width: "40px", values: $scope.sideDataSource },
                    { field: "lastQty", title: "Last.Qty", width: "50px", format: "{0:N2}", groupable: false, filterable: false },
                    { field: "leavesQty", title: "Leaves.Qty", width: "60px", format: "{0:N2}", groupable: false, filterable: false },
                    { field: "avgPx", title: "Avg.Price", width: "50px", format: "{0:N2}", groupable: false, filterable: false },
                    { field: "orderStatus", title: "Status", width: "50px", values: $scope.orderStatusDataSource, filterable: false },
                ],
            };
        };

        $scope.clientSharesGridOptions = {
            dataSource: $scope.clientSharesDataSource,
            selectable: "row",
            sortable: true,
            filterable: true,
            groupable: true,
            pageable: {
                refresh: true,
                pageSizes: true
            },
            //height: '450',
            width: '100%',
            columns: [
                { field: "symbol", title: "Symbol", width: "60px" }
                ,{ field: "units", title: "Holding", width: "40px", format: "{0:N2}", groupable: false, filterable: false }
                ,{
                    field: "shareClosingPrice",
                    title: "Price",
                    width: "40px",
                    format: "{0:N2}",
                    template: "<span style='font-weight:bold'>₦#= kendo.toString(shareClosingPrice, 'n2') #</span>",
                    groupable: false,
                    filterable: false
                }
                ,{
                    template: "<span style='color:green;font-weight:bold'>₦#= kendo.toString(shareClosingPrice * units, 'n2') #</span>",
                    title: "Valuation",
                    width: "60px",
                    format: "{0:N2}",
                    groupable: false,
                    filterable: false
                }
                ,{ field: "pendingUnits", title: "Pending", width: "40px", format: "{0:N2}", groupable: false, filterable: false },
                { field: "stateValue", title: "Status", width: "50px", filterable: false },
                { field: "dateCreated", title: "Date", width: "45px", format: "{0:MM/dd/yyyy}" }, {
                    command: [
                        //{ name: "edit", text: { edit: "Sell", update: "", cancel: "" } } ,
                        //{ name: "status", text: "Status", template: "<button class=\' btn btn-warning btn-xs\' ng-click=\'orderStatusClick(dataItem)\'><span class='k-icon k-si-refresh'></span></button>" },
                        //{ name: "cancel", text: "x", template: "<button class=\'btn btn-danger btn-xs\' ng-click=\'cancelOrderClick(dataItem)\'><span class='k-icon k-si-cancel'></span></button>" },                                            
                        {
                            name: 'trade',
                            attributes: { "class": "actions-column" },
                            template: '<div class="btn-group btn-group-xs pull-right" role="group">' +
                            "<button class=\'btn btn-default dropdown-toggle\' type=\'button\'" +
                            "data-toggle=\'dropdown\' aria-haspopup=\'true\' aria-expanded=\'false\'>" +
                            "Action <span class=\'k-icon k-i-custom\'></span>" +
                            "</button>" +

                            '<ul class="dropdown-menu dropdown-menu-right">' +
                            '<li>' +
                            '<a class="k-grid-edit"><i class="k-icon k-i-redo"></i> Trade</a>' +
                            '</li>' +
                            '</ul>' +
                            '</div>'
                        }
                    ],
                    title: "Action",
                    width: "35px"
                },
            ],
            editable: {
                mode: "popup",
                template: kendo.template($("#order_template").html()),
            },
            edit: function (e) {
                var currentDataItem = e.model;
                //console.log(e);
                e.container.kendoWindow("title", "Trading Stock " + currentDataItem.ShareName);
                e.container.find(".k-grid-update").html("Trade");

                e.model.set("quantity", 0);
                e.model.set("ordType", 1);
                e.model.set("side", 2);
                e.model.set("limitPrice", 0);
                //alert(JSON.stringify(e.model));                
            },
            change: function (kendoEvent) {
                var grid = kendoEvent.sender;
                var selectedData = grid.dataItem(grid.select());
                //alert(JSON.stringify(selectedData));
                $scope.stockSelected(selectedData.id);
            }
        };

        $scope.addItem = function (trade) {
            $scope.trades.push(trade);
            $scope.trade = {};
        }

        $scope.totalPrice = function () {
            var total = 0;
            for (count = 0; count < $scope.trades.length; count++) {
                total += $scope.trades[count].Price * $scope.trades[count].Quantity;
            }
            return total;
        }

        $scope.removeItem = function (index) {
            $scope.trades.splice(index, 1);
        }

        $scope.poke_data = [];

        marketPlaceService.on('connect', function () {
            console.log("Socket.io connected");
        });

        marketPlaceService.on('disconnect', function () {
            console.log('Lost connection to server');
        });

        marketPlaceService.on('poke', function (data) {
            console.log("Poked: " + JSON.stringify(data));
            $scope.poke_data.push(data);

        });

        marketPlaceService.on('warn', function (message) {
            $scope.notifications.push({
                event: "server::warning",
                text: message,
                time: clock.now,
                class: 'warning',
                seen: false,
            })

        });

        marketPlaceService.on('error', function (message) {
            $scope.notifications.push({
                event: "server::error",
                text: message,
                time: clock.now,
                class: 'error',
                seen: false,
            })
        });

        marketPlaceService.on('nse::connected', function (data) {
            $scope.notifications.push({
                event: "server::success",
                text: "Connected to the Nigerian Stock Exchange Server",
                time: clock.now,
                class: 'success',
                seen: false,
            })
            $scope.wsOpen = true;
            $scope.connectionStatus = "Connected";
            $scope.currentServerTime = data.date;
        });

        marketPlaceService.on('nse::disconnected', function () {
            $scope.notifications.push({
                event: "server::error",
                text: "Disconnected from the Nigerian Stock Exchange Server",
                time: clock.now,
                class: 'error',
                seen: false,
            })
            $scope.wsOpen = false;
            $scope.marketStatusOpen = false;
            $scope.connectionStatus = "Disconnected";
        });

        marketPlaceService.on('market_opened', function () {
            $scope.marketStatusOpen = true;
        });

        marketPlaceService.on('market_closed', function () {
            $scope.marketStatusOpen = false;
        });

        marketPlaceService.on('server::success_update', function (message) {
            $scope.notifications.push({
                event: "server::success",
                text: message,
                time: clock.now,
                class: 'success',
                seen: false,
            })
            $scope.updateGrids();
        });

        marketPlaceService.on('server::info_update', function (message) {
            $scope.notifications.push({
                event: "server::info",
                text: message,
                time: clock.now,
                class: 'info',
                seen: false,
            })
            $scope.updateGrids();
        });

        marketPlaceService.on('server::warning_update', function (message) {
            $scope.notifications.push({
                event: "server::warning",
                text: message,
                time: clock.now,
                class: 'warning',
                seen: false,
            })
            $scope.updateGrids();
        });

        marketPlaceService.on('server::error_update', function (message) {
            $scope.notifications.push({
                event: "server::error",
                text: message,
                time: clock.now,
                class: 'error',
                seen: false,
            })
            $scope.updateGrids();
        });

        marketPlaceService.on('nse::ticks', function (data) {
            $scope.marketStatusOpen = true;
            console.log("Market data: " + JSON.stringify(data));

            var timestamp = ((new Date()).getTime() / 1000) | 0;
            var offerEntry = [];
            var chartEntry = [];
            var bidEntry = [];

            var tradeEntry = [];
            var offerCount = 0;
            var bidCount = 0;
            var tradeCount = 0;
            var indexCount = 0;

            if (data.symbolId == 0 || ($scope.currentStockId == data.symbolId)) {
                var ticks = data.ticks;
                ticks.forEach(function (dataItem) {
                    //alert(dataItem.type);
                    if ($scope.lastPrice == 0) {
                        $scope.lastPrice = dataItem.price;
                    }
                    var pc = (((dataItem.price - $scope.lastPrice) / dataItem.price) * 300) === undefined ? 0 :
                        (((dataItem.price - $scope.lastPrice) / dataItem.price) * 300);
                    switch (dataItem.type) {
                        case "BID": //BID                        
                            $scope.bids.push({
                                price: dataItem.price,
                                quantity: dataItem.size,
                                dateTime: dataItem.dateTime,
                                percentageChange: 50 + pc,
                            });
                            bidCount = bidCount + 1;
                            break;

                        case "OFFER": //OFFER
                            $scope.offers.push({
                                price: dataItem.price,
                                quantity: dataItem.size,
                                dateTime: dataItem.dateTime,
                                percentageChange: 50 + pc,
                            });
                            offerCount = offerCount + 1;
                            break;

                        case "INDEX": //INDEX
                            $scope.index.push({
                                price: dataItem.price,
                                quantity: dataItem.size,
                                dateTime: dataItem.dateTime,
                                lowPx: dataItem.lowPx,
                                highPx: dataItem.highPx,
                                tradeVolume: dataItem.tradeVolume
                            });
                            indexCount = indexCount + 1;
                            break;

                        case "TRADE": //TRADE
                            $scope.trades.push({
                                side: dataItem.side,
                                price: dataItem.price,
                                quantity: dataItem.size,
                                dateTime: dataItem.dateTime,
                                lastPx: dataItem.lastPx,
                                tradeVolume: dataItem.tradeVolume
                            });
                            tradeCount = tradeCount + 1;

                            break;
                        case "LOW_PRICE":
                            $scope.lowRange = dataItem.price;
                            break;
                        case "HIGH_PRICE":
                            $scope.highRange = dataItem.price;
                            break;
                        default:
                            break;
                        //default code block
                    }
                });

                if ($scope.bids.length > 0 && $scope.bids[0].price > 0) {
                    $scope.lastBid = $scope.bids[0].price;
                }
                if ($scope.offers.length > 0 && $scope.offers[0].price > 0) {
                    $scope.lastOffer = $scope.offers[0].price;
                }
                if ($scope.index.length > 0 && $scope.index[0].price > 0) {
                    $scope.lastPrice = $scope.index[0].price;
                    $scope.lowRange = $scope.index[0].lowPx;
                    $scope.highRange = $scope.index[0].highPx;
                    $scope.volume = $scope.index[0].tradeVolume;
                }
                if ($scope.trades.length > 0 && $scope.trades[0].price > 0) {
                    var oldPrice = $scope.lastPrice;
                    var newPrice = $scope.trades[0].price;
                    if (oldPrice > 0) {
                        $scope.lastPriceChange = oldPrice - newPrice;
                        $scope.lastPriceChangePercentage = ((oldPrice - newPrice) / oldPrice) * 100;
                    }
                    $scope.lastPrice = newPrice;
                    $scope.volume = $scope.trades[0].tradeVolume;
                }

                console.log("Bids: " + JSON.stringify($scope.bids));
                console.log("Offers: " + JSON.stringify($scope.offers));
                console.log("Trades: " + JSON.stringify($scope.trades));
                console.log("Index: " + JSON.stringify($scope.index));
            }
        });

        marketPlaceService.on('nse::execution_report', function (dataItem) {
            $scope.notifications.push({
                event: "server::info",
                text: message,
                time: clock.now,
                class: 'info',
                seen: false,
            });
            $scope.updateGrids();
        });

        marketPlaceService.on('update_stock_price', function (stock) {
            for (var count = 0; count < $scope.stocks.length; count++) {
                if ($scope.stocks[count].id == stock.Symbol) {
                    $scope.stocks[count].data.close = stock.Close;
                }
            }
        });

        $scope.stockDataSource = {
            type: "json",
            serverFiltering: false,
            transport: {
                read: function (options) {
                    //alert(JSON.stringify(options, null, 4));
                    stockService.getAll()
                        .then(function (stocks) {
                            //alert(JSON.stringify(options, null, 4));
                            options.success(stocks);
                        })
                        .catch(function (err) {
                            options.error();
                            $scope.notifications.push({
                                event: "server::error",
                                text: "Error retrieving stock list from server",
                                time: clock.now,
                                class: 'info',
                                seen: false,
                            });
                        })
                }
            }
        };

        $scope.currentStockId;
        $scope.stockChanged = function (e) {
            var stockComboBox = e.sender;
            $scope.stockSelected(stockComboBox.value());
        };

        $scope.stockSelected = function (stockId) {
            $scope.currentStockId = stockId;
            $scope.refreshStockView();
        };

        $scope.refreshStockView = function () {
            //console.log("Stock id: " + $scope.currentStockId);
            $("#chart-wrapper").mask("Please wait...");
            $("#ticks_bar").mask("Please wait...");

            //clear data
            $scope.offers = [];
            $scope.bids = [];
            $scope.trades = [];
            $scope.lastPrice = 0;
            $scope.lastBid = 0;
            $scope.lastOffer = 0;
            $scope.lowRange = 0;
            $scope.highRange = 0;
            $scope.volume = 0;

            $scope.stockChartOptions.dataSource.empty(); //.splice(0, $scope.stockChartOptions.dataSource.length);
            $scope.highstockChatConfig.series[0].data = [];
            $scope.highstockChatConfig.series[1].data = [];
            $scope.highstockChatConfig.loading = true;

            //Update stock data points data from temp site  
            var currentdate = new Date();
            var monthAgoDate = new Date();
            monthAgoDate.setMonth(monthAgoDate.getMonth() - 1);
            var now = currentdate.toDateString().replace(new RegExp('/', 'g'), "-");
            var ago = monthAgoDate.toDateString().replace(new RegExp('/', 'g'), "-");

            stockService.statistics($scope.currentStockId)
                .then(function (response) {
                    var data = response;
                    if (data.length > 0) {
                        var recent = data[data.length - 1];
                        //alert(JSON.stringify(recent, null, 4));

                        $scope.highstockChatConfig.title.text = "Market Trend For " + recent.symbol;
                        $scope.highstockChatConfig.series[0].name = recent.symbol;
                        $scope.lastPrice = recent.close;
                        $scope.lowRange = recent.low;
                        $scope.highRange = recent.high;
                        $scope.volume = recent.value;
                        $scope.lastPriceChange = recent.changeValue;
                        $scope.lastPriceChangePercentage = recent.percentageChange;

                        var formattedDate = new Date(recent.date); //.substr(6)));
                        formattedDate = Date.parse(formattedDate);
                        //alert("Original: " + recent.date + ", Formatted: " + formattedDate);

                        data.forEach(function (dataItem) {
                            formattedDate = Date.parse(new Date(dataItem.date)); //.substr(6)));
                            $scope.highstockChatConfig.series[0].data.push([
                                formattedDate,
                                dataItem.open,
                                dataItem.high,
                                dataItem.low,
                                dataItem.close
                            ]);

                            $scope.highstockChatConfig.series[1].data.push([
                                formattedDate,
                                dataItem.value
                            ]);
                        });

                        $scope.notifications.push({
                            event: "server::info",
                            text: "Data for " + recent.symbol + " retrieved",
                            time: clock.now,
                            class: 'info',
                            seen: false,
                        });
                    }
                    $("#chart-wrapper").unmask();
                    $("#ticks_bar").unmask();
                })
                .catch(function (err) {
                    $scope.notifications.push({
                        event: "server::error",
                        text: 'Error retrieving stock statistics: ' + err,
                        time: clock.now,
                        class: 'error',
                        seen: false,
                    });
                    console.log(response);
                });

            if ($scope.wsOpen) {
                var data = "stockId=" + $scope.currentStockId + "&value=" + true;
                marketPlaceService.get('stockSubscription?' + data)
                    .then(function (e) {
                        $scope.notifications.push({
                            event: "server::info",
                            text: e.data.message,
                            time: clock.now,
                            class: 'info',
                            seen: false,
                        });
                    })
                    .catch(function (response) {
                        $scope.notifications.push({
                            event: "server::error",
                            text: 'Error subscribing to market trend: ' + response,
                            time: clock.now,
                            class: 'error',
                            seen: false,
                        });
                    }
                    );
            }
        }

        $scope.topVolumeTradedDatasource = {
            type: "json",
            transport: {
                read: function (options) {
                    stockService.volume("10")
                        .then(function (data) {
                            options.success(data);
                        })
                        .catch(function (err) {
                            options.error(err);
                        });
                }
            }
        };

        $scope.topValueTradedDatasource = {
            type: "json",
            transport: {
                read: function (options) {
                    stockService.value("10")
                        .then(function (data) {
                            options.success(data);
                        })
                        .catch(function (err) {
                            options.error(err);
                        });
                }
            }
        };

        $scope.piechartOptions = {

            legend: {
                position: "bottom"
            },
            seriesDefaults: {
                type: "donut"
            },
            series: [{
                type: "donut",
                field: "value",
                categoryField: "key",
                explodeField: "explode"
            }],
            valueAxis: {
                line: {
                    visible: false
                }
            },
            labels: {
                visible: true,
                position: "outsideEnd",
                template: "#= category # - #= kendo.format('{0:P}', percentage)#",
                background: "transparent",
            },
            tooltip: {
                visible: true,
                template: "#= category # - #= kendo.format('{0:n0}', value) #",
                format: "{0}"
            },
            //.SeriesColors(new string[] { "#007bc3", "#a419b7", "#ef4c00", "#ffae00", "#76b800", "#42a7ff", "#666666", "#999999", "#cccccc", "#ccceec" })                            
        };

        $scope.isStaff = false;
        $scope.currentClient = {
            id: [],
            fullName: "",
            cscsNumber: "",
            chnNumber: "",
            phoneNumber: "",
            email: "",
            photoUrl: "/Client/ShowPhoto?id=1000000",
            accountBalance: "",
            loading: true
        };

        $scope.selectClientOptions = {
            placeholder: "Select client...",
            dataTextField: "fullName",
            dataValueField: "id",
            valuePrimitive: true,
            autoBind: false,
            maxSelectedItems: 1,
            dataSource: {
                type: "json",
                serverFiltering: true,
                transport: {
                    read: function (options) {
                        //alert(JSON.stringify(options, null, 4));
                        var data = options.data;
                        $scope.clientSearchFilter = '';
                        if (data.filter != undefined && data.filter.filters.length > 0) {
                            //console.log("filter: " + JSON.stringify(data.filter));
                            //console.log("filters length: " + data.filter.filters.length);
                            if (data.filter.filters.length > 0) {
                                $scope.clientSearchFilter = data.filter.filters[0].value;
                                clientService.get($scope.clientSearchFilter)
                                    .then(function (clients) {
                                        options.success(clients);
                                    });
                            }
                        }
                        else if (!$scope.currentClient.loading && $scope.currentClient.cscsNumber != '') {
                            clientService.getByCscsNumber($scope.currentClient.cscsNumber)
                                .then(function (clients) {
                                    options.success(clients);
                                });
                        }
                    }
                }
            }
        };

        $scope.selectClientOptions2 = {
            optionLabel: "Select client...",
            dataTextField: "fullName",
            dataValueField: "id",
            valuePrimitive: true,
            autoBind: false,
            dataSource: {
                type: "json",
                serverFiltering: true,
                transport: {
                    read: function (options) {
                        //alert(JSON.stringify(options, null, 4));
                        var data = options.data;
                        $scope.clientSearchFilter = '';
                        if (data.filter != undefined && data.filter.filters.length > 0) {
                            //console.log("filter: " + JSON.stringify(data.filter));
                            //console.log("filters length: " + data.filter.filters.length);
                            if (data.filter.filters.length > 0) {
                                $scope.clientSearchFilter = data.filter.filters[0].value;
                                clientService.get($scope.clientSearchFilter)
                                    .then(function (clients) {
                                        options.success(clients);
                                    });
                            }
                        }
                        else if (!$scope.currentClient.loading && $scope.currentClient.cscsNumber != '') {
                            clientService.getByCscsNumber($scope.currentClient.cscsNumber)
                                .then(function (clients) {
                                    options.success(clients);
                                });
                        }
                    }
                }
            }
        };
        $scope.currentClientId = [];

        $scope.clientFiltering = function (e) {
            var clientSelectionBox = e.sender;
            //alert("Filtering clients");
        }

        $scope.clientChanged = function (e) {
            var clientSelectionBox = e.sender;
            $scope.currentClientId = [clientSelectionBox.value()];
            //alert("Client id selected: " + $scope.currentClientId);
            $scope.currentClient.loading = true;
            if (clientSelectionBox.value() > 0) {
                $scope.currentClient = { id: [clientSelectionBox.value()], loading: true };
               clientService.setCurrent($scope.currentClientId)
                    .then(function (response) {
                        var clientData = response;
                        //alert(JSON.stringify(clientData.id));
                        if (!$scope.isEmpty(clientData.client)) {
                            var client = clientData.client;
                            $scope.currentClient.id = [client.id];
                            $scope.currentClient.fullName = client.fullName;
                            $scope.currentClient.cscsNumber = client.cscsNumber;
                            $scope.currentClient.chnNumber = client.chnNumber;
                            $scope.currentClient.phoneNumber = client.phoneNumber;
                            $scope.currentClient.email = client.email;
                            $scope.currentClient.photoUrl = clientData.photoUrl;
                            $scope.currentClient.accountBalance = '₦' + kendo.toString(clientData.accountBalance, 'n2');
                            $scope.currentClient.loading = false;
                            $scope.initializeStockMarket();
                            $scope.updateGrids();
                        } else {
                            $scope.notifications.push({
                                event: "server::error",
                                text: "Selected client not found.",
                                time: clock.now,
                                class: 'error',
                                seen: false,
                            });
                        }
                    })
                    .catch(function (err) {
                        $scope.notifications.push({
                            event: "server::error",
                            text: 'Error setting selected client on server.' + err,
                            time: clock.now,
                            class: 'error',
                            seen: false,
                        });
                    });
            } else {
                $scope.currentClient = { id: [clientSelectionBox.value()], loading: true };
            }
        }

        $scope.getCurrentClient = function () {
            clientService.getCurrent()
                .then(function (response) {
                    var clientData = response;
                    if (!$scope.isEmpty(clientData.client)) {
                        var client = clientData.client;
                        $scope.currentClientId = [client.id];
                        $scope.currentClient.id = [client.id];
                        $scope.currentClient.fullName = client.fullName;
                        $scope.currentClient.cscsNumber = client.cscsNumber;
                        $scope.currentClient.chnNumber = client.chnNumber;
                        $scope.currentClient.phoneNumber = client.phoneNumber;
                        $scope.currentClient.email = client.email;
                        $scope.currentClient.photoUrl = clientData.photoUrl;
                        $scope.currentClient.accountBalance = '₦' + kendo.toString(clientData.accountBalance, 'n2');
                        $scope.currentClient.loading = false;
                        $scope.initializeStockMarket();
                        $scope.updateGrids();
                    } else {
                        if ($scope.currentUser.isAdmin) {
                            $scope.notifications.push({
                                event: "server::info",
                                text: "Please select a client.",
                                time: clock.now,
                                class: 'info',
                                seen: false,
                            });
                        } else {
                            $scope.notifications.push({
                                event: "server::error",
                                text: "We are unable to retrieve your account details, please login again",
                                time: clock.now,
                                class: 'error',
                                seen: false,
                            });
                        }
                    }
                })
                .catch(function(err) {
                    $scope.notifications.push({
                        event: "server::error",
                        text: "Error retrieving client details from server." + err,
                        time: clock.now,
                        class: 'error',
                        seen: false,
                    });
                });
        }

        $scope.updateGrids = function () {
            //$scope.executionReportDataSource.read();
            $scope.orderBookDataSource.read();
            $scope.clientSharesDataSource.read();
        }

        $scope.isEmpty = function (obj) {
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop))
                    //alert("not empty");
                    return false;
            }
            //alert("is empty");
            return true;
        };

        $scope.clientDropdownListOptions = {
            dataSource: $scope.stockDataSource,
            dataTextField: "fullName",
            dataValueField: "Id",

            headerTemplate: '<div class="dropdown-header k-widget k-header">' +
            '<span>Photo</span>' +
            '<span>Client info</span>' +
            '</div>',

            // using {{angular}} templates:
            valueTemplate: '<span class="selected-value" style="background-image: url(\'//demos.telerik.com/kendo-ui/content/web/Customers/{{dataItem.Id}}.jpg\')"></span><span>{{dataItem.Symbol}}</span>',

            template: '<span class="k-state-default" style="background-image: url(\'//demos.telerik.com/kendo-ui/content/web/Customers/{{dataItem.Id}}.jpg\')"></span>' +
            '<span class="k-state-default"><h3>{{dataItem.ContactName}}</h3><p>{{dataItem.CompanyName}}</p></span>',
        };

        $scope.openMarket();
        $scope.loadData();
    }
]);
