/*************************************************************************************
* GMM Plus browser extension
*
* Copyright 2014 Mike Scalora
* See: https://github.com/mscalora/gmmplus
*************************************************************************************/

d.log('=====  GMM Plus Loaded =====');

function persist_settings(newSettings){
    chrome.storage.sync.set({ gmmp_settings: newSettings || settings }, function() {
        d.log("settings saved");
    });
};

var settings = $.extend({},settings_defaults);

function loadSettings(raw_data) {
    if (!raw_data.gmmp_settings) {
        d.log('First use!');
        settings = $.extend(settings, settings_defaults, { macros: factory_default_macros });
        persist_settings(settings);
        receiveSetttings({gmmp_settings: settings}, true);
    } else {
        receiveSetttings(raw_data, true);
    }
    d.event('system','version',manifest.version);
}

function receiveSetttings(raw_data, force_change_notification) {
    var comp = raw_data.gmmp_settings && raw_data.gmmp_settings.newValue ? raw_data.gmmp_settings.newValue : raw_data.gmmp_settings;
    if (comp) {
        var data = unshrink(comp);
        if (data) {
            d.log("Settings updated with: %o", data);
            var oldSettings = $.extend({}, settings);
            $.extend(settings, data);
            $.each(settings, function (n, v) {
                if (force_change_notification || v !== oldSettings[n]) {
                    d.log('@@@ %s changed from %o to %o', n, oldSettings[n], v)
                    settingChanged(n, v, oldSettings[n]);
                }
            });
        } else {
            d.log("Received data but not something expected %o", raw_data);
        }
    } else {
        d.log("Received data but not something expected %o", raw_data);
    }
}

chrome.storage.sync.get("gmmp_settings", loadSettings);
chrome.storage.onChanged.addListener(receiveSetttings);

var manifest = chrome.runtime.getManifest();
if (debug) {
    $(document.body).append('<div id="gmmp-marker">'+manifest.version+'</div>');
}

$(document.body).append('<div id="gmmp-emode"></div>');

/** elastic mode indicator **/
$('#gmmp-emode').toggle(settings.elastic_mode_indicator);

/** hide search box so it is unfocusable **/
var oneSearchBox = $('.one-google-searchbox input[type=text]').toggle(!settings.hide_search);
oneSearchBox.parent().on('click',function(){
    if (settings.hide_search) {
        oneSearchBox.show().focus().one('blur',function(){
            oneSearchBox.hide();
        })
    }
});

var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function() {
        var cb = $('#toolbar-options-item-useElasticMode .jfk-checkbox');
        if (!cb.data('gmmp-init')) {
            cb.data('gmmp-init',true).trigger('click');
            setTimeout(function(){ $(':focus').blur(); },750);
        }
        if ($('#toolbar-options-outer').css('display')=='none') {
            cb.data('gmmp-init',false);
            $('#gmmp-emode').removeClass('ON OFF');
        } else {
            var ON = cb.hasClass('jfk-checkbox-checked');
            $('#gmmp-emode')
                .toggleClass('ON',ON)
                .toggleClass('OFF',!ON);
        }
    });
});

observer.observe($('#toolbar-options-outer')[0], { attributes:true, filter: ["class","style"] });

/*** surface ***/
var panel = $();

localStorage.focuserHandlerRetries = 0;

var focuserHandler = function() {
    if ((localStorage.focuserHandlerRetries)<0) {
        d.log('----- I give up!');
        return;
    }
    localStorage.focuserHandlerRetries = localStorage.focuserHandlerRetries-1;
    d.log('----- focusing %o', localStorage.focuserHandlerRetries);
    var el = $('[data-field-id=surface].gw-edit-binding .goog-flat-menu-button');
    if (el.is(':visible')) {
        el.trigger('focus');
        setTimeout(function(){
            d.log('- - - has focus: %o',el.is(':focus'));
            if (!el.is(':focus')) {
                setTimeout(focuserHandler,250);
            }
        },500);
    } else {
        d.log('----- resetting');
        setTimeout(focuserHandler,250);
    }
};

