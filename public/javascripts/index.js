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
            onItemDisclosure: function(record, btn, index) {
                Ext.Msg.alert('Tap', 'Disclose more info for ' + record.get('firstName'), Ext.emptyFn);
            },
            store: ListDemo.ListStore,
            itemTpl: '<div class="contact">{firstName} {lastName}</div>'
        });

        ListDemo.List = new Ext.TabPanel ({
            fullscreen: true,
            items: [{
                title: 'Simple',
                items: [ListDemo.simpleList]
            }, {
                title: 'Grouped',
                items: [ListDemo.groupedList]
            }, {
                title: 'Disclosure',
                items: [ListDemo.disclosureList]
            }],
            defaults: {
                layout: 'fit',
                cls: 'demo-list',
            }
        });
    }
});

