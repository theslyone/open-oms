module.exports = {
    connection: 'sqlserverARM',
    tableName: 'VoucherTypes',

    attributes: {
        id: {
            type: 'integer',
            columnName: 'Id',
            primaryKey: true,
        },
    }
};
