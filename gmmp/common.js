var platform = null;

var debug = !!localStorage.gmmp_debug;
var d = debug ? console : { log: function(){} };
d.alert = debug ? function(s){ alert(s); } : function(s){ };
d.event = function(){};

function common_init() {
    if (navigator.appVersion.indexOf("Win")!=-1) platform="win";
    if (navigator.appVersion.indexOf("Mac")!=-1) platform="mac";
    if (navigator.appVersion.indexOf("X11")!=-1) platform="unix";
    if (navigator.appVersion.indexOf("Linux")!=-1) platform="unix";

    $('html')
        .toggleClass('gmmp-win',platform=="win")
        .toggleClass('gmmp-unix',platform=="unix")
        .toggleClass('gmmp-mac',platform=="mac");
}

common_init();

var KeyNames = {
    0: "context menu",
    8: "backspace",
    9: "tab",
    12: "numpad clear",
    13: "enter",
    16: "shift",
    17: "ctrl",
    18: "alt",
    19: "pause/break",
    20: "caps lock",
    27: "escape",
    32: "space",
    33: "page up",
    34: "page down",
    35: "end",
    36: "home",
    37: "left arrow",
    38: "up arrow",
    39: "right arrow",
    40: "down arrow",
    45: "insert",
    46: "delete",
    48: "0",
    49: "1",
    50: "2",
    51: "3",
    52: "4",
    53: "5",
    54: "6",
    55: "7",
    56: "8",
    57: "9",
    65: "a",
    66: "b",
    67: "c",
    68: "d",
    69: "e",
    70: "f",
    71: "g",
    72: "h",
    73: "i",
    74: "j",
    75: "k",
    76: "l",
    77: "m",
    78: "n",
    79: "o",
    80: "p",
    81: "q",
    82: "r",
    83: "s",
    84: "t",
    85: "u",
    86: "v",
    87: "w",
    88: "x",
    89: "y",
    90: "z",
    91: "left cmd/win",
    92: "win",
    93: "right cmd/win",
    96: "numpad 0",
    97: "numpad 1",
    98: "numpad 2",
    99: "numpad 3",
    100: "numpad 4",
    101: "numpad 5",
    102: "numpad 6",
    103: "numpad 7",
    104: "numpad 8",
    105: "numpad 9",
    106: "numpad *",
    107: "numpad +",
    109: "numpad -",
    110: "numpad period",
    111: "numpad /",
    112: "f1",
    113: "f2",
    114: "f3",
    115: "f4",
    116: "f5",
    117: "f6",
    118: "f7",
    119: "f8",
    120: "f9",
    121: "f10",
    122: "f11",
    123: "f12",
    124: "f13",
    125: "f14",
    126: "f15",
    127: "f16",
    128: "f17",
    129: "f18",
    130: "f19",
    144: "num lock",
    145: "scroll lock",
    186: "semi-colon",
    187: "equal sign",
    188: "comma",
    189: "dash",
    190: "period",
    191: "forward slash",
    192: "grave accent",
    219: "open bracket",
    220: "back slash",
    221: "close bracket",
    222: "single quote"
};

