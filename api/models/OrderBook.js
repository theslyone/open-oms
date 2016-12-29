/**
 * OrderBook.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    connection: 'sqlserverCRM',
    tableName: 'OrderBooks',

    attributes: {
        id: {
            type: 'integer',
            columnName: 'Id',
            primaryKey: true,
        },
        clOrdID: {
            type: 'string',
            columnName: 'ClOrdID',
        },
        ordType: {
            type: 'integer',
            columnName: 'OrdType',
        },
        side: {
            type: 'integer',
            columnName: 'Side',
        },
        quantity: {
            type: 'float',
            columnName: 'Quantity',
        },
        limitPrice: {
            type: 'float',
            columnName: 'Price',
        },
        timeInForce: {
            type: 'integer',
            columnName: 'TimeInForce',
        },
        date: {
            type: 'datetime',
            columnName: 'Date',
        },
        status: {
            type: 'string',
            columnName: 'Status',
        },
        symbol: {
            type: 'string',
            columnName: 'Symbol',
        },
        shareId: function() {
            return this.share !== undefined ? this.share.id : 0;
        },
        share: {
            model: 'stock',
            columnName: 'ShareId',
        },
        client: {
            model: 'client',
            columnName: 'clientId',
        },
        executionReports: {
            collection: 'executionreport',
            via: 'orderBook',
        },
        toJSON: function() {
            var obj = this.toObject();
            obj.shareId = this.shareId();
            return obj;
        }
    }
};
