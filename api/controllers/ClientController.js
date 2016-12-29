var fs = require("fs");
var path = require('path');

module.exports = {

    getCurrent: function(req, res) {
        //sails.log("Current user: " + JSON.stringify(req.session.user, null, 4));
        if (req.session.currentClient == undefined && req.session.user !== undefined /* && req.session.user.isClient*/ ) {

            Client.findOne({ 'portalName': req.session.user.userName })
                .then(function(client) {
                    if (client !== undefined) {
                        req.session.currentClient = client;
                        //sails.log("Current client set to: " + JSON.stringify(client, null, 4));
                        PartyBalance.getClientBalance(client.id, null, null, function(balance) {
                            return res.json({ client: client, accountBalance: balance });
                        });
                    } else {
                        sails.log("Current client with cscs number " + req.session.user.userName + " not found");
                        return res.json({ client: {}, accountBalance: 0 });
                    }
                })
                .catch(function(err) {
                    return res.serverError("Failed to retrieve client details from server.");
                });
        } else {
            var currentClient = req.session.currentClient;
            if (currentClient !== undefined) {
                PartyBalance.getClientBalance(currentClient.id, null, null, function(balance) {
                    return res.json({ client: currentClient, accountBalance: balance });
                });
            } else
                return res.json({ client: {}, accountBalance: 0 });
        }
    },

    setCurrent: function(req, res) {
        var clientId = req.query.id;
        if (clientId !== undefined) {
            Client.findOne({ 'id': clientId }).exec(function(err, client) {
                if (err) {
                    sails.error("Server error setting current client: " + err);
                    return res.serverError(err);
                }

                //sails.log(JSON.stringify(client, null, 4));
                req.session.currentClient = client;
                PartyBalance.getClientBalance(client.id, null, null, function(balance) {
                    return res.json({ client: client, accountBalance: balance });
                });
            });
        } else {
            return res.serverError(err);
        }
    },    

    showPhoto: function(req, res) {
        var clientId = req.query.id;
        //var rootPath = path.dirname(module.parent.filename);
        var rootPath = "C:/Users/thesl/Documents/Visual Studio 2015/Projects/OpenOMS/OpenOMS";
        Client.findOne({ id: clientId })
            .then(function(client) {
                if (client !== undefined) {
                    var picturePath = path.join(rootPath, "images/passport_" + clientId);
                    sails.log("Picture path: " + picturePath);

                    path.exists(picturePath, function(exists) {
                        if (exists) {
                            // do something 
                        } else {
                            var img = fs.readFileSync(path.join(rootPath, '.tmp/public/images/pic_male.png'));
                            if (client.gender == 0) {
                                img = fs.readFileSync(path.join(rootPath, '.tmp/public/images/pic_male.png'));
                            } else if (client.gender == 1) {
                                img = fs.readFileSync(path.join(rootPath, '.tmp/public/images/pic_female.png'));
                            }
                            res.writeHead(200, { 'Content-Type': 'image/png' });
                            res.end(img, 'binary');
                        }
                    });
                } else {
                    //var img = fs.readFileSync(path.join(rootPath, '.tmp/public/images/pic_male.png'));
                    var img = fs.readFileSync(rootPath + '/.tmp/public/images/pic_male.png');
                    res.writeHead(200, { 'Content-Type': 'image/png' });
                    res.end(img, 'binary');
                }
            });

    }

};
