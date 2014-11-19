/*************************************************************************************
 * GMM Plus browser extension
 *
 * Copyright 2014 Mike Scalora
 * See: https://github.com/mscalora/gmmplus
 *************************************************************************************/

d.log('=====  GMM Plus Options Loaded =====');
var _gaq = _gaq || [];
d.event = function(){
    if (settings.telemetry) {
        var a = $.makeArray(arguments);
        a.unshift('_trackEvent');
        _gaq.push(a);
    }
}

var settings = $.extend({},settings_defaults);

function loadSettings(raw_data) {
    if (!raw_data.gmmp_settings) {
        d.log('First use!');
        settings = $.extend(settings, settings_defaults, { macros: factory_default_macros });
        storeSettings(settings);
        populateSettings({gmmp_settings: settings});
    } else {
        populateSettings(raw_data);
    }
}

function populateSettings(raw_data){
    if (raw_data.gmmp_settings) {
        var comp = raw_data.gmmp_settings.newValue || raw_data.gmmp_settings
        var data = unshrink(comp);
        d.log(data);
        settings = data || $.extend({}, settings_defaults);
        $('#gmmp-marker').text(settings.version);
        $.each(settings, function(i,v){
            if (typeof v !== "object") {
                $('#' + i).prop('checked', !!v);
            }
        });
        updateMacroList(settings.macros);
    } else {
        d.log('Received data but not something expected %o', raw_data);
    }
    telemetryInit();
}

function init() {
    chrome.storage.sync.get("gmmp_settings", loadSettings);
    chrome.storage.onChanged.addListener(populateSettings);
    var gas = localStorage.gmmp_debug ? '2' : localStorage.gmmp_gas || '1';
    _gaq.push(['_setAccount', 'UA-56538988-' + gas]);
    _gaq.push(['_trackPageview']);
}

document.addEventListener('DOMContentLoaded', function () {
    var manifest = chrome.runtime.getManifest();
    settings.version = manifest.version;

    var version = manifest.name + ' ' + settings.version;

    $('#version').text(manifest.name + ' ' + settings.version);
    $('#plat').hide().text(navigator.userAgent.replace(/.*?\(([^)]*)\).*/,'$1') +
        ' ' + navigator.userAgent.replace(/.*?(Chrome[\/[0-9.]*).*/,'$1').replace('/',' '));

    init();

    $(document.body).on('change',':checkbox',function(e){
        var name = $(this).attr('id');
        if (name in settings_defaults) {
            settings[name] = !!$(this).prop('checked');
            storeSettings();
        }
    });
});

$(document).on('keydown.gmmp',function(e){
    if (e.keyCode===9) {
        $(document).off('keydown.gmmp');
        $(document.body).removeClass('hide-focus');
    }
});

$('#title').one('blur', function(){
    $(this).prop('tabindex',-1);
});

function showExportTabHandler(e) {
    var dataURL = 'data:application/json,'+encodeURIComponent(JSON.stringify({ macros: settings.macros, version: settings.version}, null, '    ').replace(/\[\s*("[-_\w ]+"),\s*("[-_\w ]+"|null)\s*\]/g,'[ $1, $2 ]'));
    $('#export-link')
        .attr('href',dataURL)
        .off('click')
        .on('click',function(){
            d.event('options','export','shortcut');
        });
}

function showImportTabHandler(e) {
    $('#importer').val('');
    $('#import-select').show().siblings().hide();
}

function showAboutTabHandler(e) {
    $('#telemetry').prop('checked',settings.telemetry)
}

var tabEvents = {
    shortcuts: {
        show: refreshMacroListLayout
    },
    Export: {
        show: showExportTabHandler
    },
    Import: {
        show: showImportTabHandler
    },
    about: {
        show: showAboutTabHandler
    }
}

$('.tab').on('click',function(e){
    $('.tab').removeClass('active');
    var tab = $(this).addClass('active');
    $('.sections:visible').hide();
    var tabID = tab.attr('data-target') || tab.text().trim();
    $('#'+tabID).show();
    if (tabEvents[tabID] && tabEvents[tabID].show) {
        tabEvents[tabID].show(e);
    }
    return false;
})

