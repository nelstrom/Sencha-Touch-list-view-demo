ListDemo = new Ext.Application({
    name: "ListDemo",

    launch: function() {

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
            cardSwitchAnimation: 'slide',
            items: [ListDemo.disclosureList, ListDemo.detailPanel],
            beforecardswitch: function(newCard, oldCard, index, animated) {
                if (index === 1) {
                    ListDemo.Viewport.cardSwitchAnimation.direction = 'right';
                } else {
                    ListDemo.Viewport.cardSwitchAnimation.direction = 'left';
                }
                return true;
            }
        });
    }
});

