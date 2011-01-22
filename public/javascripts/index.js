ListDemo = new Ext.Application({
    name: "ListDemo",

    launch: function() {

        ListDemo.detailToolbar = new Ext.Toolbar({
            items: [{
                text: 'back',
                ui: 'back',
                handler: function() {
                    ListDemo.Viewport.setActiveItem('listwrapper', {type:'slide', direction:'right'});
                }
            }]
        });

        ListDemo.detailPanel = new Ext.Panel({
            id: 'detailpanel',
            tpl: 'Hello, {firstName}!',
            dockedItems: [ListDemo.detailToolbar]
        });

        ListDemo.listPanel = new Ext.List({
            id: 'indexlist',
            store: ListDemo.ListStore,
            itemTpl: '<div class="contact">{firstName} {lastName}</div>',
            grouped: true,
            onItemDisclosure: function(record) {
                var name = record.data.firstName + " " + record.data.lastName;
                ListDemo.detailToolbar.setTitle(name);
                ListDemo.detailPanel.update(record.data);
                ListDemo.Viewport.setActiveItem('detailpanel');
            }
        });

        ListDemo.listWrapper = new Ext.Panel({
            id: 'listwrapper',
            layout: 'fit',
            items: [ListDemo.listPanel],
            dockedItems: [{
                xtype: 'toolbar',
                title: 'Bond girls'
            }]
        });

        ListDemo.Viewport = new Ext.Panel ({
            fullscreen: true,
            layout: 'card',
            cardSwitchAnimation: 'slide',
            items: [ListDemo.listWrapper, ListDemo.detailPanel]
        });

    }
});


