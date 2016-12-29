/**
 * Client.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    connection: 'sqlserverCRM',
    tableName: "Clients",

    attributes: {
        id: {
            type: 'integer',
            columnName: 'Id',
            primaryKey: true,
        },
        firstName: {
            type: 'string',
            defaultsTo: '',
            columnName: 'FirstName',
        },
        middleName: {
            type: 'string',
            defaultsTo: '',
            columnName: 'MiddleName',
        },
        lastName: {
            type: 'string',
            defaultsTo: '',
            columnName: 'LastName',
        },
        fullName: function() {
            return this.lastName + " " + this.firstName;
        },
        phoneNumber: {
            type: 'string',
            defaultsTo: '',
            columnName: 'PhoneNumber',
        },
        gender: {
            type: 'integer',
            defaultsTo: 0,
            columnName: 'Gender',
        },
        email: {
            type: 'email',
            defaultsTo: '',
            columnName: 'Email',
            unique: true,
        },
        cscsNumber: {
            type: 'string',
            defaultsTo: '',
            unique: true,
            columnName: 'CSCSNumber',

        },
        chnNumber: {
            type: 'string',
            defaultsTo: '',
            unique: true,
            columnName: 'CHNumber',

        },
        portalName: {
            type: 'string',
            defaultsTo: this.chnNumber,
            columnName: 'PortalName',
        },
        subscriptionId: {
            type: 'string',
            defaultsTo: '',
            unique: true,
            columnName: 'SubscriptionId',

        },
        orderBooks: {
            collection: 'orderbook',
            via: 'client'
        },
        // Override the default toJSON method
        toJSON: function() {
            var obj = this.toObject();
            obj.fullName = this.fullName();
            return obj;
        }
    }
};
