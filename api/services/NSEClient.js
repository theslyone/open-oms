	var _path = __dirname + '/quickfix';
	//var quickfix = require('./quickfix/node-quickfix');
    var quickfix = require('node-quickfix');

	var pad = require('pad');
	var common = require(_path + '/common');
	var df = require('dateformat');
	var events = require('events');

	var fixMessage = require('./quickfix/fixMessage');

    var initiator = quickfix.initiator;
    var fix = require('nse-fix');

	var options = {
	    credentials: {
	        username: "ZEEWEEFIX",
	        password: "Password45"
	    },
	    propertiesFile: _path + '/initiator.cfg'
	};


	// extend prototype
	function inherits(target, source) {
	    for (var k in source.prototype)
	        target.prototype[k] = source.prototype[k];
	}

	inherits(initiator, events.EventEmitter);

	var fixClient = new initiator({
	    onCreate: function(sessionID) {
	        fixClient.emit('create', common.stats(fixClient, sessionID));
	        //console.log("onCreate");
	    },
	    onLogon: function(sessionID) {
	        fixClient.emit('logon', common.stats(fixClient, sessionID));
	        //console.log("onLogon");
	    },
	    onLogout: function(sessionID) {
	        fixClient.emit('logout', common.stats(fixClient, sessionID));
	        //console.log("onLogout");
	    },
	    onLogonAttempt: function(message, sessionID) {
	        fixClient.emit('logonAttempt', common.stats(fixClient, sessionID, message));
	        //console.log("onLogonAttempt");
	    },
	    toAdmin: function(message, sessionID) {
	        fixClient.emit('toAdmin', common.stats(fixClient, sessionID, message));
	        //console.log("toAdmin");
	    },
	    fromAdmin: function(message, sessionID) {
	        fixClient.emit('fromAdmin', common.stats(fixClient, sessionID, message));
	        if (message.header[35] == '0') //MsgType.HEARTBEAT
	        {
	            fixClient.emit('heartBit', common.stats(fixClient, sessionID, message));
	        }

	        if (message.header[35] == '3') //QuickFix.FIX44.Reject.MsgType
	        {
	            fixClient.emit('reject', common.stats(fixClient, sessionID, message));
	        }

	        if (message.header[35] == '5') //MsgType.LOGOUT
	        {
	            fixClient.emit('logout', common.stats(fixClient, sessionID, message));
	        }
	        //console.log("fromAdmin");
	    },
	    fromApp: function(message, sessionID) {
	        fixClient.emit('fromApp', common.stats(fixClient, sessionID, message));
	        console.log("fromApp");
	        crack(message, sessionID);
	    }
	}, options);


	var crack = function(message, sessionID) {
	    switch (message.header[MsgType.Tag]) {
	        case MsgType.Keys.ORDER_CANCEL_REJECT:
	            var orderCancelReject = new fix.OrderCancelReject(message);
	            fixClient.emit("orderCancelReject", orderCancelReject);
	            break;
	        case MsgType.Keys.EXECUTION_REPORT:
	            var executionReport = new fix.ExecutionReport(message);
	            fixClient.emit("executionReport", executionReport);
	            break;
	        case MsgType.Keys.MARKET_DATA_W:
	            var marketDataSnapshotFullRefresh = new fix.MarketDataSnapshotFullRefresh(message);
	            fixClient.emit("marketDataSnapshotFullRefresh", marketDataSnapshotFullRefresh);
	            break;
	        case MsgType.Keys.MARKET_DATA_X:
	            var marketDataIncrementalRefresh = new fix.MarketDataIncrementalRefresh(message);
	            fixClient.emit("marketDataIncrementalRefresh", marketDataIncrementalRefresh);
	            break;
	        case MsgType.Keys.MARKET_DATA_REQUEST_REJECT:
	            var marketDataRequestReject = new fix.MarketDataRequestReject(message);
	            fixClient.emit("marketDataRequestReject", marketDataRequestReject);
	            break;
	    }
	};

	fixClient.newOrderRequest = function(client, orderBook, callback) {
	    var newOrderSingle = new fixMessage(fix.messages.NewOrderSingle.msgType); //'D'
	    newOrderSingle.tags[fix.fields.ClOrdID.Tag] = df(new Date(), "yyyymmddHHMMss");
	    newOrderSingle.tags[fix.fields.Side.Tag] = orderBook.side;
	    newOrderSingle.tags[fix.fields.TransactTime.Tag] = new Date();
	    newOrderSingle.tags[fix.fields.OrdType.Tag] = orderBook.ordType;

	    newOrderSingle.tags[fix.fields.SecurityID.Tag] = orderBook.symbol;
	    newOrderSingle.tags[fix.fields.SecurityIDSource.Tag] = "99";

	    newOrderSingle.tags[fix.fields.Account.Tag] = pad(10, client.cscsNumber, '0');

	    newOrderSingle.tags[fix.fields.OrderQty.Tag] = orderBook.quantity;
	    newOrderSingle.tags[fix.fields.TimeInForce.Tag] = orderBook.timeInForce;

	    var orderType = newOrderSingle.tags[fix.fields.OrdType.Tag];
	    if (orderType == fix.fields.OrdType.Keys.LIMIT ||
	        orderType == fix.fields.OrdType.Keys.STOP_LIMIT) {
	        newOrderSingle.tags[fix.fields.Price.Tag] = orderBook.limitPrice;
	    }
	    if (orderType == fix.fields.OrdType.Keys.STOP ||
	        orderType == fix.fields.OrdType.Keys.STOP_LIMIT) {
	        newOrderSingle.tags[fix.fields.StopPx.Tag] = orderBook.LimitPrice;
	    };

	    fixClient.send(newOrderSingle, function() {
	        console.log("NewOrderSingle sent!");
	        common.printStats(fixClient);
	        //process.stdin.resume();	        
	        callback({
	            clOrdID: newOrderSingle.tags[fix.fields.ClOrdID.Tag]
	        });
	    });
	};

	fixClient.orderStatusRequest = function(client, orderBook, callback) {
	    var orderStatusRequest = new fixMessage(fix.messages.OrderStatusRequest.msgType); //'H'
	    orderStatusRequest.tags[fix.fields.ClOrdID.Tag] = orderBook.clOrdID;
	    orderStatusRequest.tags[fix.fields.SecurityID.Tag] = orderBook.symbol;
	    orderStatusRequest.tags[fix.fields.SecurityIDSource.Tag] = "99";
	    orderStatusRequest.tags[fix.fields.Side.Tag] = orderBook.side;

	    orderStatusRequest.tags[fix.fields.OrdStatusReqID.Tag] = orderBook.id;
	    orderStatusRequest.tags[fix.fields.Account.Tag] = pad(10, client.cscsNumber, '0');

	    if (orderBook.orderID !== "UNKNOWN") {
	        orderStatusRequest.tags[fix.fields.OrderID.Tag] = orderBook.orderID;
	    }

	    fixClient.send(orderStatusRequest, function() {
	        console.log("OrderStatusRequest sent!");
	        common.printStats(fixClient);
	        //process.stdin.resume();	        
	        callback(orderStatusRequest);
	    });
	};

	fixClient.orderCancelReplaceRequest = function(client, orderBook, callback) {
	    var orderCancelReplaceRequest = new fixMessage(fix.messages.OrderCancelReplaceRequest.msgType); //'H'
	    orderCancelReplaceRequest.tags[fix.fields.OrderID.Tag] = orderBook.orderID;
	    orderCancelReplaceRequest.tags[fix.fields.ClOrdID.Tag] = df(new Date(), "yyyymmddHHMMss");
	    orderCancelReplaceRequest.tags[fix.fields.OrigClOrdID.Tag] = orderBook.clOrdID;
	    orderCancelReplaceRequest.tags[fix.fields.Side.Tag] = orderBook.side;
	    orderCancelReplaceRequest.tags[fix.fields.TransactTime.Tag] = new Date();

	    orderCancelReplaceRequest.tags[fix.fields.SecurityID.Tag] = orderBook.symbol;
	    orderCancelReplaceRequest.tags[fix.fields.SecurityIDSource.Tag] = "99";

	    orderCancelReplaceRequest.tags[fix.fields.OrdType.Tag] = orderBook.ordType;
	    orderCancelReplaceRequest.tags[fix.fields.OrderQty.Tag] = orderBook.quantity;
	    orderCancelReplaceRequest.tags[fix.fields.TimeInForce.Tag] = orderBook.timeInForce;

	    orderCancelReplaceRequest.tags[fix.fields.Account.Tag] = pad(10, client.cscsNumber, '0');
	    if (orderBook.ordType == fix.fields.OrdType.Keys.LIMIT) {
	        orderCancelReplaceRequest.tags[fix.fields.Price.Tag] = orderBook.limitPrice;
	    }

	    fixClient.send(orderCancelReplaceRequest, function() {
	        console.log("OrderCancelReplaceRequest sent!");
	        common.printStats(fixClient);
	        //process.stdin.resume();	        
	        callback({
	            clOrdID: orderCancelReplaceRequest.tags[fix.fields.ClOrdID.Tag]
	        });
	    });
	};

	fixClient.orderCancelRequest = function(client, orderBook, callback) {
	    var orderCancelRequest = new fixMessage(fix.messages.OrderCancelRequest.msgType); //'F'
	    orderCancelRequest.tags[fix.fields.OrderID.Tag] = orderBook.orderID;
	    orderCancelRequest.tags[fix.fields.ClOrdID.Tag] = df(new Date(), "yyyymmddHHMMss");
	    orderCancelRequest.tags[fix.fields.OrigClOrdID.Tag] = orderBook.clOrdID;
	    orderCancelRequest.tags[fix.fields.Side.Tag] = orderBook.side;
	    orderCancelRequest.tags[fix.fields.TransactTime.Tag] = new Date();

	    orderCancelRequest.tags[fix.fields.SecurityID.Tag] = orderBook.symbol;
	    orderCancelRequest.tags[fix.fields.SecurityIDSource.Tag] = "99";

	    orderCancelRequest.tags[fix.fields.OrdType.Tag] = orderBook.ordType;
	    orderCancelRequest.tags[fix.fields.OrderQty.Tag] = orderBook.quantity;

	    orderCancelRequest.tags[fix.fields.Account.Tag] = pad(10, client.cscsNumber, '0');

	    fixClient.send(orderCancelRequest, function() {
	        console.log("OrderCancelRequest sent!");
	        common.printStats(fixClient);
	        //process.stdin.resume();	        
	        callback(orderCancelRequest);
	    });
	};


	fixClient.marketDataSubscription = function(stock, reqId, callback) {
	    var marketDataRequest = new fixMessage(fix.messages.MarketDataIncrementalRefresh.msgType); //'X'
	    var currentDate = df(new Date(), "yyyymmddHHMMss");
	    var mdReqID = reqId != null ? currentDate + "_" + reqId : currentDate;
	    marketDataRequest.tags[fix.fields.MDReqID.Tag] = mdReqID;

	    /*
	    	    marketDataRequest.groups: [{
	    	        'index': 5, //fix.fields.NoMDEntries.Tag,
	    	        'delim': 1, //fix.fields.MDUpdateAction.Tag,
	    	        'entries': [{ tag1: value1, tag2: value2 }, { tag1: value1, tag2: value2 }]
	    	    }, ...];

	    	    marketDataRequest.tags[fix.fields.MDUpdateType.Tag] = mdReqID;

	    	    //0 = Snapshot, 1 = Snapshot + Updates (Subscribe), 2 = Disable previous Snapshot + Update Request (Unsubscribe)
	    	    SubscriptionRequestType subType = null;
	    	    subType = new SubscriptionRequestType(SubscriptionRequestType.SNAPSHOT_PLUS_UPDATES);
	    	    marketDataRequest.tags[fix.fields.MDBookType.Tag] = mdReqID;

	    	    MarketDepth marketDepth = new MarketDepth(0); //full book

	    	    MarketDataRequest marketDataRequest = new MarketDataRequest(mdReqID, subType, marketDepth);
	    	    marketDataRequest.Set(new MDUpdateType(1)); //0 = Full refresh, 1 = Incremental refresh
	    	    //marketDataRequest.Set(new AggregatedBook(false)); //Market by order = 0, Market by price = 1

	    	    AddMDType(marketDataRequest, MDEntryType.BID);
	    	    AddMDType(marketDataRequest, MDEntryType.OFFER);
	    	    AddMDType(marketDataRequest, MDEntryType.TRADE);
	    	    AddMDType(marketDataRequest, MDEntryType.INDEX_VALUE);
	    	    AddMDType(marketDataRequest, 'a');
	    	    AddMDType(marketDataRequest, MDEntryType.OPENING_PRICE);
	    	    AddMDType(marketDataRequest, MDEntryType.CLOSING_PRICE);
	    	    AddMDType(marketDataRequest, MDEntryType.SETTLEMENT_PRICE);
	    	    AddMDType(marketDataRequest, MDEntryType.TRADING_SESSION_HIGH_PRICE);
	    	    AddMDType(marketDataRequest, MDEntryType.TRADING_SESSION_LOW_PRICE);
	    	    AddMDType(marketDataRequest, MDEntryType.TRADING_SESSION_VWAP_PRICE);
	    	    AddMDType(marketDataRequest, MDEntryType.IMBALANCE);
	    	    AddMDType(marketDataRequest, MDEntryType.TRADE_VOLUME);
	    	    AddMDType(marketDataRequest, MDEntryType.OPEN_INTEREST);

	    	    MarketDataRequest.NoRelatedSymGroup symbolGroup = new MarketDataRequest.NoRelatedSymGroup();
	    	    symbolGroup.Set(new SecurityID(string.IsNullOrEmpty(symbol) ? "*" : symbol));
	    	    symbolGroup.Set(QuerySecurityIdSource());
	    	    //symbolGroup.Set(new Symbol(symbol));

	    	    marketDataRequest.AddGroup(symbolGroup);
	    */
	    callback(marketDataRequest);
	};

	module.exports = fixClient;
