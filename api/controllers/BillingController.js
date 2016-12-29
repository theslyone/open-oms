module.exports = {
    getCompany: function (req, resp) {
        
    },

    getCompanyCharges: function (req, resp) {
        //http://oms.stockbroking.maxifundonline.com/Billing/GetCompanyCharges?date=2016-08-05
        var data = [{ "Id": 11, "Name": "Cloud Hosting", "Color": "\trgb(68, 151, 209)", "Amount": 15000, "CompanyId": 4, "CompanyName": "Stock Broking Firm" }, { "Id": 12, "Name": "Database Management", "Color": "rgb(222, 166, 56)", "Amount": 10000, "CompanyId": 4, "CompanyName": "Stock Broking Firm" }, { "Id": 13, "Name": "Domain Name", "Color": "rgb(119, 155, 62)", "Amount": 700, "CompanyId": 4, "CompanyName": "Stock Broking Firm" }, { "Id": 0, "Name": "0.3% Service Charge", "Color": "rgb(192, 66, 44)", "Amount": 0, "CompanyId": 0, "CompanyName": null }];
        return resp.json(data);
    },    
};