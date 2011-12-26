Ext.define('ListDemo.view.Viewport', {
    extend: 'Ext.List',
    id: 'rootpanel',
    
    config: {
        fullscreen: true,
        layout: {
            type: 'card',
            animation: 'slide'
        },
        items: [
            {
                xtype: 'homepanel',
                store: Ext.create('ListDemo.store.Bondgirls'),
            },
            {
                xtype: 'detailpanel',
            },
            {
                xtype : 'titlebar',
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
