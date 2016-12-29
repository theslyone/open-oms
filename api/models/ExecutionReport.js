/**
 * ExecutionReport.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    connection: 'sqlserverCRM',
    tableName: 'ExecutionBooks',

    attributes: {
        id: {
            type: 'integer',
            columnName: 'Id',
            primaryKey: true,
        },
        symbol: {
            type: 'string',
            columnName: 'Symbol',
        },
        orderId: {
            type: 'string',
            columnName: 'OrderID',
        },
        execID: {
            type: 'string',
            columnName: 'ExecID',
        },
        transType: {
            type: 'string',
            columnName: 'TransType',
        },
        execType: {
            type: 'string',
            columnName: 'ExecType',
        },
        side: {
            type: 'integer',
            columnName: 'Side',
        },
        clOrdId: {
            type: 'string',
            columnName: 'ClOrdID',
        },
        avgPx: {
            type: 'float',
            columnName: 'AvgPx',
        },
        lastPx: {
            type: 'float',
            columnName: 'LastPx',
        },
        leavesQty: {
            type: 'integer',
            columnName: 'LeavesQty',
        },
        lastQty: {
            type: 'integer',
            columnName: 'LastQty',
        },
        orderStatus: {
            type: 'string',
            columnName: 'OrderStatus',
        },
        price: {
            type: 'float',
            columnName: 'Price',
        },
        tradeDate: {
            type: 'datetime',
            columnName: 'TradeDate',
        },
        date: {
            type: 'datetime',
            columnName: 'Date',
        },
        text: {
            type: 'string',
            columnName: 'Text',
        },
        orderBook: {
            model: 'orderbook',
            columnName: 'OrderBookId',
        },
    }
};
