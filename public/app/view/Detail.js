Ext.define('ListDemo.view.Detail', {
    extend: 'Ext.Panel',
    xtype: 'detailpanel',
    id: 'bondgirlDetail',

    config: {
        tpl: [
            'Hello {firstName}!'
        ]
    }
});
