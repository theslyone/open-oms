module.exports = {
    sides: function (req, resp) {
        return resp.json([{ value: 1, text: "Buy" }, { value: 2, text: "Sell" }]);
    },
    orderTypes: function (req, resp) {
        return resp.json([{ value: 1, text: "Market" }, { value: 2, text: "Limit" }]);
    },
    orderStatus: function (req, resp) {
        var data = [
            { value: 'A', text: "Pending New" },
            { value: '0', text: "New" },
            { value: '1', text: "Partially Filled" },
            { value: '2', text: "Filled" },
            { value: '4', text: "Canceled" },
            { value: '5', text: "Replaced" },
            { value: '8', text: "Rejected" },
            { value: '9', text: "Suspended" },
            { value: 'B', text: "Calculated" },
            { value: 'C', text: "Expired" },
            { value: 'D', text: "Accepted For Bidding" },
            { value: '3', text: "Done For Day" },
            { value: '6', text: "Pending Cancel" },
            { value: '6', text: "Pending Cancel Replace" },
            { value: 'E', text: "Pending Replace" },
            { value: '7', text: "Stopped" }];
        return resp.json(data);
    },
    execTypes: function (req, resp) {
        var data = [
            { value: 'B', text: 'Calculated' },
            { value: '3', text: 'Done For Day' },
            { value: 'C', text: 'Expired' },
            { value: '2', text: 'Fill' },
            { value: '0', text: 'New' },
            { value: 'I', text: 'Order Status' },
            { value: '1', text: 'Partially Filled' },
            { value: '6', text: 'Pending Cancel' },
            { value: '6', text: 'Pending Cancel Replace' },
            { value: 'A', text: 'Pending New' },
            { value: '8', text: 'Rejected' },
            { value: '5', text: 'Replaced' },
            { value: 'D', text: 'Restated' },
            { value: '6', text: 'Pending Cancel' },
            { value: '7', text: 'Stopped' },
            { value: '9', text: 'Suspended' },
            { value: 'F', text: 'Trade' },
            { value: 'H', text: 'Trade Cancel' },
            { value: 'G', text: 'Trade Correct' },
            { value: 'K', text: 'Trade Released To Clearing' },
            { value: 'J', text: 'Trade In Clearing Hold' },
            { value: 'L', text: 'Triggered Or Activated By System' }];
        return resp.json(data);
    }
};