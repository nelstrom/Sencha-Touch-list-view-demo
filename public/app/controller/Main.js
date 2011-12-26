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
            selector: '#bondgirlDetail'
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
        this.getViewport().setActiveItem('bondgirlList');
    },

    showDetail: function(dataview, record) {
        var detail = this.getDetailpanel();
        console.log(record);

        detail.setData(record.data);
        this.getViewport().setActiveItem('bondgirlDetail');
        this.getBackButton().show();
    }

});