if (localStorage.gmmp_notFirstTime) {
    $('[data-target="shortcuts"]').trigger('click');
} else {
    $('[data-target="introduction"]').trigger('click');
    localStorage.gmmp_notFirstTime = 1;
}

$('.tab').on('keypress',function(e) {
    if (e.keyCode===KeyCodes.SPACE || e.keyCode===KeyCodes.ENTER) {
        $(this).trigger('click');
        return false;
    }
});

if (debug) {
    $('body').on('keydown keypress keyup', function (e) {
        $('#debug-keyName').text(getKeyName(e.keyCode));
        $('#debug-key').text(e.keyCode);
        $('#debug-mod').text(
                (e.shiftKey ? 'shift ' : '') +
                (e.ctrlKey ? 'ctrl ' : '') +
                (e.metaKey ? 'meta ' : '') +
                (e.altKey ? 'alt ' : '') +
                '');
    });
}

$('#debug-settings button.settings-local').on('click',function(e){
    $('#debug-settings pre').text(
        JSON.stringify(settings,null,'    ')
    );
});

$('#debug-settings button.settings-sync').on('click',function(e){
    chrome.storage.sync.get(null, function(data){
            $('#debug-settings pre').text(
                JSON.stringify(data, null, '    ')
            );
            $.each(data,function(n,v) {
                $('#debug-settings pre')
                    .append('<div><button data-key="'+encode(n)+'">Delete '+encode(n)+'</button>');
            })
        }
    );
});

$('#debug-settings pre').on('click','button[data-key]',function(){
    chrome.storage.sync.remove($(this).attr('data-key'));
    setTimeout(function(){
        $('#debug-settings button.settings-sync').trigger('click');
    },1000);
});

// ===== IMPORT =====

function encode(s) {
    return $('<span>').text(s).html();
}

function addPreviewLine(preview, isGood, s) {
    $('<div class="preview-line">')
        .toggleClass('line-good', isGood===true)
        .toggleClass('line-bad', isGood===false)
        .append('<b>').append(
            $('<span>').text(s)
        ).appendTo(preview);
}

function setInvalid(preview, message) {
    preview.css({color: '#F00'});
    $('#import-confirm .commit').prop('disabled',true);
    addPreviewLine(preview, false, message);
}

function setValid(preview, data) {
    preview.css({color: '#004'});
    $('#import-confirm .commit').prop('disabled',false);

    if (data.version) {
        addPreviewLine(preview, true, 'Version: "' + data.version + '"');
    }
    $.each(data, function(n, v){
        if (n==='version' || n==='macros') {
            // ignore here
        } else if (settings_defaults[n]!==undefined) {
            addPreviewLine(preview, true, 'Setting "' + n + '"');
        }  else {
            addPreviewLine(preview, null, 'Unknown Item: "'+n+'" (will be ignored)');
        }
    });
    if (data.macros && data.macros.length) {
        $.each(data.macros,function(n,v){
            addPreviewLine(preview, true, 'Shortcut "' + v.name + '" has '+ (v.steps && v.steps.length ? (v.steps.length>1 ? v.steps.length + ' steps' : '1 step') : '0 steps'));
        })
    } else {
        addPreviewLine(preview, null, 'No Shortcuts');
    }
}

$('#importer').on('change',function(e){
    var it = $(this);
    var file = it.prop('files')[0];
    $('#import-confirm .commit').removeData('data');
    if (file) {
        var reader = new FileReader();
        reader.onload = function(){
            var json = reader.result;
            var preview = $('#import-confirm pre').text('');
            $('#import-confirm').show().siblings().hide();
            try {
                var data = JSON.parse(json);
                addPreviewLine(preview, undefined, "Validating...");
                setValid(preview, data);
                $('#import-confirm .commit').data('data', data);
            } catch(e) {
                setInvalid(preview, 'Unrecognised format, not a vaild JSON document');
            }
        }
        reader.readAsText(file);
    }
});

$('#import-confirm .commit').on('click', function(e){
    var data = $('#import-confirm .commit').data('data');
    settings.macros.push.apply(settings.macros, data.macros);
    updateMacroList(settings.macros);
    d.event('options','import','shortcut',data.macros.length);
    $('#import-results').text(data.macros.length + ' shortcuts imported');
    $('#import-complete').show().siblings().hide();
});

