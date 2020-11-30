'use strict';

chrome.runtime.onInstalled.addListener(function(details) {
	// creates new tab with extension instructions when browser extension is first installed
	if (details.reason == "install") {
		chrome.tabs.create({url: 'https://www.soulsmile.club/how-to-use'}, 
	    function () {
	        console.log('Created tab to demonstrate how to use extension');
	    });
	} else if (details.reason == "update") {
		// can add update notification for user when we make major changes (e.g. adding account/giving history)
	}
});