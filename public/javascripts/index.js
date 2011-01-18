ListDemo = new Ext.Application({
    name: "ListDemo",

    launch: function() {

        ListDemo.listPanel = new Ext.List({
            id: 'disclosurelist',
            store: ListDemo.ListStore,
            itemTpl: '<div class="contact">{firstName} {lastName}</div>',
            grouped: true
        });

        ListDemo.Viewport = new Ext.Panel ({
            fullscreen: true,
            items: [ListDemo.listPanel]
        });
    }
});


