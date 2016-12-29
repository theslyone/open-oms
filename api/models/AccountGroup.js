module.exports = {
    connection: 'sqlserverARM',
    tableName: 'AccountGroups',

    attributes: {
        id: {
            type: 'integer',
            columnName: 'Id',
            primaryKey: true,
        },
        accountLedgers: {
            collection: 'accountledger',
            via: 'accountGroupId'
        },
    }
};