var KeyCodes = {
    WIN_FF_LINUX:   0,
    MAC_ENTER:      3,
    BACKSPACE:      8,
    TAB:            9,
    NUM_CLEAR:     12,   // NUMLOCK on FF/Safari Mac
    ENTER:         13,
    SHIFT:         16,
    CTRL:          17,
    ALT:           18,
    PAUSE:         19,
    CAPS_LOCK:     20,
    ESC:           27,
    SPACE:         32,
    PAGE_UP:       33,   // also NUM_NORTH_EAST
    PAGE_DOWN:     34,   // also NUM_SOUTH_EAST
    END:           35,   // also NUM_SOUTH_WEST
    HOME:          36,   // also NUM_NORTH_WEST
    LEFT:          37,   // also NUM_WEST
    UP:            38,   // also NUM_NORTH
    RIGHT:         39,   // also NUM_EAST
    DOWN:          40,   // also NUM_SOUTH
    PRINT_SCREEN:  44,
    INSERT:        45,   // also NUM_INSERT
    DELETE:        46,   // also NUM_DELETE
    "0":           48,
    "1":           49,
    "2":           50,
    "3":           51,
    "4":           52,
    "5":           53,
    "6":           54,
    "7":           55,
    "8":           56,
    "9":           57,
    ZERO:          48,
    ONE:           49,
    TWO:           50,
    THREE:         51,
    FOUR:          52,
    FIVE:          53,
    SIX:           54,
    SEVEN:         55,
    EIGHT:         56,
    NINE:          57,
    FF_SEMICOLON:  59,   // Firefox (Gecko) fires this for semicolon instead of 186
    FF_EQUALS:     61,   // Firefox (Gecko) fires this for equals instead of 187
    FF_DASH:      173,   // Firefox (Gecko) fires this for dash instead of 189
    QUESTION_MARK: 63,   // needs localization

    A: 65,
    B: 66,
    C: 67,
    D: 68,
    E: 69,
    F: 70,
    G: 71,
    H: 72,
    I: 73,
    J: 74,
    K: 75,
    L: 76,
    M: 77,
    N: 78,
    O: 79,
    P: 80,
    Q: 81,
    R: 82,
    S: 83,
    T: 84,
    U: 85,
    V: 86,
    W: 87,
    X: 88,
    Y: 89,
    Z: 90,

    a: 65,
    b: 66,
    c: 67,
    d: 68,
    e: 69,
    f: 70,
    g: 71,
    h: 72,
    i: 73,
    j: 74,
    k: 75,
    l: 76,
    m: 77,
    n: 78,
    o: 79,
    p: 80,
    q: 81,
    r: 82,
    s: 83,
    t: 84,
    u: 85,
    v: 86,
    w: 87,
    x: 88,
    y: 89,
    z: 90,

    META:          91,
    WIN_LEFT:      91,
    WIN_RIGHT:     92,
    CONTEXT_MENU:  93,
    NUM_ZERO:      96,
    NUM_ONE:       97,
    NUM_TWO:       98,
    NUM_THREE:     99,
    NUM_FOUR:     100,
    NUM_FIVE:     101,
    NUM_SIX:      102,
    NUM_SEVEN:    103,
    NUM_EIGHT:    104,
    NUM_NINE:     105,
    NUM_MULTIPLY: 106,
    NUM_PLUS:     107,
    NUM_MINUS:    109,
    NUM_PERIOD:   110,
    NUM_DIVISION: 111,
    F1:           112,
    F2:           113,
    F3:           114,
    F4:           115,
    F5:           116,
    F6:           117,
    F7:           118,
    F8:           119,
    F9:           120,
    F10:          121,
    F11:          122,
    F12:          123,

    F13:          124,
    F14:          125,
    F15:          126,

    F16:          127,
    F17:          128,
    F18:          129,
    F19:          130,

    NUMLOCK:              144,
    SCROLL_LOCK:          145,

    // OS-specific media keys like volume controls and browser controls.
    FIRST_MEDIA_KEY:      166,
    LAST_MEDIA_KEY:       183,

    SEMICOLON:            186, // needs localization
    DASH:                 189, // needs localization
    EQUALS:               187, // needs localization
    COMMA:                188, // needs localization
    PERIOD:               190, // needs localization
    SLASH:                191, // needs localization
    APOSTROPHE:           192, // needs localization
    TILDE:                192, // needs localization
    SINGLE_QUOTE:         222, // needs localization
    OPEN_SQUARE_BRACKET:  219, // needs localization
    BACKSLASH:            220, // needs localization
    CLOSE_SQUARE_BRACKET: 221, // needs localization
    WIN_KEY:              224,
    MAC_FF_META:          224, // Firefox (Gecko) fires this for the meta key instead of 91
    MAC_WK_CMD_LEFT:       91, // WebKit Left Command key fired, same as META
    MAC_WK_CMD_RIGHT:      93, // WebKit Right Command key fired, different from META
    WIN_IME:              229,

    // We've seen users whose machines fire this keycode at regular one
    // second intervals. The common thread among these users is that
    // they're all using Dell Inspiron laptops, so we suspect that this
    // indicates a hardware/bios problem.
    // http://en.community.dell.com/support-forums/laptop/f/3518/p/19285957/19523128.aspx
    PHANTOM:              255
};

