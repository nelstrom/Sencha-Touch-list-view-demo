Ext.define('ListDemo.controller.Main', {
    extend: 'Ext.app.Controller',
    
    models: ['Bondgirl'],
    views: ['Viewport', 'Home', 'Detail'],
    
    refs: [
        {
            ref: 'viewport',
            selector: '#rootpanel'
        },
        {
            ref: 'detailpanel',
            selector: '.detailpanel'
        },
        {
            ref: 'backButton',
            selector: 'button[action=back]'
        }
    ],
    
    init: function() {
        this.control({
            'button[action=back]': {
                tap: 'returnToList'
            }
        })
    },

    returnToList: function() {
        var viewport = this.getViewport();

        viewport.setActiveItem(0);
    }

});
