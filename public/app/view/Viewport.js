Ext.define('ListDemo.view.Viewport', {
    extend: 'Ext.List',
    id: 'rootpanel',
    
    config: {
        fullscreen: true,
        layout: 'card',
        animation: 'slide',
        items: [
            {
                xtype: 'homepanel',
                store: Ext.create('ListDemo.store.Bondgirls'),
            },
            {
                xtype: 'detailpanel',
            },
            {
                xtype : 'toolbar',
                docked: 'top',
                title: 'Bond girls',
                items: [
                    {
                        text: 'back',
                        ui: 'back',
                        action: 'back',
                        hidden: true
                    }
                ]
            }
        ]
    }
});
