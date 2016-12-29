module.exports = {
    connection: 'sqlserverCRM',
    tableName: 'MandateRequests',

    attributes: {
        id: {
            type: 'integer',
            columnName: 'Id',
            primaryKey: true,
        },
        shareId: {
            model: 'stock',
            columnName: 'ShareId',
        },
        clientId: {
            model: 'client',
            columnName: 'clientId',
        },
        state: {
            type: 'integer',
            columnName: 'State',
            //enum: ['pending', 'approved', 'denied']
        },
        type: {
            type: 'integer',
            columnName: 'Type',
            //enum: ['pending', 'approved', 'denied']
        },
    }
};
