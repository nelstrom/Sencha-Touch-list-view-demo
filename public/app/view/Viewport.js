Ext.define('ListDemo.view.Viewport', {
    extend: 'Ext.TabPanel',
    
    config: {
        fullscreen: true,
        tabBarPosition: 'bottom',
        
        items: [
            {
                xtype: 'homepanel'
            }
        ]
    }
});