var ModKeys = {};
ModKeys[KeyCodes.MAC_WK_CMD_LEFT] = true;
ModKeys[KeyCodes.MAC_WK_CMD_RIGHT] = true;
ModKeys[KeyCodes.SHIFT] = true;
ModKeys[KeyCodes.CTRL] = true;
ModKeys[KeyCodes.ALT] = true;
ModKeys[KeyCodes.META] = true;
ModKeys[KeyCodes.NUMLOCK] = true;
ModKeys[KeyCodes.SCROLL_LOCK] = true;
ModKeys[KeyCodes.NUMLOCK] = true;
ModKeys[KeyCodes.CONTEXT_MENU] = true;
ModKeys[KeyCodes.WIN_FF_LINUX] = true;
ModKeys[KeyCodes.WIN_KEY] = true;
ModKeys[KeyCodes.WIN_LEFT] = true;
ModKeys[KeyCodes.WIN_RIGHT] = true;

var ModSymbols = platform==='mac' ? {
    'S': '⇧', // 21E7
    'M': '⌘', // 2318
    'A': '⌥', // 229E
    'C': '⌃'
} : {
    'S': '⇧', // 21E7
    'M': '⊞', // 229E
    'A': '⎇', // 2387
    'C': '⌃'   // 2303
};

jQuery.fn.extend({
    zIndex: function( zIndex ) {
        if ( zIndex !== undefined ) {
            return this.css( "zIndex", zIndex );
        }

        if ( this.length ) {
            var elem = $( this[ 0 ] ), position, value;
            while ( elem.length && elem[ 0 ] !== document ) {
                position = elem.css( "position" );
                if ( position === "absolute" || position === "relative" || position === "fixed" ) {
                    value = parseInt( elem.css( "zIndex" ), 10 );
                    if ( !isNaN( value ) && value !== 0 ) {
                        return value;
                    }
                }
                elem = elem.parent();
            }
        }

        return 0;
    }
});

(function ($){
    var check=false, isRelative=true;

    $.elementFromPoint = function(x,y) {
        if(!document.elementFromPoint) return null;
        if(!check) {
            var sl;
            if((sl = $(document).scrollTop()) >0) {
                isRelative = (document.elementFromPoint(0, sl + $(window).height() -1) == null);
            }
            else if((sl = $(document).scrollLeft()) >0) {
                isRelative = (document.elementFromPoint(sl + $(window).width() -1, 0) == null);
            }
            check = (sl>0);
        }

        if(!isRelative) {
            x += $(document).scrollLeft();
            y += $(document).scrollTop();
        }

        return $(document.elementFromPoint(x,y));
    }

})(jQuery);

$.fn.extend({
    hrString: function() {
        var it = this.first();
        if (it.length===0) return '';
        var dom = it[0];
        var s = dom.tagName;
        s += dom.id ? '#'+dom.id : '';
        s += it.attr('class') ? '.'+it.attr('class').split(' ').join('.') : '';
        var dfid = it.attr('data-field-id');
        if (dfid) {
            s += '@'+dfid;
        }
        return s;
    },
    fullPath: function(skipBodyAndHTML) {
        if (this.length==0) return '';
        var el = this[0];
        if (!el.tagName || skipBodyAndHTML && (el.tagName==='BODY' || el.tagName==='HTML')) return '';
        return $.trim(this.parent().fullPath(skipBodyAndHTML)+' '+this.hrString());
    }
});

jQuery.extend(jQuery, {
    /* works in chrome */
    elementAtPageOffset: function(top, left) {
        return $(document.elementFromPoint(left - window.pageXOffset, top - window.pageYOffset));
    }
});

