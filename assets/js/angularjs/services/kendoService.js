//'use strict';
marketPlaceApp.factory('kendoService', function kendoService($http) {
    var service = {
        sailsGet: function (url, customfilter, defaultSort, options) {
            take = options.take;
            skip = options.skip;
            page = options.page;
            pageSize = options.pageSize;
            filter = options.filter;
            aggregate = options.aggregate;
            group = options.group;
            sort = defaultSort; //options.sort; { field: "ProductName", dir: "desc" }

            if (filter != undefined) {
                filters = filter.filters;
                for (var index = 0; index < filters.length; index++) {
                    //'?where={"name":{"contains":"theodore"},{}}'
                    field = filters[index].field;
                    operator = filters[index].operator;
                    value = filters[index].value;
                    if (operator == 'eq') {
                        customfilter = customfilter + ", { \"" + field + "\": \"" + value + "\" }";
                    } else if (operator == 'lt') {
                        customfilter = customfilter + ", { \"" + field + "\": { \"<\": \"" + value + "\"} }";
                    } else if (operator == 'gt') {
                        customfilter = customfilter + ", { \"" + field + "\": { \">\": \"" + value + "\"} }";
                    } else if (operator == 'lte') {
                        customfilter = customfilter + ", { \"" + field + "\": { \"<=\": \"" + value + "\"} }";
                    } else if (operator == 'gte') {
                        customfilter = customfilter + ", { \"" + field + "\": { \">=\": \"" + value + "\"} }";
                    } else {
                        customfilter = customfilter + ", { \"" + field + "\": { \"" + operator + "\": \"" + value + "\"} }";
                    }
                }
            }
            if (customfilter != '') {
                sailsFilter = url + "?where=" + customfilter + "&sort=" + sort + "&skip=" + skip + "&limit=" + take;
            }
            else {
                sailsFilter = url + "?sort=" + sort + "&skip=" + skip + "&limit=" + take;
            }
            //alert(sailsFilter);
            return sailsFilter;
        }
    }
    return service;
});


