'use strict';

chrome.runtime.onInstalled.addListener(function() {
	// creates new tab with extension instructions when browser extension is first installed
    chrome.tabs.create({url: 'https://www.soulsmile.club/how-to-use'}, 
    function () {
        console.log('Created tab to demonstrate how to use extension');
    });
});