var actionUtil = require('sails/lib/hooks/blueprints/actionUtil'),
    _ = require('lodash'),
    invert = require('invert-obj');

module.exports = {
    statistics: function (req, res) {
        var clientId = req.query.clientId;
        ClientStock.find({ clientId: clientId })
            .then(function (clientStocks) {
                var stockIds = clientStocks.map(function (clientStock) { return clientStock.shareId; });
                //sails.log(JSON.stringify(stockIds,null,4));
                StockPriceLogs.find({ where: { share: stockIds }, sort: 'date DESC' })
                    .populate('share')
                    .then(function (stockDataPoints) {
                        return res.json(stockDataPoints);
                    })
                    .catch(function (err) {
                        return res.badRequest(err);
                    });
            })
            .catch(function (err) {
                return res.badRequest(err);
            });
    },

    findByClient: function (req, res) {
        var clientId = req.query.clientId;
        var criteria = { clientId: clientId, state: { '!': Helper.stockState.verified } }; //actionUtil.parseCriteria(req);
        // Lookup for records that match the specified criteria
        var query = ClientStock.find().populate("shareId")
            .where(criteria)
            .limit(actionUtil.parseLimit(req))
            .skip(actionUtil.parseSkip(req))
            .sort(actionUtil.parseSort(req));
        query = actionUtil.populateRequest(query, req);

        query.exec(function found(err, clientStocks) {
            if (err)
                return res.serverError(err);

            MandateRequest.find({ clientId: clientId, state: [Helper.mandateState.approved, Helper.mandateState.traded] })
                .then(function (mandateRequests) {
                    _.each(clientStocks, function (csvm) {                        
                        csvm.stateValue = invert(Helper.stockState)[csvm.state];
                        csvm.pendingUnits = 0;
                        if (mandateRequests != undefined && mandateRequests.length > 0) {
                            var shareMandateRequests = mandateRequests.find(function (mr) { return mr => mr.shareId == csvm.shareId; });
                            var buyUnits = shareMandateRequests != undefined && shareMandateRequests.length > 0 ? 
                                shareMandateRequests.find(function (mr) { return mr.type == Helper.mandateType.buy; })
                                .reduce(function (a, b) { return { x: a.units + b.units }; })
                                .units : 0;
                            var sellUnits = shareMandateRequests != undefined && shareMandateRequests.length > 0 ?
                                shareMandateRequests.find(function (mr) { return mr.type == Helper.mandateType.sell; })
                                .reduce(function (a, b) { return { x: a.units + b.units }; })
                                .units : 0;

                            csvm.pendingUnits = buyUnits - sellUnits;

                            if (csvm.state == Helper.stockState.processing) {
                                csvm.pendingUnits += csvm.units;
                                csvm.units = 0;
                                var extra = csvm.pendingUnits > 0 ? " Buy" : " Sale";
                                csvm.stateValue = csvm.state + extra;
                            }
                            else if (csvm.state == Helper.stockState.complete && shareMandateRequests.Count > 0) {
                                var extra = csvm.PendingUnits > 0 ? " Buy" : " Sale";
                                csvm.stateValue = Helper.stockState.processing + extra;
                            }
                        } 
                    });

                    if (req._sails.hooks.pubsub && req.isSocket) {
                        ClientStock.subscribe(req, clientStocks);
                        if (req.options.autoWatch) { Model.watch(req); }
                        // Also subscribe to instances of all associated models
                        _.each(clientStocks, function (record) {
                            actionUtil.subscribeDeep(req, record);
                        });
                    }

                    ClientStock.count(criteria).exec(function (error, total) {
                        if (err)
                            return res.serverError(err);
                        var data = {};

                        data.total = total;
                        data.results = clientStocks;
                        res.ok(data);
                    });
                })
                .catch(function (err) {
                    return res.serverError(err);
                })
        });
    }
};