var ActionType = {
    FIELD_MENU: 'field_menu',
    FIELD_NUMERIC: 'field_numeric',
    FIELD_STRING: 'field_string',
    ACTION: 'action',
    ACTION_STRING: 'action_string'
}

var EMPTY = "- - -";
var ActionList = {
    priority: {
        text: 'Priority',
        type: 'field_menu',
        default: 'Local Road',
        values: [EMPTY,"No auto traffic","Terminal road","Local road","Minor artery","Major artery","Regional highway","National highway","Expressway","Freeway"]
    },
    "lane": {
        text: 'Lanes',
        type: 'field_numeric',
        default: '1'
    },
    "avg_speed": {
        text: 'Avg speed',
        type: 'field_numeric',
        default: '25'
    },
    "barrier": {
        text: 'Divider',
        type: 'field_menu',
        default: 'No divider',
        values: [EMPTY,"No divider","Divider present","Legal divider","Physical divider"]
    },
    "one_way": {
        text: 'Direction',
        type: 'field_menu',
        default: EMPTY,
        values: [EMPTY,"Two way","One way (A to B)","One way (B to A)"]
    },
    "elevation": {
        text: 'Elevation',
        type: 'field_menu',
        default: 'Normal',
        values: [EMPTY,"Bridge","Normal","Skyway","Stairway","Tunnel"]
    },
    "construction": {
        text: 'Construction Status',
        type: 'field_menu',
        default: EMPTY,
        values: [EMPTY,"Planned","Started","Completed","Closed for maintenance","Disturbed by maintenance"]
    },
    "condition": {
        text: 'Road Condition',
        type: 'field_menu',
        default: EMPTY,
        values: [EMPTY,"Good","Bad"]
    },
    "surface": {
        text: 'Surface type',
        type: 'field_menu',
        default: 'Asphalt',
        values: [EMPTY,"Paved","Unpaved","Asphalt","Concrete","Chipseal","Brick","Sett","Cobblestone","Gravel","Dirt","Sand"]
    },
    "road_access": {
        text: 'Road access',
        type: 'field_menu',
        default: 'Public',
        values: [EMPTY,"Public","Private"]
    },
    "segment_usage_traffic": {
        text: 'Segment Usage',
        type: 'field_menu',
        default: EMPTY,
        values: [EMPTY,"Ramp","Special Traffic Figure","Enclosed traffic area / Parking lot","Pedestrian mall (Car free zone)","Turn segment","Entrance ramp","Exit ramp","Entrance and exit ramp","Highway interchange","Roundabout / Traffic circle","Roundabout Bypass"]
    },
    "bicycle_facility": {
        text: 'Bicycle access (A to B)',
        type: 'field_menu',
        default: 'Allowed, no bicycle lane',
        values: [EMPTY,"Unknown","Segregated parallel lane/trail","Allowed, no bicycle lane","Closed to bicycles","On-street bicycle lane"]
    },
    "bicycle_safety": {
        text: 'Bicycle suitability (A to B)',
        type: 'field_menu',
        default: EMPTY,
        values: [EMPTY,"Preferred","Avoid"]
    },
    "pedestrian_facility": {
        text: 'Pedestrian access (A to B)',
        type: 'field_menu',
        default: 'Allowed',
        values: [EMPTY,"Unknown","Allowed, no sidewalk","Closed to pedestrians","Sidewalk"]
    },
    "pedestrian_facility_sibling": {
        text: 'Pedestrian access (B to A)',
        type: 'field_menu',
        default: 'Allowed',
        values: [EMPTY,"Unknown","Allowed, no sidewalk","Closed to pedestrians","Sidewalk"]
    },
    "bicycle_safety_sibling": {
        text: 'Bicycle suitability (B to A)',
        type: 'field_menu',
        default: EMPTY,
        values: [EMPTY,"Preferred","Avoid"]
    },
    "bicycle_facility_sibling": {
        text: 'Bicycle access (B to A)',
        type: 'field_menu',
        default: 'Allowed, no bicycle lane',
        values: [EMPTY,"Unknown","Segregated parallel lane/trail","Allowed, no bicycle lane","Closed to bicycles","On-street bicycle lane"]
    },
    "elevation_begin": {
        text: 'Elevation Begin',
        type: 'field_menu',
        default: 'Surface',
        values: [EMPTY,"Underpass 2","Underpass 1","Surface","Overpass 1","Overpass 2","Overpass 3","Overpass 4","Overpass 5"]
    },
    "elevation_middle": {
        text: 'Elevation Middle',
        type: 'field_menu',
        default: 'Surface',
        values: [EMPTY,"Underpass 2","Underpass 1","Surface","Overpass 1","Overpass 2","Overpass 3","Overpass 4","Overpass 5"]
    },
    "elevation_end": {
        text: 'Elevation End',
        type: 'field_menu',
        default: 'Surface',
        values: [EMPTY,"Underpass 2","Underpass 1","Surface","Overpass 1","Overpass 2","Overpass 3","Overpass 4","Overpass 5"]
    },
    "name": {
        text: 'Feature Name',
        type: 'field_string',
        default: '',
        placeholder: 'Main Street'
    },
    "name_types": {
        text: 'Feature Name Type',
        type: 'field_menu',
        default: 'Primary',
        values: ["Local","Primary","Official","Obscure","Numbered highway","Abbreviated","Bicycle route"]
    },
    "edit_reason" : {
        text: "Reason for editing",
        type: 'field_menu',
        values: ["- - -", "Adding detail", "Correcting poor data", "Fixing spam data", "Other"]
    },
    "author_comments": {
        text: 'Comments',
        type: 'field_string',
        default: '',
        placeholder: 'yada, yada'
    },
    "save_next_done": {
        text: 'ACTION: Confirm (Save/Next/Done)',
        type: 'action',
        param: null,
        description: 'Click Save button, next link or button or done link'
    },
    "add_line_feature": {
        text: 'ACTION: Add Line Feature',
        type: 'action_string',
        default: "Road"
    },
    "add_place_feature": {
        text: 'ACTION: Add Place (Point of Interest)',
        type: 'action_string',
        default: "Gas Station"
    },
    "browse_places": {
        text: 'ACTION: Browse Places',
        type: 'action_string',
        default: "Restaurant",
        description: 'Only browsable places will work here like Restaurant, Gas Station, etc.'
    },
    "browse_line_features": {
        text: 'ACTION: Browse Line Features',
        type: 'action_string',
        default: "Intersection",
        description: 'Only browsable line features will work here like Road, Intersection, Trail, Monorail Track, etc.'
    },
    "toggle_elastic_mode": {
        text: 'ACTION: Toggle Elastic Mode',
        type: 'action',
        param: null
    },
    "choose_create_new_road": {
        text: 'ACTION: Choose Create New Road',
        type: 'action',
        param: null,
        description: "Choose the `Create New Road` option in the extent or create dialog."
    }
};
$.each(ActionList,function(n,v){v.id = n;});

