Ext.define('ListDemo.view.List', {
    extend: 'Ext.List',
    xtype: 'listpanel',
    id: 'bondgirlList',
    
    config: {
        grouped: true,
        itemTpl: '{firstName} {lastName}'
    }
});
