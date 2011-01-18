ListDemo = new Ext.Application({
    name: "ListDemo",

    launch: function() {

        ListDemo.detailPanel = new Ext.Panel({
            id: 'detailpanel',
            tpl: 'Hello, world!'
        });

        ListDemo.listPanel = new Ext.List({
            store: ListDemo.ListStore,
            itemTpl: '<div class="contact">{firstName} {lastName}</div>',
            grouped: true,
            onItemDisclosure: function() {
                ListDemo.detailPanel.update();
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


