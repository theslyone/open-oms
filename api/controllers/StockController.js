/**
 * StockController
 *
 * @description :: Server-side logic for managing stocks
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    statistics: function (req, resp) {
        var stockId = req.query.stockId;
        
        StockPriceLogs.find({ where: { share: stockId }, sort: 'date ASC' }).populate('share')
                .then(function (stockDataPoints) {
                    return resp.json(stockDataPoints);                    
                })
                .catch(function (err) {
                    return resp.badRequest(err);
                });       
    },

    top_volume: function (req, resp) {
        var count = req.query.count;
        return resp.json([
            {
            "percentage": 0.0, "key": "ZENITHBANK", "value": 788229488.41, "explode": false,
            "dateStamp": "0001-01-01T00:00:00"
        },
            {
                "percentage": 0.0, "key": "WAPCO", "value": 480230156.89, "explode": false,
                "dateStamp": "0001-01-01T00:00:00"
            },
            {
                "percentage": 0.0, "key": "DANGCEM", "value": 389287237.76, "explode": false,
                "dateStamp": "0001-01-01T00:00:00"
            },
            {
                "percentage": 0.0, "key": "GUARANTY", "value": 367328952.47, "explode": false,
                "dateStamp": "0001-01-01T00:00:00"
            },
            {
                "percentage": 0.0, "key": "STANBIC", "value": 130055815.42, "explode": false,
                "dateStamp": "0001-01-01T00:00:00"
            },
            {
                "percentage": 0.0, "key": "NB", "value": 116367320.11, "explode": false,
                "dateStamp": "0001-01-01T00:00:00"
            }]);
    },

    top_value: function (req, resp) {
        var count = req.query.count;

        /*StockPriceLogs.find({ /*: 'date DESC', max: 'value', groupBy: ['shareId, date'], limit: count })
            .populate('share')
            .then(function (stockDataPoints) {
                data = {};
                /*stockDataPoints.each(function (item) {
                    data.push({key: item.symbol, value: item.value });
                });
                return resp.json(stockDataPoints);
            })
            .catch(function (err) {
                return resp.badRequest(err);
            });*/
        var data = [{ "shareId": 192, "deals": "55", "symbol": "TIGERBRANDS", "value": 837461.0, "high": 3.93, "low": 3.66, "units": 3091478.67, "date": "2016-07-22T00:00:00", "open": 3.66, "close": 3.93, "change": "0.08", "changeValue": 0.27, "percentageChange": 0.0738 }, { "shareId": 87, "deals": "79", "symbol": "STERLNBANK", "value": 1492983.0, "high": 1.22, "low": 1.14, "units": 1732861.71, "date": "2016-08-02T00:00:00", "open": 1.15, "close": 1.22, "change": "0.03", "changeValue": 0.07, "percentageChange": 0.0609 }, { "shareId": 95, "deals": "222", "symbol": "UBA", "value": 15631251.0, "high": 4.77, "low": 4.53, "units": 73370959.5, "date": "2016-08-02T00:00:00", "open": 4.53, "close": 4.77, "change": "0.13", "changeValue": 0.24, "percentageChange": 0.0530 }, { "shareId": 1, "deals": "18", "symbol": "7UP", "value": 19520.0, "high": 126.35, "low": 126.35, "units": 2377862.7, "date": "2016-08-02T00:00:00", "open": 126.35, "close": 133.0, "change": "0", "changeValue": 6.65, "percentageChange": 0.0526 }, { "shareId": 18, "deals": "18", "symbol": "CONOIL", "value": 32751.0, "high": 23.96, "low": 23.96, "units": 748374.81, "date": "2016-08-01T00:00:00", "open": 23.96, "close": 25.22, "change": "0", "changeValue": 1.26, "percentageChange": 0.0526 }, { "shareId": 18, "deals": "5", "symbol": "CONOIL", "value": 1105.0, "high": 23.96, "low": 23.96, "units": 25303.65, "date": "2016-07-22T00:00:00", "open": 23.96, "close": 25.22, "change": "0", "changeValue": 1.26, "percentageChange": 0.0526 }, { "shareId": 135, "deals": "17", "symbol": "MRS", "value": 33141.0, "high": 30.34, "low": 30.34, "units": 958599.72, "date": "2016-07-22T00:00:00", "open": 30.34, "close": 31.93, "change": "0", "changeValue": 1.59, "percentageChange": 0.0524 }, { "shareId": 15, "deals": "10", "symbol": "CCNN", "value": 76809.0, "high": 6.32, "low": 6.32, "units": 472122.62, "date": "2016-08-02T00:00:00", "open": 6.32, "close": 6.65, "change": "0", "changeValue": 0.33, "percentageChange": 0.0522 }, { "shareId": 89, "deals": "137", "symbol": "TOTAL", "value": 592959.0, "high": 200.09, "low": 181.05, "units": 116878787.62, "date": "2016-08-01T00:00:00", "open": 190.57, "close": 200.09, "change": "18.59", "changeValue": 9.52, "percentageChange": 0.0500 }, { "shareId": 42, "deals": "33", "symbol": "INTBREW", "value": 554430.0, "high": 19.34, "low": 18.0, "units": 10159085.2, "date": "2016-08-01T00:00:00", "open": 18.42, "close": 19.34, "change": "-0.04", "changeValue": 0.92, "percentageChange": 0.0499 }];
        return resp.json(data);
    },

    top_gainers: function(req, resp) {
        var count = req.query.count;
        var data = [{ "shareId": 192, "deals": "55", "symbol": "TIGERBRANDS", "value": 837461.0, "high": 3.93, "low": 3.66, "units": 3091478.67, "date": "2016-07-22T00:00:00", "open": 3.66, "close": 3.93, "change": "0.08", "changeValue": 0.27, "percentageChange": 0.0738 }, { "shareId": 87, "deals": "79", "symbol": "STERLNBANK", "value": 1492983.0, "high": 1.22, "low": 1.14, "units": 1732861.71, "date": "2016-08-02T00:00:00", "open": 1.15, "close": 1.22, "change": "0.03", "changeValue": 0.07, "percentageChange": 0.0609 }, { "shareId": 95, "deals": "222", "symbol": "UBA", "value": 15631251.0, "high": 4.77, "low": 4.53, "units": 73370959.5, "date": "2016-08-02T00:00:00", "open": 4.53, "close": 4.77, "change": "0.13", "changeValue": 0.24, "percentageChange": 0.0530 }, { "shareId": 1, "deals": "18", "symbol": "7UP", "value": 19520.0, "high": 126.35, "low": 126.35, "units": 2377862.7, "date": "2016-08-02T00:00:00", "open": 126.35, "close": 133.0, "change": "0", "changeValue": 6.65, "percentageChange": 0.0526 }, { "shareId": 18, "deals": "18", "symbol": "CONOIL", "value": 32751.0, "high": 23.96, "low": 23.96, "units": 748374.81, "date": "2016-08-01T00:00:00", "open": 23.96, "close": 25.22, "change": "0", "changeValue": 1.26, "percentageChange": 0.0526 }, { "shareId": 18, "deals": "5", "symbol": "CONOIL", "value": 1105.0, "high": 23.96, "low": 23.96, "units": 25303.65, "date": "2016-07-22T00:00:00", "open": 23.96, "close": 25.22, "change": "0", "changeValue": 1.26, "percentageChange": 0.0526 }, { "shareId": 135, "deals": "17", "symbol": "MRS", "value": 33141.0, "high": 30.34, "low": 30.34, "units": 958599.72, "date": "2016-07-22T00:00:00", "open": 30.34, "close": 31.93, "change": "0", "changeValue": 1.59, "percentageChange": 0.0524 }, { "shareId": 15, "deals": "10", "symbol": "CCNN", "value": 76809.0, "high": 6.32, "low": 6.32, "units": 472122.62, "date": "2016-08-02T00:00:00", "open": 6.32, "close": 6.65, "change": "0", "changeValue": 0.33, "percentageChange": 0.0522 }, { "shareId": 89, "deals": "137", "symbol": "TOTAL", "value": 592959.0, "high": 200.09, "low": 181.05, "units": 116878787.62, "date": "2016-08-01T00:00:00", "open": 190.57, "close": 200.09, "change": "18.59", "changeValue": 9.52, "percentageChange": 0.0500 }, { "shareId": 42, "deals": "33", "symbol": "INTBREW", "value": 554430.0, "high": 19.34, "low": 18.0, "units": 10159085.2, "date": "2016-08-01T00:00:00", "open": 18.42, "close": 19.34, "change": "-0.04", "changeValue": 0.92, "percentageChange": 0.0499 }];
        return resp.json(data);
    },

    top_losers: function (req, resp) {
        var count = req.query.count;
        var data = [{ "shareId": 5, "deals": "136", "symbol": "AFRIPRUD", "value": 3624088.0, "high": 2.86, "low": 2.73, "units": 10016846.7, "date": "2016-08-02T00:00:00", "open": 2.8, "close": 2.73, "change": "-0.14", "changeValue": -0.07, "percentageChange": -0.025 }, { "shareId": 16, "deals": "4", "symbol": "CHAMPION", "value": 4686.0, "high": 3.81, "low": 3.81, "units": 17386.52, "date": "2016-08-02T00:00:00", "open": 3.81, "close": 3.63, "change": "0", "changeValue": -0.18, "percentageChange": -0.0472 }, { "shareId": 25, "deals": "76", "symbol": "DANGFLOUR", "value": 1839428.0, "high": 4.85, "low": 4.67, "units": 8697816.98, "date": "2016-08-02T00:00:00", "open": 4.9, "close": 4.67, "change": "-0.23", "changeValue": -0.23, "percentageChange": -0.0469 }, { "shareId": 26, "deals": "42", "symbol": "DANGSUGAR", "value": 627655.0, "high": 6.68, "low": 6.52, "units": 4187750.95, "date": "2016-08-02T00:00:00", "open": 6.67, "close": 6.52, "change": "-0.13", "changeValue": -0.15, "percentageChange": -0.0225 }, { "shareId": 27, "deals": "30", "symbol": "DIAMONDBNK", "value": 1175145.0, "high": 1.56, "low": 1.54, "units": 1825434.71, "date": "2016-08-02T00:00:00", "open": 1.56, "close": 1.55, "change": "-0.07", "changeValue": -0.01, "percentageChange": -0.0064 }, { "shareId": 30, "deals": "43", "symbol": "ETI", "value": 1014366.0, "high": 12.51, "low": 12.2, "units": 12546961.74, "date": "2016-08-02T00:00:00", "open": 12.51, "close": 12.34, "change": "-0.4", "changeValue": -0.17, "percentageChange": -0.0136 }, { "shareId": 32, "deals": "103", "symbol": "FCMB", "value": 7069374.0, "high": 1.4, "low": 1.33, "units": 9570835.12, "date": "2016-08-02T00:00:00", "open": 1.4, "close": 1.33, "change": "-0.08", "changeValue": -0.07, "percentageChange": -0.05 }, { "shareId": 33, "deals": "202", "symbol": "FIDELITYBK", "value": 26180824.0, "high": 1.12, "low": 1.07, "units": 28646240.95, "date": "2016-08-02T00:00:00", "open": 1.12, "close": 1.11, "change": "-0.06", "changeValue": -0.01, "percentageChange": -0.0089 }, { "shareId": 42, "deals": "9", "symbol": "INTBREW", "value": 43019.0, "high": 19.99, "low": 19.99, "units": 819361.81, "date": "2016-08-02T00:00:00", "open": 19.99, "close": 19.34, "change": "0", "changeValue": -0.65, "percentageChange": -0.0325 }, { "shareId": 48, "deals": "27", "symbol": "LIVESTOCK", "value": 900428.0, "high": 0.93, "low": 0.89, "units": 807816.0, "date": "2016-08-02T00:00:00", "open": 0.93, "close": 0.89, "change": "-0.04", "changeValue": -0.04, "percentageChange": -0.0430 }];
        return resp.json(data);
    },

    top_unchanged: function(req, resp, count) {
        var data = [{ "shareId": 36, "deals": "61", "symbol": "FO", "value": 342781.0, "high": 167.0, "low": 167.0, "units": 57463197.69, "date": "2016-08-02T00:00:00", "open": 167.0, "close": 167.0, "change": "-7.8", "changeValue": 0.0, "percentageChange": 0.0 }, { "shareId": 24, "deals": "40", "symbol": "DANGCEM", "value": 2127512.0, "high": 183.0, "low": 183.0, "units": 389287237.76, "date": "2016-08-02T00:00:00", "open": 183.0, "close": 183.0, "change": "3", "changeValue": 0.0, "percentageChange": 0.0 }, { "shareId": 59, "deals": "73", "symbol": "NESTLE", "value": 85452.0, "high": 816.2, "low": 816.2, "units": 69308290.62, "date": "2016-08-02T00:00:00", "open": 816.2, "close": 816.2, "change": "-21.3", "changeValue": 0.0, "percentageChange": 0.0 }, { "shareId": 104, "deals": "77", "symbol": "WAPCO", "value": 9048817.0, "high": 53.07, "low": 53.07, "units": 480230156.89, "date": "2016-08-02T00:00:00", "open": 53.07, "close": 53.07, "change": "-2.79", "changeValue": 0.00, "percentageChange": 0.0 }, { "shareId": 81, "deals": "3", "symbol": "SEPLAT", "value": 10250.0, "high": 282.94, "low": 282.94, "units": 2900135.0, "date": "2016-08-02T00:00:00", "open": 282.94, "close": 282.94, "change": "-14.89", "changeValue": 0.00, "percentageChange": 0.0 }, { "shareId": 39, "deals": "46", "symbol": "GUINNESS", "value": 1012856.0, "high": 94.0, "low": 94.0, "units": 95189712.93, "date": "2016-08-02T00:00:00", "open": 94.0, "close": 94.0, "change": "1", "changeValue": 0.0, "percentageChange": 0.0 }, { "shareId": 94, "deals": "26", "symbol": "UACN", "value": 286128.0, "high": 20.0, "low": 20.0, "units": 5808107.35, "date": "2016-08-02T00:00:00", "open": 20.0, "close": 20.0, "change": "-0.73", "changeValue": 0.0, "percentageChange": 0.0 }, { "shareId": 12, "deals": "36", "symbol": "CADBURY", "value": 152919.0, "high": 13.9, "low": 13.9, "units": 2111399.92, "date": "2016-08-02T00:00:00", "open": 13.9, "close": 13.9, "change": "0.34", "changeValue": 0.0, "percentageChange": 0.0 }, { "shareId": 78, "deals": "8", "symbol": "REDSTAREX", "value": 155855.0, "high": 4.02, "low": 4.02, "units": 626757.1, "date": "2016-08-02T00:00:00", "open": 4.02, "close": 4.02, "change": "-0.21", "changeValue": 0.00, "percentageChange": 0.0 }, { "shareId": 54, "deals": "33", "symbol": "NASCON", "value": 1282530.0, "high": 8.0, "low": 8.0, "units": 10269099.8, "date": "2016-08-02T00:00:00", "open": 8.0, "close": 8.0, "change": "-0.19", "changeValue": 0.0, "percentageChange": 0.0 }];
        return resp.json(data);
    },

    top_trades: function(req, resp, count) {
        var data = [{ "shareId": 107, "deals": "255", "symbol": "ZENITHBANK", "value": 46799425.0, "high": 16.91, "low": 16.45, "units": 788229488.41, "date": "2016-08-02T00:00:00", "open": 16.45, "close": 16.8, "change": "0.09", "changeValue": 0.35, "percentageChange": 0.0213 }, { "shareId": 104, "deals": "77", "symbol": "WAPCO", "value": 9048817.0, "high": 53.07, "low": 53.07, "units": 480230156.89, "date": "2016-08-02T00:00:00", "open": 53.07, "close": 53.07, "change": "-2.79", "changeValue": 0.00, "percentageChange": 0.0 }, { "shareId": 24, "deals": "40", "symbol": "DANGCEM", "value": 2127512.0, "high": 183.0, "low": 183.0, "units": 389287237.76, "date": "2016-08-02T00:00:00", "open": 183.0, "close": 183.0, "change": "3", "changeValue": 0.0, "percentageChange": 0.0 }, { "shareId": 38, "deals": "296", "symbol": "GUARANTY", "value": 15295760.0, "high": 24.1, "low": 23.8, "units": 367328952.47, "date": "2016-08-02T00:00:00", "open": 24.0, "close": 24.09, "change": "-0.2", "changeValue": 0.09, "percentageChange": 0.0038 }, { "shareId": 85, "deals": "15", "symbol": "STANBIC", "value": 9698412.0, "high": 13.41, "low": 13.41, "units": 130055815.42, "date": "2016-08-02T00:00:00", "open": 13.41, "close": 13.41, "change": "0.16", "changeValue": 0.00, "percentageChange": 0.0 }, { "shareId": 55, "deals": "133", "symbol": "NB", "value": 864504.0, "high": 135.11, "low": 133.13, "units": 116367320.11, "date": "2016-08-02T00:00:00", "open": 137.98, "close": 133.13, "change": "-0.87", "changeValue": -4.85, "percentageChange": -0.0352 }, { "shareId": 4, "deals": "149", "symbol": "ACCESS", "value": 20396005.0, "high": 5.68, "low": 5.6, "units": 114671252.24, "date": "2016-08-02T00:00:00", "open": 5.6, "close": 5.68, "change": "0.18", "changeValue": 0.08, "percentageChange": 0.0143 }, { "shareId": 39, "deals": "46", "symbol": "GUINNESS", "value": 1012856.0, "high": 94.0, "low": 94.0, "units": 95189712.93, "date": "2016-08-02T00:00:00", "open": 94.0, "close": 94.0, "change": "1", "changeValue": 0.0, "percentageChange": 0.0 }, { "shareId": 95, "deals": "222", "symbol": "UBA", "value": 15631251.0, "high": 4.77, "low": 4.53, "units": 73370959.5, "date": "2016-08-02T00:00:00", "open": 4.53, "close": 4.77, "change": "0.13", "changeValue": 0.24, "percentageChange": 0.0530 }, { "shareId": 59, "deals": "73", "symbol": "NESTLE", "value": 85452.0, "high": 816.2, "low": 816.2, "units": 69308290.62, "date": "2016-08-02T00:00:00", "open": 816.2, "close": 816.2, "change": "-21.3", "changeValue": 0.0, "percentageChange": 0.0 }];
        return resp.json(data);
    },
};
