var bcrypt = require('bcrypt-nodejs');

/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    connection: 'sqlserverCMS',
    tableName: 'sysuser',

    attributes: {
        id: {
            type: 'string',
            columnName: 'sysuser_id',
            primaryKey: true,
        },
        firstName: {
            type: 'string',
            columnName: 'sysuser_firstname',
        },
        lastName: {
            type: 'string',
            columnName: 'sysuser_surname',
        },
        userName: {
            type: 'string',
            required: true,
            unique: true,
            columnName: 'sysuser_login',
        },
        userType: {
            type: 'string',
            columnName: 'sysuser_group_id',
        },
        password: {
            type: 'string',
            required: true,
            columnName: 'sysuser_password',
        },
        //group: {
        //    model: 'usergroup'
        //},   
        fullName: function() {
            return this.firstName + ' ' + this.lastName;
        },
        isAdmin: function() {
            return this.userRole() === 'admin';
        },
        isClient: function() {
            return this.userRole() === 'client';
        },
        userRole: function() {
            switch (this.userType) {
                case '3D02EE6D-CCD9-4E61-80B0-B7374713216E':
                    return "client";
                case '8940B41A-E3A9-44F3-B564-BFD281416141':
                    return "admin";
                case '7C536B66-D292-4369-8F37-948B32229B83':
                    return "superAdmin";
                default:
                    return "client";
            }
        },
        toJSON: function() {
            var obj = this.toObject();
            obj.fullName = this.fullName();
            obj.isAdmin = this.isAdmin();
            obj.isClient = this.isClient();
            obj.role = this.userRole();
            delete obj.password;
            return obj;
        },
    },
    beforeCreate: function(user, cb) {
        var sha256 = crypto.createHash("sha256");
        sha256.update(user.password, "utf8"); //utf8 here
        user.password = sha256.digest("base64");
        cb(null, user);

        /*bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(user.password, salt, function () { }, function (err, hash) {
                if (err) {
                    console.log(err);
                    cb(err);
                } else {
                    user.password = hash;
                    cb(null, user);
                }
            });
        });*/
    }
};