var focus_surface = function(){
    localStorage.focuserHandlerRetries = 12;
    return focuserHandler();
};

var surfaceObserver = new MutationObserver( function(mutations,obs){
    var oldState = panel.data('gmmp-state');
    var newState = panel.is(':visible');
    //var newState = !(panel.css('display')==='none' || panel.parent().css('display')==='none') ;
    d.log('••••• old: %o new %o',oldState,newState);
    if (!oldState && newState) {
//    if (oldState!==newState && oldState==='none') {
        d.log('##### surface is appearing!');
        if (settings.focus_surface) {
            setTimeout(focus_surface,300);
        }
    } else {
        d.log('##### or not was %o now %o',oldState,newState);
    }
    panel.data('gmmp-state',newState);
    if (newState) {
        var timer = setInterval(function(){
            if (!panel.is(':visible')) {
                panel.data('gmmp-state',false);
                clearInterval(timer);
                d.log('##### surface is gone');
            }
        },1500);
    }
});

/* wait for editor UI to show up */
var installObserver = new MutationObserver( function(mutations,obs){
    var surfaceControl = $('[data-field-id=surface]:visible .goog-flat-menu-button');
    //log('##### %o',surfaceControl[0]);
    mutations.forEach(function(mutation) {
        //log('----- %o',mutation);
    });

    if (surfaceControl.length) {
        panel = $(surfaceControl).parents('.subpanel');
        d.log('+++++ subpanel: %o',$(surfaceControl).parents('.subpanel')[0]);
        d.log('##### installing edit panel open, surface observer');
        obs.disconnect();
        panel.data('gmmp-state',false);
        surfaceObserver.observe(panel[0],{attributes:true, filter: ["style"] });
        setTimeout(focus_surface,200);
    }
});

installObserver.observe($('#page')[0],{ childList: true, subtree: true });

// ===== Tripple Press Support =====
//var prev1KeyCode = null;
//var prev2KeyCode = null;