$('#import-confirm .cancel').on('click', function(e){
    showImportTabHandler(e);
});

$('#add-macro').on('click',function(){
    $('#shortcuts .list').hide();
    var editor = $('#shortcuts .editor').show();
    $('.key',editor).text('');
    $('.name',editor).val('').trigger('focus');
    $('.field-row:not(:first)').remove();
    $('select.field',editor).val('priority').change();
    $('.delete',editor).hide();
    $('#shortcuts .name-key button').trigger('click');
    $('#shortcuts').data('macro',{
        name: null,
        keyCode: 0,
        modifiers: "",
        steps: []
    }).data('slot',null);
    d.event('options','add-start','shortcut');
});

function editMacro(macro, slot) {
    $('#shortcuts .list').hide();
    var editor = $('#shortcuts .editor').show();
    $('.key',editor).html(keystrokeMarkup(macro.keyCode, macro.modifiers))
        .data('keyCode',macro.keyCode)
        .data('modifiers',macro.modifiers);
    $('.name',editor).val(macro.name).trigger('focus');
    $('.focus-in-text',editor).prop('checked', !!macro.focusInText); // default to unchecked
    $('.add-edit-mode',editor).prop('checked', macro.addEditMode!==false); // default to checked
    $('.other-mode',editor).prop('checked', macro.otherMode!==false); // default to checked
    $('.pass-through',editor).prop('checked', !!macro.passThrough); // default to checked
    $('.field-row:not(:first)').remove();
    $('select.field',editor).val('priority').change();
    $('.delete',editor).hide();
    $('#shortcuts').data('macro',macro).data('slot',slot);
    $.each(macro.steps, function(i, v){
        if (i==0) {
            $('.field-row select.field').val(v[0]).trigger('change');
            $('.field-row .value:visible').val(v[1]);
        } else {
            addEditorFieldRow(v[0],v[1]);
        }
    });
}

$.each(ActionMenuOrder, function(i,v){
    $('#shortcuts .editor .field').append(
        $('<option>').attr('value', v).text(ActionList[v].text)
    );
});

$('#shortcuts .editor').hide();

// delete step in macro editor
$('#shortcuts .editor').on('click', '.delete button', function(e) {
    $(e.target).closest('.row').remove();
    $('#shortcuts .editor .delete').toggle($('#shortcuts .editor .field-row').length>1);
});

// setup a UI row for a macro step
function setupRow(row,value) {
    var action = $('select.field',row).val();
    var entry = ActionList[action];
    $('.field-value',row).hide();
    if (action) {
        var type = entry.type;
        $('.numeric',row).toggle(type===ActionType.FIELD_NUMERIC);
        $('.string',row).toggle(type===ActionType.FIELD_STRING || type===ActionType.ACTION_STRING);
        $('.choice',row).toggle(type===ActionType.FIELD_MENU);
        if (type===ActionType.FIELD_MENU) {
            // populate 2nd select if needed
            var select = $('select.value',row).html('');

            $.each(entry.values,function(i,v){
                $('<option>').attr('value',v).text(v).appendTo(select);
            });
            if (!value && entry.default) {
                select.val(entry.default);
            }
        }
        if (value || entry.default) {
            $('.value:visible', row).val(value || entry.default);
        }
    }
    $('#shortcuts .editor .delete').toggle($('#shortcuts .editor .field-row').length>1);
}

// update UI row for a change in the action field
$('#shortcuts').on('change', 'select.field', function(e){
    var row = $(e.target).closest('.row');
    setupRow(row);
});

// add a step to a macro in the editor
function addEditorFieldRow(field, value){
    var row = $('.field-row:first').clone().appendTo('.field-section');
    $('select.field',row).val(field || '');
    setupRow(row, value);
}

$('#add-field').on('click',function(){
    addEditorFieldRow();
});

// build the markup for a keystroke
function keystrokeMarkup(keyCode, modifiers) {
    var s = $('<span>');

    for(var i = 0; i<modifiers.length; i++) {
        $('<kbd>').addClass('key-'+modifiers[i]).appendTo(s);
        s.append('<i></i>');
    }
    $('<kbd>').text(getKeyName(keyCode)).appendTo(s);
    return s.html();
}

