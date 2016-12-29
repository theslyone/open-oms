getSocketId = function(req) {
    if (!req.isSocket) {
        return res.badRequest();
    }

    var socketId = sails.sockets.getId(req);
    // => "BetX2G-2889Bg22xi-jy"

    sails.log('Client socket Id is: ' + socketId);

    return socketId;
}

var subscribe = function(req, res, stock) {

    NSEClient.marketDataSubscription(stock, null, function() {
        sails.sockets.join(req, stock.symbol, function(err) {
            if (err) {
                return res.serverError(err);
            }

            return res.json({
                message: 'Subscribed to market data for ' + stock.symbol + '!'
            });
        });
    });
}

var unsubscribe = function(req, res, stock) {
    sails.sockets.leave(req, stock.symbol, function(err) {
        if (err) {
            return res.serverError(err);
        }

        return res.json({
            message: 'Unsubscribed from market data for ' + stock.symbol + '!'
        });
    });

}

module.exports = {
    connectionStatus: function(req, res) {
        sails.log("Getting connection status");
        if (!req.isSocket) {
            return res.badRequest('This endpoints only supports socket requests.');
        }
        sails.sockets.broadcast(getSocketId(req), "warn", "Not connected");
        return res.json(false);
    },

    stockSubscription: function(req, res) {
        if (_.isUndefined(req.param('stockId'))) {
            return res.badRequest('`stock` is required.');
        }

        if (!req.isSocket) {
            return res.badRequest('This endpoints only supports socket requests.');
        }

        sails.log("reading market data request");

        var stockId = req.param('stockId');
        var value = req.param('value');
        Stock.findOne({ id: stockId }).exec(function(err, stock) {
            if (err) {
                return res.serverError(err);
            }

            if (value == true) {
                subscribe(req, res, stock);
            } else {
                unsubscribe(req, res, stock);
            }
        });


    }
};

sails.on('hook:orm:loaded', function() {
    //NSEClient.start(function() {
        //sails.log.warn("nse::start");
    //});
});



NSEClient.on("create", function() {
    sails.sockets.blast('poke', {
        message: 'Client created'
    });
    sails.log.warn("nse::create");
});

NSEClient.on("logonAttempt", function() {
    sails.log.warn("nse::logonAttempt");
});

NSEClient.on("logon", function() {
    sails.sockets.blast('nse::connected', {
        date: new Date()
    });
    sails.log.warn("nse::logon");   
});

NSEClient.on("logout", function() {
    sails.sockets.blast('nse::disconnected', {
        date: new Date()
    });
    //sails.log.warn("nse::logout");
});

NSEClient.on("heartBit", function() {
    sails.sockets.blast('nse::connected', {
        date: new Date()
    });
    sails.log.warn("nse::heartBit");
});

NSEClient.on("orderCancelReject", function(report) {
    sails.log.warn("nse::orderCancelReject");
});

NSEClient.on("executionReport", function(report) {
    sails.log.warn("nse::executionReport");
});
