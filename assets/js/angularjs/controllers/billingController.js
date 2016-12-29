//'use strict';

marketPlaceApp.controller('billingController', ['$scope', '$http',
    function ($scope, $http) {

        $scope.monthSelected = new Date();

        $scope.monthPickerOptions = {
            start: "year",
            depth: "year",
            format: "MMMM yyyy",
            value: new Date(),
            parseFormats: ["dd/MM/yyyy'T'HH:mm:ss"],
        };

        $scope.monthPickerChanged = function (e) {
            //alert(kendo.toString($scope.monthSelected, "yyyy-MM-dd"));
            $scope.tradeDataSource.read({ date: $scope.monthSelected });
            $scope.costSummaryDataSource.read({ date: kendo.toString($scope.monthSelected, "yyyy-MM-dd") });
        }

        $scope.tradeDataSource = new kendo.data.DataSource({
            transport: {
                read: {
                    url: "/Trade/ReadByMonth",
                    type: "get",
                    dataType: "json",
                },
            },
            pageSize: 10,
            type: 'json',
            schema: {
                data: "Data",
                total: "Total",
                errors: 'Errors',
                model: {
                    id: "Id",
                    fields: {
                        Id: { editable: false, field: "id", type: "number", nullable: true },
                        ClientName: { editable: false, field: "clientName", type: "string" },
                        CSCSNumber: { editable: false, field: "cSCSNumber", type: "string" },
                        ShareSymbol: { editable: false, field: "shareSymbol", type: "string" },
                        Type: { editable: false, field: "type", type: "number" },
                        Units: { type: "number", field: "units" },
                        Price: { type: "number", field: "price", format: "{0:N2}" },
                        Value: { type: "number", field: "value", format: "{0:N2}" },
                        AuditDateCreated: { editable: false, field: "auditDateCreated", type: "date", defaultValue: new Date() },
                    }
                },
            },
            batch: false,
            serverPaging: false,
            serverSorting: true,
            serverFiltering: true,
            aggregate: [{ field: "Price", aggregate: "sum" }, { field: "Value", aggregate: "sum" }],
            requestStart: function (e) {
                $("#tradeGrid").mask("Please wait...");
            },
            requestEnd: function (e) {
                $("#tradeGrid").unmask();
            }
        });
        $scope.tradeDataSource.read({ date: $scope.monthSelected });

        $scope.sideDataSource = new kendo.data.DataSource({
            transport: {
                read: {
                    url: "/enum/sides",
                    async: false,
                    dataType: "json"
                },
            }
        });
        $scope.sideDataSource.read();

        $scope.tradeGridOptions = {
            dataSource: $scope.tradeDataSource,
            dataBound: function (e) {
            },
            selectable: "row",
            sortable: true,
            filterable: true,
            groupable: true,
            pageable: {
                refresh: true,
                pageSizes: true
            },
            columns: [
                { field: "Id", hidden: true },
                { field: "ClientName", title: "Client", width: "200px", hidden: true },
                { field: "CSCSNumber", title: "CSCS No", width: "60px", hidden: true },
                { field: "ShareSymbol", title: "Stock", width: "80px" },
                { field: "Type", title: "Type", width: "50px", values: $scope.sideDataSource.data().toJSON() },
                { field: "Units", title: "Units", width: "50px" },
                {
                    field: "Price", title: "Price", width: "50px", format: "₦{0:N2}",
                    template: "<span style='font-weight:bold'>₦#= kendo.format('{0:n2}',Price) #</span>",
                    aggregates: ["sum"],
                    footerTemplate: "<span style='color:green;font-weight:bold'>₦#= kendo.toString(sum, 'n2') # </span>",
                },
                {
                    field: "Value", title: "Value", width: "80px", format: "₦{0:N2}",
                    template: "<span style='color:green;font-weight:bold'>₦#= kendo.format('{0:n2}',Value) #</span>",
                    aggregates: ["sum"],
                    footerTemplate: "<span style='color:green;font-weight:bold'>₦#= kendo.toString(sum, 'n2') # </span>",
                },
                { field: "AuditDateCreated", title: "Date", width: "70px", format: "{0:MMM, dd yyyy}" },
            ],
        };

        $scope.priceSum = 0;
        $scope.valueSum = 0;

        $scope.costSummaryDataSource = new kendo.data.DataSource({
            type: "json",
            transport: {
                read: {
                    url: "/billing/getCompanyCharges",
                    dataType: "json",
                    data: { date: kendo.toString($scope.monthSelected, "yyyy-MM-dd") }
                },
            },
            schema: {
                parse: function (data) {
                    //alert(JSON.stringify(data));
                    $scope.$apply(function () {
                        $scope.costSummary = data;
                    });
                    return data;
                }
            }
        });

        $scope.costSummaryDataSource.read({ date: kendo.toString($scope.monthSelected, "yyyy-MM-dd") });

        $scope.costSummary = [];

        $scope.tax = 0;
    }]);