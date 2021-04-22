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
    console.log("updating to version " + details.version);
});

chrome.runtime.requestUpdateCheck(function(status) {
    if (status == "update_available") {
        console.log("update pending...");
        chrome.runtime.reload();
    } else if (status == "no_update") {
        console.log("no update found");
    } else if (status == "throttled") {
        console.log("Oops, I'm asking too frequently - I need to back off.");
    }
});

var firebaseConfig = {
    apiKey: "AIzaSyBigQYTouOytX1qhlBmRBIa0g6fHF2_81w",
    authDomain: "soulsmile-club.firebaseapp.com",
    databaseURL: "https://soulsmile-club.firebaseio.com",
    projectId: "soulsmile-club",
    storageBucket: "soulsmile-club.appspot.com",
    messagingSenderId: "310904582055",
    appId: "1:310904582055:web:3d8ee1e910fa9c49221082"
};

firebase.initializeApp(firebaseConfig);

firebase.auth().onAuthStateChanged(function(user) {
    console.log("auth state changed");
    if (user) {
        chrome.storage.sync.set({'uid': user.uid}, function() {
            console.log("User uid has been updated");
        });
        console.log(user.uid);
        console.log(user.displayName);
        console.log(user.email);
    } else {
        chrome.storage.sync.set({'uid': ""}, function() {
            console.log("User uid has been updated");
        });
        console.log('no user found');
    }
});
