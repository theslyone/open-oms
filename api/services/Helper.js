module.exports = {

    isEmpty: function(obj) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop))
                return false;
        }
        return true;
    },

    side: {
        buy: 1,
        sell: 2
    },

    mandateState: {
        pending: 0,
        aoReview: 1,
        aoApproved: 2,
        approved: 3,
        traded: 4,
        closed: 5,
        error: 6,
        frozen: 7,
    },

    stockState: {
        processing: 1,
        processed: 2,
        verified: 3,
        complete: 4,
    },

    mandateType: {
        buy: 1,
        sell: 2,
    },

    timeInForce: {
        day: 1,
        goodTillCancel: 4,
    }



};
