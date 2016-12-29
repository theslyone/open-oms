/**
 * TradeController
 *
 * @description :: Server-side logic for managing trades
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    readByMonth: function (req, resp, date) {
        var data = { "Data": [], "Total": 0, "AggregateResults": null, "Errors": null };
        return resp.json(data);
    },
};

