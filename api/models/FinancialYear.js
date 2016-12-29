module.exports = {
    connection: 'sqlserverARM',
    tableName: 'FinancialYears',

    attributes: {
        id: {
            type: 'integer',
            columnName: 'Id',
            primaryKey: true,
        },
        fromDate: {
            type: 'datetime',
            columnName: 'FromDate',
        },
        toDate: {
            type: 'datetime',
            columnName: 'ToDate',
        },
        isCurrent: {
            type: 'boolean',
            columnName: 'IsCurrent',
        },
    }
};
