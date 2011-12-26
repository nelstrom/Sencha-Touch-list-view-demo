Ext.define('ListDemo.view.Home', {
    extend: 'Ext.List',
    xtype: 'homepanel',
    id: 'bondgirlList',
    
    config: {
        title: 'Home',
        grouped: true,
        itemTpl: '{firstName} {lastName}'
    }
});
