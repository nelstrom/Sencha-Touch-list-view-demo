Ext.ns('sink', 'demos', 'Ext.ux');
Ext.setup({
    onReady: function() {

        demos.simpleList = new Ext.List({
            xtype: 'list',
            store: demos.ListStore,
            itemTpl: '<div class="contact">{firstName} {lastName}</div>'
        });

        demos.groupedList = new Ext.List({
            store: demos.ListStore,
            itemTpl: '<div class="contact">{firstName} {lastName}</div>',
            grouped: true,
            indexBar: true
        });

        demos.disclosureList = new Ext.List({
            onItemDisclosure: function(record, btn, index) {
                Ext.Msg.alert('Tap', 'Disclose more info for ' + record.get('firstName'), Ext.emptyFn);
            },
            store: demos.ListStore,
            itemTpl: '<div class="contact">{firstName} {lastName}</div>'
        });

        demos.List = new Ext.TabPanel ({
            fullscreen: true,
            items: [{
                title: 'Simple',
                items: [demos.simpleList]
            }, {
                title: 'Grouped',
                items: [demos.groupedList]
            }, {
                title: 'Disclosure',
                items: [demos.disclosureList]
            }],
            defaults: {
                layout: 'fit',
                cls: 'demo-list',
            }
        });
        
        
    }
});
