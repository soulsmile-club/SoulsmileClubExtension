'use strict';

chrome.runtime.onInstalled.addListener(function() {
    chrome.tabs.create({url: 'https://www.soulsmile.club/blog/how-to-use-extension'}, 
    function () {
        console.log('Created tab to demonstrate how to use extension');
    });
});