var ActionMenuOrder = [
    "save_next_done",
    "add_line_feature",
    "add_place_feature",
    "browse_places",
    "browse_line_features",
    "toggle_elastic_mode",
    "priority",
    "lane",
    "avg_speed",
    "barrier",
    "one_way",
    "elevation",
    "surface",
    "condition",
    "construction",
    "road_access",
    "segment_usage_traffic",
    "bicycle_facility",
    "bicycle_safety",
    "pedestrian_facility",
    "bicycle_facility_sibling",
    "bicycle_safety_sibling",
    "pedestrian_facility_sibling",
    "elevation_begin",
    "elevation_middle",
    "elevation_end",
//    "address_range_prefix",
//    "address_range_from",
//    "address_range_to",
//    "address_range_suffix",
//    "address_range_prefix_sibling",
//    "address_range_from_sibling",
//    "address_range_to_sibling",
//    "address_range_suffix_sibling",
//    "address_range_alternate_numbering",
    "edit_reason",
    "name",
    "name_types",
    "author_comments"
];

var KeyDict = null;

function getKeyName(keyCode) {
    if (!KeyDict) {
        KeyDict = [];
        for (var i = 0; i<256; i++) KeyDict.push(null);
        $.each(KeyNames,function(n,v){
            KeyDict[n] = v;
        });
        for (var i = 0; i<256; i++) {
            if (!KeyDict[i]) {
                KeyDict[i] = 'key-code-'+i;
            }
        }

    }
    return KeyDict[keyCode];
}

