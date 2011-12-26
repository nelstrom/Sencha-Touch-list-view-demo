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
                tap: 'showList'
            },
            'list': {
                select: 'showDetail'
            }
        })
    },

    showList: function() {
        this.getBackButton().hide();
        this.getViewport().setActiveItem(0);
    },

    showDetail: function(dataview, record) {
        console.log(record);
        this.getViewport().setActiveItem(1);
        this.getBackButton().show();
    }

});
