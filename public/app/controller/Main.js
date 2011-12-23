Ext.define('ListDemo.controller.Main', {
    extend: 'Ext.app.Controller',
    
    models: ['Bondgirl'],
    stores: ['Bondgirls'],
    views: ['Viewport', 'Home', 'Detail'],
    
    refs: [],
    
    init: function() {}
    
});
