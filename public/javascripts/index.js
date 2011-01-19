ListDemo = new Ext.Application({
    name: "ListDemo",

    launch: function() {

        ListDemo.detailPanel = new Ext.Panel({
            id: 'detailpanel',
            tpl: 'Hello, {firstName}!',
            dockedItems: [{
                xtype: 'toolbar',
                items: [{
                    text: 'back',
                    ui: 'back',
                    handler: function() {
                        ListDemo.Viewport.setActiveItem('indexlist');
                    }
                }]
            }]
        });

        ListDemo.listPanel = new Ext.List({
            id: 'indexlist',
            store: ListDemo.ListStore,
            itemTpl: '<div class="contact">{firstName} {lastName}</div>',
            grouped: true,
            onItemDisclosure: function(record, btn, index) {
                ListDemo.detailPanel.update(record.data);
                ListDemo.Viewport.setActiveItem('detailpanel');
            }
        });

        ListDemo.Viewport = new Ext.Panel ({
            fullscreen: true,
            layout: 'card',
            items: [ListDemo.listPanel, ListDemo.detailPanel]
        });

    }
});