function abbreviate(settings) {
    var abr = [];
    $.each(settings.macros,function(i,v){
        abr.push({
            a: v.addEditMode,
            f: v.focusInText,
            k: v.keyCode,
            m: v.modifiers,
            n: v.name,
            o: v.otherMode,
            p: v.passThrough,
            s: v.steps
        });
    });
    return $.extend({},settings,{macros:abr});
}

function unabbreviate(settings) {
    var uabr = [];
    $.each(settings.macros,function(i,v){
        uabr.push({
            addEditMode: v.a,
            focusInText: v.f,
            keyCode: v.k,
            modifiers: v.m,
            name: v.n,
            otherMode: v.o,
            passThrough: v.p,
            steps: v.s
        });
    });
    return $.extend({},settings,{macros:uabr});
}

var storageVersion = '1.0';

function shrink(settings) {
    str = LZString.compressToUTF16(JSON.stringify(abbreviate(settings)));
    if (debug) {
        d.log("Shrink: before=%d after=%d",JSON.stringify(settings).length,JSON.stringify({ gmmp_settings:[storageVersion, str] }).length);
    }
    return [storageVersion, str];
}

function unshrink(storedSettings) {
    var settings = null;
    if ($.isArray(storedSettings) && storedSettings[0]===storageVersion) {
        try {
            settings = unabbreviate(JSON.parse(LZString.decompressFromUTF16(storedSettings[1])));
        } catch (e) {
            d.alert("Fatal error parsing stored settings %o",e);
        }
    } else {
        d.log('WARNING: unsupported storage format')
    }
    return settings;
}

function storeSettings(newSettings){
    chrome.storage.sync.set({ gmmp_settings: shrink(newSettings || settings) }, function() {
        d.log("settings saved");
    });
};

(function($){
    $.fn.hilite = function(options, callback){
        options = typeof options === 'number' ? {duration: options} : options;
        if (typeof callback === 'function') {
            options.callback = callback;
        }
        options = jQuery.extend($.fn.hilite.defaults, options);
        return this.each(function(){

            var it = $(this);
            it.data('hilite-bg-color',it.css('background'));
            it.css({background: 'rgba(255,255,0,0)'})
                .prop('hilite_bg_color', 0)
                .animate({hilite_bg_color: 1},{step:function(now, fx){
                        $(fx.elem).css('background-color','rgba(255,255,0,'+now+')');
                    },duration: options.duration*(1/6)}).css({background: 'rgba(255,255,0,0)'})
                .animate({hilite_bg_color: 0},{step:function(now, fx){
                        $(fx.elem).css('background-color','rgba(255,255,0,'+now+')');
                    },always:function(){
                        it.css('background',it.data('hilite-bg-color')).removeData('hilite-bg-color');
                    },duration: options.duration*(5/6)});
        });
    }
    $.fn.hilite.defaults = {
        duration: 2000,
        callback: false // call when done
    };
}(jQuery));

Array.prototype.move = function (old_index, new_index) {
    while (old_index < 0) {
        old_index += this.length;
    }
    while (new_index < 0) {
        new_index += this.length;
    }
    if (new_index >= this.length) {
        var k = new_index - this.length;
        while ((k--) + 1) {
            this.push(undefined);
        }
    }
    this.splice(new_index, 0, this.splice(old_index, 1)[0]);
    return this; // for testing purposes
};