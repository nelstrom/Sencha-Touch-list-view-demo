Ext.define('ListDemo.view.Home', {
    extend: 'Ext.Panel',
    xtype: 'homepanel',
    
    config: {
        title: 'Home',
        iconCls: 'home',
        cls: 'home',
        html: [
            '<img src="http://staging.sencha.com/img/sencha.png" />',
            '<h1>Welcome to Sencha</h1>',
            "<p>We make awesome web application frameworks including Ext JS ",
            "and Sencha Touch</p>",
            '<h2>Sencha Touch (2.0.0pr1)</h2>'
        ].join("")
    }
});
