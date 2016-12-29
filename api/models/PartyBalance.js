module.exports = {
    connection: 'sqlserverARM',
    tableName: 'PartyBalances',

    attributes: {
        id: {
            type: 'integer',
            columnName: 'Id',
            primaryKey: true,
        },
        accountLedgerId: {
            model: 'accountledger',
            columnName: 'AccountLedgerId',
        },
        voucherTypeId: {
            model: 'vouchertype',
            columnName: 'VoucherTypeId',
        },
        financialYearId: {
            model: 'financialyear',
            columnName: 'FinancialYearId',
        },
        voucherNo: {
            type: 'string',
            columnName: 'VoucherNo',
        },
        invoiceNo: {
            type: 'string',
            columnName: 'InvoiceNo',
        },
        credit: {
            type: 'float',
            columnName: 'Credit',
        },
        debit: {
            type: 'float',
            columnName: 'Debit',
        },
        date: {
            type: 'datetime',
            columnName: 'Date',
        },
    },
    getClientBalance: function(clientId, fromDate, toDate, callback) {
        var balance = 0;
        var query;
        AccountLedger.getByClientCode(clientId, function(clientAccountLedger) {
            if (clientAccountLedger != null) {
                //sails.log("Client account ledger: " + JSON.stringify(clientAccountLedger, null, 4));

                if (fromDate != undefined && toDate != undefined) {
                    query = PartyBalance.find({
                        accountLedgerId: clientAccountLedger.id,
                        date: { '>': fromDate, '<': toDate }
                    });

                } else {
                    query = PartyBalance.find({
                        accountLedgerId: clientAccountLedger.id
                    });
                }
                query.then(function(balances) {
                    //sails.log("balances: " + JSON.stringify(balances, null, 4));
                    var creditbalance = 0, debitbalance = 0;
                    try {
                        var creditbalance = balances.reduce(function (a, b) {
                            return { x: a.credit + b.credit };
                        }).credit;
                        //sails.log("credit balance: " + creditbalance);
                        var debitbalance = balances.reduce(function (a, b) {
                            return { x: a.debit + b.debit };
                        }).debit;
                        //sails.log("debit balance: " + debitbalance);
                    }
                    catch (err) {

                    }
                    callback(creditbalance - debitbalance);
                }).catch(function(err) {
                    sails.log.error(err);
                    callback(0);
                });
            } else {
                sails.log.warn("Client account ledger not found");
                callback(0);
            }
        });

    }
};
