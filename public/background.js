'use strict';

chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({url: window.location.href}, function () {
        console.log("set initial url");
    });
})

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.url) {
        chrome.storage.sync.set({url: changeInfo.url}, function () {
            console.log("set url");
        });
    }
});