$(document.body).on(debug ? 'keypress keydown keyup' : 'keydown', function(e){

// ===== Tripple Press Support =====
    var trippleKey = false;
//    if (e.type==='keydown') {
//        trippleKey = e.keyCode === prev1KeyCode && prev1KeyCode === prev2KeyCode;
//        prev2KeyCode = prev1KeyCode;
//        prev1KeyCode = trippleKey ? null : e.keyCode;
//    }

    var info = $('#gw-edit-info span:visible').text();
    var editMode = info==='Editing';
    var addMode = info==='Adding';
    var extendingMode = info==='Extending';
    var addOrEditMode = editMode || addMode || extendingMode;

    var focus = $(':focus');
    var focusInEdit = focus.is('INPUT, TEXTAREA');

    var synth = e.originalEvent.detail === false || e.originalEvent.detail === undefined;

    /** [debug mode only] show keyCode for any keydown that makes it to the body **/
    d.log('%s Keycode: %o %o %s %o ', e.type, e.keyCode, e, trippleKey ? 'TRIPPLE' : '', KeyNames[e.keyCode]);

    if (e.type=='keyup') {
        return;
    }

    // Similar to clicking on any Save, Ok, Next buttons or Done link
    function confirmAction() {
        var deferred = $.Deferred();

        var button = $('.kd-button-submit:visible');
        if (addOrEditMode && button.length) {
            $('.kd-button-submit:visible').trigger('click');
            deferred.resolve();
        } else {
            var doner = $('.kd-done-toolbar-link a:visible');
            if (doner.length) {
                clickOn(doner);
                deferred.resolve();
            } else {
                deferred.reject();
            }
        }
        return deferred.promise();
    }

    // Initiate a create road (like the R key does normally)
    function chooseCreateNewRoadAction() {
        var deferred = $.Deferred();
        if ($('#route_extend').is(':visible')) {
            $('#route_extend :checkbox:not(:last)').each(function () {
                if ($(this).prop('checked')) {
                    $(this).trigger('click');
                }
            });
            var createNew = $('#route_extend :checkbox:last');
            if (!createNew.prop('checked')) {
                createNew.trigger('click');
            }
            deferred.resolve();
        } else {
            deferred.reject();
        }
        return deferred.promise();
    }

    // Turn on/off Elastic Mode while it is available
    function toggleElasticModeAction() {
        var cb = $('#toolbar-options-item-useElasticMode .jfk-checkbox').trigger('click').trigger('change');
        var ON = cb.hasClass('jfk-checkbox-checked');
        $('#gmmp-emode')
            .toggleClass('ON',ON)
            .toggleClass('OFF',!ON);
        return $.Deferred().resolve().promise();
    }

    // Choose a "menu button" item from the list of options
    function chooseEditDropdown(field_id, item_text){
        if (!item_text) {
            return $.Deferred().reject().promise();
        }
        return executeActions([
            '[data-field-id='+field_id+']:visible .goog-flat-menu-button',
            '.goog-menuitem-content:visible:contains('+item_text+')'
        ]);
    }

    /** All of that action functions (browsePlaceAction, browseLineFeatureAction, etc) handle a specific type of
     * shortcut step. Each receives the parameter (or undefined if action doesn't have one) and the action object
     * (see: ActionList in common.js)
     */

    // enable browsing of specific place feature name (or all) if already browsing it, turn off (toggle)
    function browsePlaceAction(feature) {
        var deferred = $.Deferred();
        var placeButton = $('#kd-browse-point-features');
        var placeButtonVisible = placeButton.is(':visible');
        var placeSelected = placeButton.hasClass('jfk-button-checked');

        var input = $('#kd-category-selection-input');
        var inputValue = input.val();

        var cancelLink = $('.kd-cancel-toolbar-link');
        var cancelLinkVisible = cancelLink.is(':visible');

        // check if we should just turn it off
        if (placeButtonVisible && inputValue==feature && cancelLinkVisible) {
            return executeActions(['.kd-cancel-toolbar-link']);
        }

        var chain = [];
        if (!placeButtonVisible) {
            chain.push('#kd-browse-toolbar-button div');
        }
        if (!placeSelected) {
            chain.push('#kd-browse-point-features');
        }

        if (feature) {
            chain.push(100);
            chain.push(function(){
                $('#kd-category-selection-input').trigger('focus')
                ;
                return $.Deferred().resolve().promise();
            });
            chain.push(100);
            chain.push(function(){
                $('#kd-category-selection-input').val(feature);
                return $.Deferred().resolve().promise();
            });
            chain.push(100);
            chain.push(function(){
                $('#kd-category-selection-input').trigger('change');
                return $.Deferred().resolve().promise();
            });
            chain.push(100);
            chain.push('#kd-browse-point-features');
        } else {
            chain.push(100);
            chain.push(function(){
                if ($('#kd-browse-show-all:visible').length) {
                    chain.push('#kd-browse-point-features');
                }
                input.val(feature).trigger('focus');
                return $.Deferred().resolve().promise();
            });
        }

        executeActions(chain).then(function(){
            deferred.resolve();
        },function(){
            deferred.reject();
        });

        return deferred.promise();
    }

    // enable browsing of specific line feature name (or all) if already browsing it, turn off (toggle)
    function browseLineFeatureAction(feature) {
        var deferred = $.Deferred();
        var chain = [];

        // if the edit panel is up, bail out
        if (addOrEditMode) {
            return deferred.reject().promise();
        }

        // cache some items for later checking
        var lineButton = $('#kd-browse-line-features');
        var lineButtonVisible = lineButton.is(':visible');
        var lineSelected = lineButton.hasClass('jfk-button-checked');

        var input = $('#kd-category-selection-input');
        var inputValue = input.val();

        var cancelLink = $('.kd-cancel-toolbar-link');
        var cancelLinkVisible = cancelLink.is(':visible');

        // check if we should just turn it off (gives the toggle effect)
        if (lineButtonVisible && inputValue==feature && cancelLinkVisible) {
            return executeActions(['.kd-cancel-toolbar-link']);
        }

        // not sure the state we are in so, only add these clicks if needed
        if (!lineButtonVisible) {
            chain.push('#kd-browse-toolbar-button div');
        }
        if (!lineSelected) {
            chain.push('#kd-browse-line-features');
        }

        // need to wait for the UI to keep up, so insert some delays between these events
        chain.push(100);
        chain.push(function(){
            $('#kd-category-selection-input').trigger('focus');
            return $.Deferred().resolve().promise();
        });
        chain.push(100);
        chain.push(function(){
            $('#kd-category-selection-input').val(feature || '');
            return $.Deferred().resolve().promise();
        });
        chain.push(100);
        chain.push(function(){
            $('#kd-category-selection-input').trigger('change');
            return $.Deferred().resolve().promise();
        });
        chain.push(100);
        chain.push('#kd-browse-line-features');

        return executeActions(chain);
    }

    // given a line feature category (i.e. Road, Trail, Railway) start adding one
    function addLineFeatureAction(feature, action){
        return executeActions([
            '#kd-add-toolbar-menubutton:visible div:contains("Add New"):last, #kd-add-toolbar-menubutton:visible div[guidedhelpid]',
            '#kd-add-polyline:visible',
            '#kd-toolbar-floater input[type=text]:visible',
            function() {
                $('#kd-toolbar-floater input[type=text]').val(feature).trigger('change');
                return $.Deferred().resolve().promise();
            },
            '.category-ac-container b:contains("'+feature+'"):visible'
        ]);
    }

    // given a place (POI) feature category (i.e. Gas Station, Hospital, etc) start adding one
    function addPlaceFeatureAction(feature, action){
        return executeActions([
            '#kd-add-toolbar-menubutton:visible div:contains("Add New"):last, #kd-add-toolbar-menubutton:visible div[guidedhelpid]',
            '#kd-add-poi',
            function(){
                // try to wait until AFTER the user picks a spot on the map
                return executeActions(['#kd-category-selection-input-panel input[type=text]:visible'],{additional:333, max_tries:3*60})
                    .then(function(){
                        $('#kd-category-selection-input-panel input[type=text]').val(feature).trigger('change');
                    });
            },
            '.category-ac-container b:contains("'+feature+'"):visible'
        ]);
    }


    // test if edit/add panel field is a type-in (string or numeric)
    function isTextField(field_id) {
        return !!$('[data-field-id='+field_id+'] input[type=text]:visible, [data-field-id='+field_id+'] textarea:visible').length;
    }

    // set the value in a edit/add panel field is a type-in (string or numeric)
    function setTextField(field_id, item_text) {
        var field = $('[data-field-id='+field_id+'] input[type=text]:visible, [data-field-id='+field_id+'] textarea:visible').val(item_text).trigger('change');
        return $.Deferred()[field.length?'resolve':'reject']().promise();
    }

    // run one 'step' of a macro, and recurse if the step's promise is resolved/success (abort if rejected/fail)
    function runMacroStep(macro, step_num) {
        //d.log("Step: %d", step_num);
        if (step_num<macro.steps.length) {
            var step = macro.steps[step_num][0];
            var action = ActionList[step];
            var param = macro.steps[step_num][1];
            if (action) {
                if (action.type===ActionType.FIELD_MENU) {
                    chooseEditDropdown(step, param).then(function(){ runMacroStep(macro, step_num+1); }).then(function(){
                        runMacroStep(macro, step_num+1);
                    });
                } else if (action.type===ActionType.FIELD_NUMERIC || action.type===ActionType.FIELD_STRING) {
                    setTextField(step, param).then(function(){
                        runMacroStep(macro, step_num+1);
                    });
                } else if (action.type===ActionType.ACTION || action.type===ActionType.ACTION_STRING) {
                    var actionHandler = Actions[step];
                    if (actionHandler) {
                        actionHandler(param, action).then(function () {
                            runMacroStep(macro, step_num + 1);
                        });
                    } else {
                        d.alert('Unknown action id "'+step+'"');
                    }
                } else {
                    d.alert('Unknown action type '+action.type+'!');
                }
            } else {
                d.alert('Unknown action '+step+'!');
            }
        }
    }

    // map of non-edit field actions to the function that implements them
    var Actions = {
        save_next_done: confirmAction,
        toggle_elastic_mode: toggleElasticModeAction,
        choose_create_new_road: chooseCreateNewRoadAction,
        add_line_feature: addLineFeatureAction,
        add_place_feature: addPlaceFeatureAction,
        browse_line_features: browseLineFeatureAction,
        browse_places: browsePlaceAction
    }

    // shortcut step processor
    $.each(settings.macros || [], function (i, macro) {
        var active = (addOrEditMode ? macro.addEditMode!==false :  macro.otherMode!==false);
        if (focusInEdit && !macro.focusInText) {
            active = false;
        }
//        d.log("%c%s EditMode:%s FocusInText:%s macro.addEditMode:%s macro.otherMode:%s macro.focusInText:%s - %s",
//            active ? 'color:#080;' : 'color:#b00;',
//            active,
//            addOrEditMode,
//            focusInEdit,
//            macro.addEditMode,
//            macro.otherMode,
//            macro.focusInText,
//            macro.name
//        );
        if (active) {
            if (macro.keyCode === e.keyCode) {
                var m = macro.modifiers || "";
                if ((e.shiftKey === (m.indexOf('S') !== -1))
                    && (e.altKey === (m.indexOf('A') !== -1))
                    && (e.metaKey === (m.indexOf('M') !== -1))
                    && (e.ctrlKey === (m.indexOf('C') !== -1))) {
                    d.log("%cMacro: %c%s %cexecuting!", 'color:#080;', 'color:#080; font-weight:bold;',macro.name,'color:#080;');
                    d.event('shortcut','execute',macro.name,macro.steps.length);
                    runMacroStep(macro, 0);
                    if (!macro.passThrough) {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                    }
                }
            }
        }
    });

//  this code will select the "create new road" option when the extend roar or create new road dialog appears
//  a decision to allow this behaviour in a shortcut step has been deferred
//
//    // c key when extend popup shows
//    if (settings.create_new_road && e.type==='keydown' && e.keyCode===KeyCodes.c && $('#route_extend').is(':visible')) {
//        $('#route_extend :checkbox:not(:last)').each(function(){
//            if ($(this).prop('checked')) {
//                $(this).trigger('click');
//            }
//        });
//        var createNew = $('#route_extend :checkbox:last');
//        if (!createNew.prop('checked')) {
//            createNew.trigger('click');
//        }
//    }

    /** keypad CLEAR key */
    if (e.type==='keydown' && e.keyCode===KeyCodes.NUM_CLEAR) {

        /** Meta-Keypad-Clear resets settings **/
        if (e.metaKey) {
            var response = confirm('Reset all GMMPlus settings?');
            if (response) {
                d.log("=== Settings to defaults ===");
                settings = $.extend({},settings_defaults);
                persist_settings(settings);
            }
        }

        e.stopPropagation();
        e.preventDefault();
    }

});

function messagePort() {
    return d.event_port = d.event_port || chrome.runtime.connect({ name: "gmmp_msg" });
}

function settingChanged(setting, newValue, oldValue) {
    if (setting==='hide_search') {
        oneSearchBox.toggle(oneSearchBox.is(':focus') || !newValue);
    } else if (setting==='elastic_mode_indicator') {
        $('#gmmp-emode').toggle(newValue);
        $('input[name=q]').closest('form').parent().parent().parent().parent().width(newValue?300:'');
    } else if (setting==='telemetry') {
        if (newValue) {
            d.event = function(){
                messagePort().postMessage({ message:"telemetry-event", event:$.makeArray(arguments) });
            };
        } else {
            d.event = function(){};
        }
    }
}

$('#gmmp-emode').on('click',function(e){
    messagePort().postMessage({message:"open-options"});
});
