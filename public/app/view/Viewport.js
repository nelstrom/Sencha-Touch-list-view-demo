Ext.define('ListDemo.view.Viewport', {
    extend: 'Ext.List',
    
    config: {
        fullscreen: true,
        layout: 'card',
        cardSwitchAnimation: 'slide',
        items: [
            {
                xtype: 'homepanel',
                store: 'ListDemo.store.Bondgirls'
            },
            {
                xtype: 'detailpanel'
            },
            {
                xtype : 'toolbar',
                docked: 'top',
                title: 'Bond girls'
            }
        ]
    }
});
