
module.exports = {
    connection: 'sqlserverCMS',
    tableName: 'sysgroup',

    attributes: {        
        parentId: {
            type: 'string',
            columnName: 'sysgroup_parent_id',
        },
        name: {
            type: 'string',
            columnName: 'sysgroup_name',
        },
        //users: {
        //    collection: 'user',
        //    via: 'group'
        //},       
    }    
};