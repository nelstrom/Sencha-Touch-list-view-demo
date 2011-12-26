Ext.define('ListDemo.view.Viewport', {
    extend: 'Ext.List',
    id: 'rootpanel',
    
    config: {
        fullscreen: true,
        layout: 'card',
        cardSwitchAnimation: 'slide',
        items: [
            {
                xtype: 'homepanel',
                id: 'bondgirlsList',
                store: Ext.create('ListDemo.store.Bondgirls'),
            },
            {
                xtype: 'detailpanel',
                id: 'bondgirlDetail'
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
