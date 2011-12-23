Ext.define('ListDemo.view.Viewport', {
    extend: 'Ext.List',
    
    config: {
        fullscreen: true,
        layout: 'card',
        cardSwitchAnimation: 'slide',
        items: [
            {
                xtype: 'homepanel',
                store: {
                    model: 'ListDemo.model.Bondgirl',
                    data: [
                        { firstName: "Domino",      lastName: "Derval" },
                        { firstName: "Elektra",     lastName: "King" },
                        { firstName: "Fiona",       lastName: "Volpe" },
                        { firstName: "Holly",       lastName: "Goodhead" },
                        { firstName: "Honey",       lastName: "Rider" },
                        { firstName: "Jill",        lastName: "Masterton" },
                        { firstName: "Kissy",       lastName: "Suzuki" },
                        { firstName: "Mary",        lastName: "Goodnight" },
                        { firstName: "Miranda",     lastName: "Frost" },
                        { firstName: "Molly",       lastName: "Warmflash" },
                        { firstName: "Paula",       lastName: "Caplan" },
                        { firstName: "Penelope",    lastName: "Smallbone" },
                        { firstName: "Plenty",      lastName: "O'Toole" },
                        { firstName: "Pussy",       lastName: "Galore" },
                        { firstName: "Strawberry",  lastName: "Fields" },
                        { firstName: "Sylvia",      lastName: "Trench" },
                        { firstName: "Tatiana",     lastName: "Romanova" },
                        { firstName: "Tilly",       lastName: "Masterton" },
                        { firstName: "Vesper",      lastName: "Lynd" },
                        { firstName: "Xenia",       lastName: "Onatopp" }
                    ]
                }
            },
            {
                xtype: 'detailpanel'
            },
            {
                xtype : 'toolbar',
                docked: 'top',
                title: 'Bond girls'
            }
        ]
    }
});
