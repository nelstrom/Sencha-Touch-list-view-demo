ListDemo = new Ext.Application({
    name: "ListDemo",

    launch: function() {

        ListDemo.simpleList = new Ext.List({
            xtype: 'list',
            store: ListDemo.ListStore,
            itemTpl: '<div class="contact">{firstName} {lastName}</div>'
        });

        ListDemo.groupedList = new Ext.List({
            store: ListDemo.ListStore,
            itemTpl: '<div class="contact">{firstName} {lastName}</div>',
            grouped: true,
            indexBar: true
        });

        ListDemo.disclosureList = new Ext.List({
            id: 'disclosurelist',
            onItemDisclosure: function(record, btn, index) {
                ListDemo.detailPanel.update(record.data);
                ListDemo.Viewport.setActiveItem('detailpanel');
            },
            store: ListDemo.ListStore,
            itemTpl: '<div class="contact">{firstName} {lastName}</div>'
        });

        ListDemo.detailPanel = new Ext.Panel({
            id: 'detailpanel',
            tpl: 'Hello, {firstName}!',
            dockedItems: [
                {
                    xtype: 'toolbar',
                    items: [{
                        text: 'back',
                        ui: 'back',
                        handler: function() {
                            ListDemo.Viewport.setActiveItem('disclosurelist');
                        }
                    }]
                }
            ]
        });

        ListDemo.Viewport = new Ext.Panel ({
            fullscreen: true,
            layout: 'card',
            cardSwitchAnimation: {
                type: 'slide',
                direction: ListDemo.Viewport.getActiveItem().id == 'disclosurelist' ? 'left' : 'right'
            },
            items: [ListDemo.disclosureList, ListDemo.detailPanel]
        });
    }
});