// set the keystroke value with a modal dialog
$('#shortcuts .name-key button').on('click',function(){
    $('#overlay, #capture-key').fadeIn(200);
    $('#overlay').trigger('focus');
    var dialog = $('#capture-key');
    var keystroke = null;
    var modifiers = '';
    $('.commit',dialog).prop('disabled', keystroke===null);

    $('.keystroke').html('');

    function cleanup(clearAll){
        $('#overlay, #capture-key').fadeOut(100);
        $('body, #overlay, #shortcuts *').off('.key-capture');
        if (clearAll) {
            $('#shortcuts .name-key .key').html('').removeData('keyCode').removeData('modifiers');
        }
        return false;
    }

    $('body, #overlay').off('keydown.key-capture').on('keydown.key-capture',function(e){
        if (ModKeys[e.keyCode]) {
            return;
        }
        keystroke = e.keyCode;
        modifiers =
            (e.shiftKey ? 'S' : '') +
            (e.metaKey ? 'M' : '') +
            (e.altKey ? 'A' : '') +
            (e.ctrlKey ? 'C' : '');
        $('.keystroke').html(keystrokeMarkup(keystroke, modifiers));
        $('.commit',dialog).prop('disabled', keystroke===null);
        return false;
    });

    $('#overlay').off('blur.key-capture').on('blur.key-capture',function(e) {
        $('#overlay').trigger('focus');
    });

    $('.cancel',dialog).off('click.key-capture').on('click.key-capture',function(e){
        cleanup(true);
        if (!$('#shortcuts .name-key .key').data('keyCode')) {
            showMacrosList();
        }
        return false;
    });

    $('.commit',dialog).off('click.key-capture').on('click.key-capture',function(e){
        if (keystroke===null) {
            return false;
        }
        $('#shortcuts .name-key .key')
            .html(keystrokeMarkup(keystroke, modifiers))
            .data('keyCode',keystroke)
            .data('modifiers',modifiers);
        cleanup();
        $('#shortcuts .name-key .name').trigger('focus'); //.hilite();
        return false;
    });

});

// setup UI for a row in the list of macros
function fillMacroRow(row, macro) {
    var steps = '';
    $.each(macro.steps, function(i,v){
        steps += v[0] +  ' \u21D0 "' + v[1] + '"; ';
    });
    var actions = $('<span class="macro-actions"><button class="small edit">Edit</button> <button class="small delete">Delete</button> <button class="small move-up">⇧</button></span>');
    var name = $('<span class="macro-name">').append($('<span>').text(macro.name));
    var key = $('<span class="macro-key">').html(keystrokeMarkup(macro.keyCode, macro.modifiers));
    var blurb = $('<span class="macro-blurb">').text(steps);
    row
        .append(key)
        .append(name)
        .append(actions);
}

function refreshMacroListLayout() {
    var ml = $('#macro-list');
    var pl = $('.panel.list');
    if (!pl.is(':visible')) {
        return;
    }
    $('.headers',pl).toggle(!!$('.macro-row',ml).length);
    var max_name = 0;
    $('.macro-name span', pl).each(function() {
        var w = $(this).outerWidth();
        max_name = max_name>w ? max_name : Math.ceil(w);
    });
    var max_key = 0;
    $('kbd', ml).each(function(){
        var kbd = $(this);
        var w = kbd.position().left-kbd.parent().position().left+kbd.outerWidth();
        max_key = max_key>w ? max_key : Math.ceil(w);
    });
    var max_actions = $('.macro-actions:first', ml).outerWidth();
    var w = $('.macro-row:first', ml).innerWidth() - Math.ceil(max_actions) - max_name - max_key;
    $('.macro-key', pl).innerWidth(w>0?max_key+w/2:max_key);
    $('.macro-name', pl).innerWidth(w>0?max_name+w/2:max_name+w);
}

function updateMacroList(macros) {
    if (macros) {
        $('#macro-list').html('');
        $.each(macros, function(i,macro){
            var row = $('<div class="macro-row">');
            fillMacroRow(row,macro);
            row.appendTo($('#macro-list'));
        });
    }
    refreshMacroListLayout();
}

