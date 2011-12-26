Ext.Loader.setConfig({
    enabled: true
});

Ext.application({
    name: 'ListDemo',
    
    controllers: ['Main'],
    
    launch: function() {
        window.viewport = Ext.create('ListDemo.view.Viewport');
    }
});
