'use strict';

chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({color: 'blue'}, function() {
        console.log('The color is blue.');
    });
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {hostEquals: 'www.amazon.com'},
            })], actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});

