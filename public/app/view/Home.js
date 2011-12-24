Ext.define('ListDemo.view.Home', {
    extend: 'Ext.List',
    xtype: 'homepanel',
    
    config: {
        title: 'Home',
        grouped: true,
        itemTpl: '{firstName} {lastName}'
    }
});
