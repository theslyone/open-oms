module.exports = {
    connection: 'sqlserverCRM',
    tableName: 'SharePriceLogs',

    attributes: {
        id: {
            type: 'integer',
            columnName: 'Id',
            primaryKey: true,
        },
        shareId: function () {
            return this.share !== undefined ? this.share.id : 0;
        },
        symbol: function () {
            return this.share !== undefined ? this.share.symbol : 0;
        },
        share: {
            model: 'stock',
            columnName: 'ShareId',
        },
        deals: {
            type: 'string',
            columnName: 'Deals',
        },
        units: {
            type: 'float',
            columnName: 'Units',
        },
        value: {
            type: 'float',
            columnName: 'Value',
        },
        open: {
            type: 'float',
            columnName: 'OpeningPrice',
        },
        close: {
            type: 'float',
            columnName: 'ClosingPrice',
        },
        high: {
            type: 'float',
            columnName: 'High',
        },
        low: {
            type: 'float',
            columnName: 'Low',
        },
        change: {
            type: 'string',
            columnName: 'Change',
        },
        changeValue: function () {
            return this.close - this.open;
        },
        percentageChange: function () {
            return (this.close - this.open) /this.open;
        },
        date: {
            type: 'datetime',
            columnName: 'PriceDate',
        },
        toJSON: function () {
            var obj = this.toObject();
            obj.shareId = this.shareId();
            obj.symbol = this.symbol();
            obj.changeValue = this.changeValue();
            obj.percentageChange = this.percentageChange();
            return obj;
        }
    }
};

