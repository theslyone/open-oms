module.exports = {
    connection: 'sqlserverARM',
    tableName: 'AccountLedgers',

    attributes: {
        id: {
            type: 'integer',
            columnName: 'Id',
            primaryKey: true,
        },
        accountGroupId: {
            model: 'accountgroup',
            columnName: 'AccountGroupId',
        },
        accountCode: {
            type: 'string',
            columnName: 'AccountCode',
        },
    },
    getByClientCode: function(clientId, callback) {
        //var formatClientCode = clientId.indexOf("client_") ? clientId : "client_" + clientId;
        var formatClientCode = "client_" + clientId;
        AccountLedger.findOne({ accountGroupId: 26, accountCode: formatClientCode })
            .then(function(clientAccountLedger) {
                //TODO: ensure that clientAccountLedger exists, else create one here
                callback(clientAccountLedger);
            }).catch(function(err) {
                sails.log.error(err);
                callback(null);
            });
    }
};
