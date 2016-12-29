var invert = require('invert-obj');

module.exports = {
    connection: 'sqlserverCRM',
    tableName: 'ClientShares',

    attributes: {
        id: {
            type: 'integer',
            columnName: 'Id',
            primaryKey: true,
        },
        units: {
            type: 'float',
            columnName: 'Units',
            required: true,
        },
        shareId: {
            model: 'stock',
            columnName: 'ShareId',
            required: true,
        },
        symbol: function () {
            return this.shareId !== undefined ? this.shareId.name : 0;
        }, 
        openingPrice: function() {
            return this.shareId !== undefined ? this.shareId.openingPrice : 0;
        },
        closingPrice: function () {
            return this.shareId !== undefined ? this.shareId.closingPrice : 0;
        },
        clientId: {
            model: 'client',
            columnName: 'ClientId',
            required: true,
        },
        state: {
            type: 'integer',
            columnName: 'State',
        },
        isVerified: {
            type: 'boolean',
            columnName: 'IsVerified',
        },
        charge: {
            type: 'float',
            columnName: 'Charge',
        },
        certificateNumber: {
            type: 'string',
            columnName: 'CertificateNumber',
        },

        dateCreated: {
            type: 'datetime',
            columnName: 'DateCreated',
        },
        dateModified: {
            type: 'datetime',
            columnName: 'DateModified',
        },
        dateVerified: {
            type: 'datetime',
            columnName: 'DateVerified',
        },
        toJSON: function () {
            var obj = this.toObject();
            obj.symbol = this.symbol();
            obj.openingPrice = this.openingPrice();
            obj.closingPrice = this.closingPrice();
            return obj;
        }
    }
};
