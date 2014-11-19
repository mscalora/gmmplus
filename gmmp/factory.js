
var settings_defaults = {
    elastic_mode_indicator: true,
    elastic_mode_default: true,
    hide_search: true,
    focus_surface: false,
    telemetry: true,
    macros: []
};

var factory_default_macros = [
    {
        "addEditMode": true,
        "focusInText": false,
        "keyCode": 13,
        "modifiers": "",
        "name": "Save/OK/Done",
        "otherMode": true,
        "passThrough": false,
        "steps": [
            [ "save_next_done", null ]
        ]
    },
    {
        "addEditMode": true,
        "focusInText": false,
        "keyCode": 106,
        "modifiers": "",
        "name": "Toggle Elastic Mode",
        "otherMode": true,
        "passThrough": false,
        "steps": [
            [ "toggle_elastic_mode", null ]
        ]
    },
    {
        "addEditMode": true,
        "focusInText": false,
        "keyCode": 192,
        "modifiers": "",
        "name": "Toggle Elastic Mode",
        "otherMode": true,
        "passThrough": false,
        "steps": [
            [ "toggle_elastic_mode", null ]
        ]
    },
    {
        "addEditMode": false,
        "focusInText": false,
        "keyCode": 110,
        "modifiers": "",
        "name": "Browse Intersections",
        "otherMode": true,
        "passThrough": false,
        "steps": [
            [ "browse_line_features", "Intersection" ]
        ]
    },
    {
        "addEditMode": false,
        "focusInText": false,
        "keyCode": 190,
        "modifiers": "",
        "name": "Browse Intersections",
        "otherMode": true,
        "passThrough": false,
        "steps": [
            [ "browse_line_features", "Intersection" ]
        ]
    },
    {
        "addEditMode": false,
        "focusInText": false,
        "keyCode": 96,
        "modifiers": "",
        "name": "Browse Roads",
        "otherMode": true,
        "passThrough": false,
        "steps": [
            [ "browse_line_features", "Road" ]
        ]
    },
    {
        "addEditMode": false,
        "focusInText": false,
        "keyCode": 188,
        "modifiers": "",
        "name": "Browse Road",
        "otherMode": true,
        "passThrough": false,
        "steps": [
            [ "browse_line_features", "Road" ]
        ]
    },
    {
        "addEditMode": false,
        "focusInText": false,
        "keyCode": 130,
        "modifiers": "",
        "name": "Add Road",
        "otherMode": true,
        "passThrough": false,
        "steps": [
            [ "add_line_feature", "Road" ]
        ]
    },
    {
        "addEditMode": false,
        "focusInText": false,
        "keyCode": 129,
        "modifiers": "",
        "name": "Add Trail",
        "otherMode": true,
        "passThrough": false,
        "steps": [
            [ "add_line_feature", "Trail" ]
        ]
    },
    {
        "addEditMode": false,
        "focusInText": false,
        "keyCode": 127,
        "modifiers": "",
        "name": "Add Gas Station",
        "otherMode": true,
        "passThrough": false,
        "steps": [
            [ "add_place_feature", "Gas Station" ]
        ]
    },
    {
        "addEditMode": false,
        "focusInText": false,
        "keyCode": 191,
        "modifiers": "",
        "name": "Add Restaurant",
        "otherMode": true,
        "passThrough": false,
        "steps": [
            [ "add_place_feature", "Restaurant" ]
        ]
    },
    {
        "addEditMode": true,
        "focusInText": true,
        "keyCode": 99,
        "modifiers": "",
        "name": "Terminal Unpaved 30/1",
        "otherMode": false,
        "passThrough": false,
        "steps": [
            [ "priority", "Terminal road" ],
            [ "lane", "1" ],
            [ "avg_speed", "30" ],
            [ "surface", "Unpaved" ]
        ]
    },
    {
        "addEditMode": true,
        "focusInText": true,
        "keyCode": 98,
        "modifiers": "",
        "name": "Terminal Unpaved 30/2",
        "otherMode": false,
        "passThrough": false,
        "steps": [
            [ "priority", "Terminal road" ],
            [ "lane", "2" ],
            [ "avg_speed", "30" ],
            [ "surface", "Unpaved" ]
        ]
    },
    {
        "addEditMode": true,
        "focusInText": true,
        "keyCode": 97,
        "modifiers": "",
        "name": "Terminal Unpaved 30/4",
        "otherMode": false,
        "passThrough": false,
        "steps": [
            [ "priority", "Terminal road" ],
            [ "lane", "4" ],
            [ "avg_speed", "30" ],
            [ "surface", "Unpaved" ]
        ]
    },
    {
        "addEditMode": true,
        "focusInText": true,
        "keyCode": 102,
        "modifiers": "",
        "name": "Local Unpaved 30/1",
        "otherMode": false,
        "passThrough": false,
        "steps": [
            [ "priority", "Local road" ],
            [ "lane", "1" ],
            [ "avg_speed", "30" ],
            [ "surface", "Unpaved" ]
        ]
    },
    {
        "addEditMode": true,
        "focusInText": true,
        "keyCode": 101,
        "modifiers": "",
        "name": "Local Unpaved 30/2",
        "otherMode": false,
        "passThrough": false,
        "steps": [
            [ "priority", "Local road" ],
            [ "lane", "2" ],
            [ "avg_speed", "30" ],
            [ "surface", "Unpaved" ]
        ]
    },
    {
        "addEditMode": true,
        "focusInText": true,
        "keyCode": 100,
        "modifiers": "",
        "name": "Local Unpaved 30/4",
        "otherMode": false,
        "passThrough": false,
        "steps": [
            [ "priority", "Local road" ],
            [ "lane", "4" ],
            [ "avg_speed", "30" ],
            [ "surface", "Unpaved" ]
        ]
    },
    {
        "addEditMode": true,
        "focusInText": true,
        "keyCode": 105,
        "modifiers": "",
        "name": "Local Unpaved 50/1",
        "otherMode": false,
        "passThrough": false,
        "steps": [
            [ "priority", "Local road" ],
            [ "lane", "1" ],
            [ "avg_speed", "50" ],
            [ "surface", "Unpaved" ]
        ]
    },
    {
        "addEditMode": true,
        "focusInText": true,
        "keyCode": 104,
        "modifiers": "",
        "name": "Local Unpaved 50/2",
        "otherMode": false,
        "passThrough": false,
        "steps": [
            [ "priority", "Local road" ],
            [ "lane", "2" ],
            [ "avg_speed", "50" ],
            [ "surface", "Unpaved" ]
        ]
    },
    {
        "addEditMode": true,
        "focusInText": true,
        "keyCode": 103,
        "modifiers": "",
        "name": "Local Unpaved 50/4",
        "otherMode": false,
        "passThrough": false,
        "steps": [
            [ "priority", "Local road" ],
            [ "lane", "4" ],
            [ "avg_speed", "50" ],
            [ "surface", "Unpaved" ]
        ]
    }
];
