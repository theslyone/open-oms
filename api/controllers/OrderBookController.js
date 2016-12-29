const util = require('util');

module.exports = {
    trade: function(req, res) {
        var clientId = req.query.clientId;
        Client.findOne({ id: clientId }).then(function(client) {
            if (client !== undefined) {
                var params = req.params.all();
                orderBook = {};
                orderBook.shareId = params.shareId;
                orderBook.ordType = params.ordType;
                orderBook.side = params.side;
                orderBook.quantity = params.quantity;
                orderBook.limitPrice = params.limitPrice;
                orderBook.timeInForce = params.timeInForce;
                orderBook.client = client.id;
                orderBook.date = new Date();
                sails.log(JSON.stringify(orderBook, null, 4));

                OrderBookService.validate(orderBook, function(resp) {
                    if (resp.status) {
                        Stock.findOne({ id: orderBook.shareId })
                            .then(function (stock) {
                                sails.log(JSON.stringify(stock, null, 4));

                                orderBook.symbol = stock.symbol;
                                orderBook.timeInForce = Helper.timeInForce.day;

                                var orderString = util.format('Trading new order: Type=%s Side=%s Symbol=%s Qty=[%d] LimitPrice=[%d]', orderBook.ordType, orderBook.side, orderBook.symbol, orderBook.quantity, orderBook.limitPrice);
                                sails.log(orderString);

                                NSEClient.newOrderRequest(client, orderBook, function(nor) {
                                    orderBook.clOrdID = nor.clOrdID;
                                    orderBook.Date = new Date();
                                    sails.log("Saving order book to database.");
                                    try {
                                        OrderBookService.create(orderBook, function(orderBook) {
                                            return res.created(orderBook);
                                        });

                                    } catch (err) {
                                        return res.serverError(err);
                                    }

                                });
                            })
                            .catch(function(err) {
                                sails.log.error(err);
                                return res.serverError('Error performing trade.');
                            });
                    } else {
                        return res.serverError(resp.message);
                    }
                });
            } else {
                return res.badRequest("Session expired, please log in again");
            }
        });
    },

    retrade: function(req, res) {
        var client = req.session.currentClient;

        var params = req.params.all();
        orderBook.id = req.query.id;
        orderBook.shareId = params.shareId;
        orderBook.ordType = params.ordType;
        orderBook.side = params.side;
        orderBook.quantity = params.quantity;
        orderBook.limitPrice = params.limitPrice;
        orderBook.timeInForce = params.timeInForce;
        orderBook.client = client.id;
        orderBook.Date = new Date();

        if (validateOrderBook(req, res, orderBook)) {
            Stock.find({ id: orderBook.shareId })
                .then(function(stock) {
                    orderBook.symbol = stock.symbol;
                    orderBook.timeInForce = timeInForce.day;

                    var orderString = util.format('Retrading Order: Type=%s Side=%s Symbol=%s Qty=[%d] LimitPrice=[%d]', orderBook.ordType, orderBook.side, orderBook.symbol, orderBook.quantity, orderBook.limitPrice);
                    sails.log(orderString);
                    try {
                        NSEClient.orderCancelReplaceRequest(client, orderBook, function(ocrr) {
                            orderBook.clOrdID = ocrr.clOrdID;
                            sails.log("Saving retraded order book to database.");
                            OrderBook.update({ id: orderBook.id }, orderBook)
                                .then(function(err) {
                                    return res.ok(orderBook);
                                })
                                .catch(function(err) {
                                    return res.serverError(err);
                                });
                        });
                    } catch (err) {
                        return res.serverError(err);
                    }
                })
                .catch(function(err) {
                    sails.log.error(err);
                    return res.badRequest(
                        'Error performing retrade.'
                    );
                });
        }
    },
    cancel: function(req, res) {
        var id = req.query.id;
        OrderBook.findOne({ id: id }).populate('client')
            .then(function(orderBook) {
                NSEClient.orderCancelRequest(orderBook.client, orderBook,
                    function(orderCancelRequest) {
                        return res.ok(orderBook);
                    });
            })
            .catch(function(err) {
                return res.serverError("Failed to cancel order");
            });
    },
    status: function(req, res) {
        var id = req.query.id;
        OrderBook.findOne({ id: id }).populate('client')
            .then(function(orderBook) {
                NSEClient.orderStatusRequest(orderBook.client, orderBook,
                    function(orderStatusRequest) {
                        return res.ok(orderStatusRequest);
                    });
            })
            .catch(function(err) {
                return res.serverError("Failed to request order status");
            });
    },
    statusAll: function(req, res) {

    },


};