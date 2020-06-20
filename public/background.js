'use strict';

chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({url: window.location.href}, function () {
        console.log("set initial url");
    });
})