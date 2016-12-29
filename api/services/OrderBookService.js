module.exports = {
    create: function(orderBook, next) {
        OrderBook.create(orderBook)
            .exec(function(err, orderBook) {
                if (err)
                    throw new Error(err);
                next(orderBook);
            });
    },

    checkUnitsAvailable: function(orderBook) {
        ClientStock.find({
                clientId: orderBook.client,
                shareId: orderBook.shareId,
                state: stockState.complete
            })
            .then(function(clientStocks) {
                var unitsAvailable = clientStocks.reduce(function(a, b) {
                    return { x: a.units + b.units };
                }).units;

                MandateRequest.find({
                        clientId: orderBook.client,
                        shareId: orderBook.shareId,
                        state: mandateState.approved,
                        type: mandateType.sell
                    })
                    .then(function(mandateReqs) {
                        var sellMandateUnits = mandateReqs.reduce(function(a, b) {
                            return { x: a.units + b.units };
                        }).units;

                        unitsAvailable -= sellMandateUnits;
                        return unitsAvailable;
                    })
                    .catch(function(err) {
                        throw new Error("Error checking units available for sale");
                    });

            })
            .catch(function(err) {
                sails.error(err);
                throw new Error("Error checking units available for sale");
            });
    },

    validate: function(orderBook, callback) {
        var orderBookQuantity = orderBook.quantity;
        var resp = { status: false, message: "" }
        if (orderBook.side == side.sell) {
            sails.log("Order book: sell");
            var unitsAvailable = checkUnitsAvailable(orderBook);
            if (unitsAvailable <= 0) {
                sails.log.warn("No shares found, you cannot sell a share you do not have");
                resp.message = 'No shares found, you cannot sell a share you do not have.';
                callback(resp);
            } else if (unitsAvailable < orderBookQuantity) {
                sails.log.warn("Units cannot exceed " + unitsAvailable);
                resp.message = "Units cannot exceed " + unitsAvailable;
                callback(resp);
            } else {
                resp.status = true;
                callback(resp);
            }
        } else if (orderBook.side == side.buy) {
            sails.log("Order book: buy");
            PartyBalance.getClientBalance(orderBook.client, null, null, function(balance) {
                Stock.find({ id: orderBook.shareId })
                    .then(function(stock) {
                        var shareValue = stock.closingPrice * orderBookQuantity;
                        if (balance == 0 || balance < shareValue) {
                            sails.log.warn("Insufficient funds in account");
                            resp.message = 'Insufficient funds in account.';
                            callback(resp);
                        } else {
                            sails.log("Purchase validated");
                            resp.status = true;
                            resp.stock = stock;
                            callback(resp);
                        }
                    })
                    .catch(function(err) {
                        sails.log.error(err);
                        resp.message = 'Error validating buy request.' + err;
                        callback(resp);
                    });
            });
        }
    }
};

var side = {
    buy: 1,
    sell: 2
};

var mandateState = {
    pending: 0,
    aoReview: 1,
    aoApproved: 2,
    approved: 3,
    traded: 4,
    closed: 5,
    error: 6,
    frozen: 7,
};

var stockState = {
    processing: 1,
    processed: 2,
    verified: 3,
    complete: 4,
};

var mandateType = {
    buy: 1,
    sell: 2,
};

var timeInForce = {
    day: 1,
    goodTillCancel: 4,
}
