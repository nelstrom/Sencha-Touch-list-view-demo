Ext.application({
    name: "ListDemo",

    launch: function() {
        var detailPanel, listPanel, Viewport;

        detailPanel = new Ext.Panel({
            id: 'detailpanel',
            tpl: 'Hello, {firstName}!',
            scrollable: true,
            items: [
                {
                    xtype: 'toolbar',
                    docked: 'top',
                    title: 'details',
                    items: [{
                        text: 'back',
                        ui: 'back',
                        handler: function() {
                            Viewport.setActiveItem('disclosurelist', {type:'slide', direction:'right'});
                        }
                    }]
                }
            ]
        });

        listPanel = new Ext.List({
            id: 'disclosurelist',
            store: ListDemo.ListStore,
            itemTpl: '<div class="contact">{firstName} {lastName}</div>',
            grouped: true,
            onItemDisclosure: function(record, btn, index) {
                detailPanel.setData(record.data);
                Viewport.setActiveItem('detailpanel');
            }
        });

        Viewport = new Ext.Panel ({
            fullscreen: true,
            layout: 'card',
            cardSwitchAnimation: 'slide',
            items: [
                listPanel,
                detailPanel,
                {
                    xtype : 'toolbar',
                    docked: 'top',
                    title: 'Bond girls'
                }
            ]
        });

    }
});


