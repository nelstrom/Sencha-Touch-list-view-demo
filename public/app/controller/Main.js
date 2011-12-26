Ext.define('ListDemo.controller.Main', {
    extend: 'Ext.app.Controller',
    
    models: ['Bondgirl'],
    views: ['Viewport', 'Home', 'Detail'],
    
    refs: [
        {
            ref: 'viewport',
            selector: '.viewport'
        },
        {
            ref: 'detailpanel',
            selector: '.detailpanel'
        },
        {
            ref: 'backButton',
            selector: '.detailpanel'
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
        this.getViewport().setActiveItem(0);
        console.log('asdf');
    }

});
