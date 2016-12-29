/**
 * Stock.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    connection: 'sqlserverCRM',
    tableName: 'Shares',

    attributes: {
        id: {
            type: 'integer',
            columnName: 'Id',
            primaryKey: true,
        },
        name: {
            type: 'string',
            columnName: 'Name',
        },
        symbolName: {
            type: 'string',
            columnName: 'SymbolName',
            unique: true
        },
        symbol: {
            type: 'string',
            columnName: 'Symbol',
            unique: true
        },
        openingPrice: {
            type: 'float',
            columnName: 'OpeningPrice',
        },
        closingPrice: {
            type: 'float',
            columnName: 'ClosingPrice',
        },
        lastUpdated: {
            type: 'datetime',
            columnName: 'LastUpdated',
        },        
    }
};

