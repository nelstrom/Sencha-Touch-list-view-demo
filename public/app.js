Ext.Loader.setConfig({
    enabled: true
});

Ext.application({
    name: 'ListDemo',
    
    controllers: ['Main'],
    
    launch: function() {
        Ext.create('ListDemo.view.Viewport');
    }
});