function showMacrosList(macro, slot){
    if (slot || slot===0) {
        var rows = $('#macro-list .macro-row');
        var row = rows.eq(slot);
        fillMacroRow(row,macro);
        settings.macros[slot] = macro;
        storeSettings();
    } else if (macro) {
        var row = $('<div class="macro-row">');
        fillMacroRow(row,macro);
        row.appendTo($('#macro-list'));
        if (settings.macros===undefined) {
            settings.macros = [];
        }
        settings.macros.push(macro);
        storeSettings();
    }
    $('#shortcuts .list').show();
    $('#shortcuts .editor').hide();
}

$('#shortcuts').on('click','.cancel',function() {
    showMacrosList();
});


function saveMacro(macro) {
    macro.name = $('#shortcuts .name-key .name').val().trim();
    macro.keyCode = $('#shortcuts .name-key .key').data('keyCode');
    macro.modifiers = $('#shortcuts .name-key .key').data('modifiers');
    macro.focusInText =  $('#shortcuts .name-key .focus-in-text').prop('checked');
    macro.addEditMode =  $('#shortcuts .name-key .add-edit-mode').prop('checked');
    macro.otherMode   =  $('#shortcuts .name-key .other-mode').prop('checked');
    macro.passThrough =  $('#shortcuts .name-key .pass-through').prop('checked');
    macro.steps = [];
    $('.editor .field-row').each(function(){
        var row = $(this);
        macro.steps.push([$('.field',row).val(), $('.value:visible',row).val()]);
    });
    return macro;
}

$('#shortcuts').on('click','.commit',function(){
    var name = $('#shortcuts .name-key .name').val().trim();
    if (name==='') {
        $('#shortcuts .name-key .name').trigger('focus').hilite();
        return false;
    }
    var macro = saveMacro($('#shortcuts').data('macro'));
    showMacrosList(macro, $('#shortcuts').data('slot'));
    d.event('options','save','shortcut',macro.steps.length);
});

$('#shortcuts').on('click','.move-up',function(e) {
    var row = $(e.target).closest('.macro-row');
    var pos = row.index();
    if (!pos) {
        return false;
    }
    if (e.altKey) {
        row.insertBefore(row.siblings().first());
        settings.macros.move(pos, 0);
    } else {
        row.insertBefore(row.prev());
        settings.macros.move(pos, pos-1);
    }
    storeSettings();
    return false;
});

$('#shortcuts').on('click','.edit',function(e) {
    var row = $(e.target).closest('.macro-row');
    var slot = row.index();
    var macro = settings.macros[slot];
    editMacro(macro,slot);
    d.event('options','edit-start','shortcut');
    return false;
});

$('#shortcuts').on('click','.delete',function(e) {
    var row = $(e.target).closest('.macro-row');

    function performDelete(row) {
        var index = row.index();
        row.remove();
        settings.macros.splice(index, 1);
        storeSettings();
        d.event('options','delete','shortcut');
    }

    if (e.altKey) {
        performDelete(row);
        return;
    }

    $('#overlay, #confirm-delete-macro').fadeIn(200);

    $('#confirm-delete-macro').off('click','.commit, .cancel')
        .on('click','.commit, .cancel',function(e) {
        $('#overlay, #confirm-delete-macro').fadeOut(100);
        if ($(e.target).hasClass('commit')) {
            performDelete(row);

        }
    });

    return false;
});

$('#factory-reset').on('click',function(){
    $('#overlay, #confirm-reset').fadeIn(200);
    $('#confirm-reset button').off('click').on('click',function(e){
        if ($(this).is('.commit')) {
            settings = $.extend(true, {}, settings_defaults, {macros: factory_default_macros});
            storeSettings(settings);
        }
        $('#overlay, #confirm-reset').fadeOut(100);
    });
    d.event('options','reset','all');
});

function telemetryInit() {
    function init() {
        var ga = document.createElement('script');
        ga.type = 'text/javascript';
        ga.id = 'ga-script';
        ga.async = true;
        ga.src = 'https://ssl.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(ga, s);
    }
    if (settings.telemetry && !$('#ga-script').length) {
        init();
    }
}

$('#telemetry').on('change',function(){
    settings.telemetry = $('#telemetry').prop('checked');
    storeSettings(settings);
    telemetryInit();
});

$(window).on('resize',function(e){
    var cont = $('#tab-contents');
    cont.css('min-height', $(window).height()-182+cont.offset().top);
});
