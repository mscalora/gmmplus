/*************************************************************************************
 * GMM Plus browser extension
 *
 * Copyright 2014 Mike Scalora
 * See: https://github.com/mscalora/gmmplus
 *************************************************************************************/

d.log('=====  GMM Plus Background =====');
var _gaq = _gaq || [];
_gaq.push(['_setAccount', localStorage.gmmp_debug ? 'UA-56538988-2' : 'UA-56538988-1']);
_gaq.push(['_trackPageview']);

var settings = {
    telemetry: false
};

var factory_macros = {};
$.each(factory_default_macros,function(n,v){
    factory_macros[v.name] = true;
});

function telemetryInit() {
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.id = 'ga-script';
    ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
    var gas = localStorage.gmmp_debug ? 2 : (localStorage.gmmp_gas || 1);
    _gaq.push(['_setAccount', 'UA-56538988-' + gas]);
    _gaq.push(['_trackPageview']);
}

function updateSettings(raw_data) {
    var data = raw_data && raw_data.gmmp_settings ? (raw_data.gmmp_settings.newValue || raw_data.gmmp_settings)
        : (raw_data || settings);
    if (!settings.telemetry && data.telemetry) {
        settings.telemetry = true;
        telemetryInit();
    }
}

chrome.storage.sync.get("gmmp_settings", updateSettings);
chrome.storage.onChanged.addListener(updateSettings);

chrome.runtime.onConnect.addListener(function(port) {
    d.log("Port connect: %o", port.name);
    _gaq.push(['_trackEvent','system','connect',port.name]);
    port.onMessage.addListener(function(e) {
        d.log(e);
        var msg = e.message || null;
        if (msg==='open-options') {
            var options_url = chrome.extension.getURL('gmmp_options.html');
            chrome.tabs.query({
                url: options_url
            }, function(results) {
                if (results.length)
                    chrome.tabs.update(results[0].id, {active:true});
                else
                    chrome.tabs.create({url:options_url});
            });
        } else if (msg==='telemetry-event') {
            var a = e.event || [ 'system', 'empty-postMessage'];
            if (a[0]==='shortcut' && a[2] && !factory_macros[a[2]]) {
                a[2] = 'user-defined';
            }
            a.unshift('_trackEvent');
            _gaq.push(a);
        }
    });
});
