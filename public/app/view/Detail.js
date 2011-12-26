Ext.define('ListDemo.view.Detail', {
    extend: 'Ext.Panel',
    xtype: 'detailpanel',
    id: 'bondgirlDetail',

    config: {
        styleHtmlContent: true,
        tpl: [
            'Hello {firstName}!'
        ]
    }
});
