
function simulate(element, eventName) {
    var options = extend(defaultOptions, arguments[2] || {});
    var oEvent, eventType = null;

    for (var name in eventMatchers) {
        if (eventMatchers[name].test(eventName)) { eventType = name; break; }
    }

    if (!eventType) {
        throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');
    }

    if (document.createEvent) {
        oEvent = document.createEvent(eventType);
        if (eventType == 'HTMLEvents') {
            oEvent.initEvent(eventName, options.bubbles, options.cancelable);
        } else {
            oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
                options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
                options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
        }
        element.dispatchEvent(oEvent);
    } else {
        options.clientX = options.pointerX;
        options.clientY = options.pointerY;
        var evt = document.createEventObject();
        oEvent = extend(evt, options);
        element.fireEvent('on' + eventName, oEvent);
    }
    return element;
}

function extend(destination, source) {
    for (var property in source)
        destination[property] = source[property];
    return destination;
}

var eventMatchers = {
    'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
    'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
}
var defaultOptions = {
    pointerX: 0,
    pointerY: 0,
    button: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    bubbles: true,
    cancelable: true
}

/** run the function f after a delay (in ms)
 *
 * @param f
 * @param delay
 * @returns {promise} always resolved right after function f is executed
 */
function doAfter(f, delay) {
    var deferred = $.Deferred();
    if (delay) {
        setTimeout(function(){ f(); deferred.resolve(); },delay);
    } else {
        f();
        deferred.resolve();
    }
    deferred.resolve();
    return deferred;
}

/** simulate a click on the first element returned by querying a jQuery selector
 *
 * @param selector
 * @param delay - delay before trying the selector the first time (default 0ms)
 * @param more_delay - additional time to delay (max 5 times) (default: 100ms)
 * @returns {promise} rejected if selector always empty, otherwise resolved
 */
function clickOn(selector, delay, more_delay) {
    d.log('Cliking on '+selector+ (delay ? ' in '+delay+'ms':''));
    var deferred = $.Deferred();
    var count = 5;
    var f = function() {
        var but = $(selector);
        /* if query empty, wait some additional time */
        if (!but.length && count) {
            d.log('Wiating for another '+(more_delay || 100)+'ms for '+selector);
            count -= 1;
            setTimeout(f,more_delay || 100);
        } else if (!but.length) {
            deferred.reject();
        } else {
            var off = but.offset();
            simulate(but[0], "mousedown", { button: 0, which: 1, pointerX: off.left+5, pointerY: off.top+5 });
            simulate(but[0], "mouseup", { button: 0, which: 1, pointerX: off.left+5, pointerY: off.top+5 });
            simulate(but[0], "click", { button: 0, which: 1, pointerX: off.left+5, pointerY: off.top+5 });
            deferred.resolve();
        }
        return;
    };
    if (delay) {
        setTimeout(f,delay);
    } else {
        f();
    }
    return deferred;
}

/** execute a list of asynchronous actions with the given options
 *
 * Actions:
 *
 *  string - jQuery selector, run selector query, wait for the result to be non-empty, when non-empty
 *              simulate a click on the first element. Waiting is via polling with the specified (or default)
 *              initial delay (200ms), additional delays (100ms) and maximum number of additional delays (5). If the
 *              query of the selector never becomes non-empty, the action list execution is terminated and the promise
 *              is rejected.
 *
 *  number - delay the next action for the given number of ms (using setTimeout)
 *
 *  function - execute the function and continue on resolution of the returned promise, abort the action list if the
 *              function's promise is rejected and reject the returned promise.
 *
 *  When all of the actions have been executed and resolved, the returned promise is resolved.
 *
 *
 *
 * @param actionArray array of action,
 *              string - jquery selectors to be clicked on
 *              number - delay in ms
 *              function - some caller defined action [must return promise]
 * @param initial [200ms default] if a query returns and empty set the first time it is tried, wait this many ms
 * @param additional [100ms default] if a query returns and empty set the subsequent times, wait this many ms and repeat
 * @param max_tries number of additional time periods to wait for each selector to become non-empty
 * @returns {promise} - will be resolved if and when all actions are successful, otherwise will be rejected.
 */
function executeActions(actionArray, options) {
    opt = options || {};
    initial = opt.initial || 200;
    additional = opt.additional || 100;
    max_tries = opt.max_tries || 5;
    var promise = $.Deferred();

    function step(index, tries) {
        if (index<actionArray.length) {
            d.log("Checking: %d %s", index, actionArray[index]);
            var action = actionArray[index];
            var actionType = typeof action;
            if (actionType === 'string') {
                // simulate click event when element is visible
                var q = $(action);
                if (q.length) {
                    d.log("Clicking: %d for %s", index, actionArray[index]);
                    var off = q.offset();
                    simulate(q[0], "mousedown", { button: 0, which: 1, pointerX: off.left+5, pointerY: off.top+5 });
                    simulate(q[0], "mouseup", { button: 0, which: 1, pointerX: off.left+5, pointerY: off.top+5 });
                    simulate(q[0], "click", { button: 0, which: 1, pointerX: off.left+5, pointerY: off.top+5 });
                    step(index+1);
                } else {
                    if (tries>=max_tries) {
                        d.log("Failure, selector never became non-empty: ", action);
                        promise.reject();
                    } else {
                        var t = setTimeout(function(index, tries){
                            d.log("Waiting: %d for %d/%s", tries===undefined ? initial : additional, index, actionArray[index]);
                            return function(){ step(index, tries); };
                        }(index, (tries||0)+1),tries===undefined ? initial : additional);
                    }
                }
            } else if (actionType === 'function') {
                d.log("Runing async function for %s", action.toString().substr(0,30).replace(/\n/g,' '));
                action().then(function(){
                    d.log("Async function succeeded: %s", action.toString().substr(0,30).replace(/\n/g,' '));
                    step(index+1); },function(){ promise.reject();
                },function(){
                    d.log("Async function failed: %s", action.toString().substr(0,30).replace(/\n/g,' '));
                });
            } else {
                d.log("Pausing for %dms", action);
                var t2 = setTimeout(function(){
                    d.log("Done pausing for %dms", action);
                    step(index+1);
                }, action);
            }

        } else {
            promise.resolve();
        }
    }

    step(0);

    return promise;
}
