'use strict'; 
import firebase from '../src/Firebase.js'; 



const applicationState = { values: [] };

// writes the changes to Chrome Storage
function updateState(applicationState) {
  chrome.storage.local.set({ state: JSON.stringify(applicationState) });
}


// this was taken from the account.js 
function getSoulsmiles(user) {
        console.log("get soulsmiles earned");
        firebase.database().ref('users/' + user.uid).once("value", snapshot => {
            if (snapshot.exists()) {
                console.log("get soulsmiles earned: user exists");
		applicationState.values[soulsmilesInWallet] = snapshot.val().soulsmilesInWallet;
                updateState(applicationState);
		console.log(snapshot.val().soulsmilesInWallet);
            } else {
                console.log("get soulsmiles earned: user does not exist");
            }
        });
  }


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
    chrome.runtime.reload();
}); 

//####### WILL BE EDITING BUT JUST PUTTING IT HERE FOR NOW, WILL DEBUG THESE.
//this function is an add a message listener to get appDB information 
chrome.runtime.onMessage.addListener((msg, sender, response) => {
  switch (msg.type) {
    case 'updateState':
      appDb.users(msg.opts.id).set({ value: msg.opts.value });
      response('success');
      break;
    default:
      response('unknown request');
      break;
  }
}); 


// SAME WITH THIS ONE, WILL BE EDITING 
// That's it! All your extension needs to do is load from the Chrome local storage before rendering itself. If it or a content script needs to manipulate the RTD, the following snippet should be invoked:
// B: COPIED, CHECKING NEEDED
chrome.runtime.sendMessage({type: 'updateState', opts: request.opts}, (response) => {
  if(response == 'success') {
    // last thing didn't work, so try to create a function in here, instead of notifications.js like last time and make it dedicataed to fetching something from account.js 
  }
});

chrome.runtime.requestUpdateCheck(function(status) {
    if (status == "update_available") {
        console.log("update pending...");
    } else if (status == "no_update") {
        console.log("no update found");
    } else if (status == "throttled") {
        console.log("Oops, I'm asking too frequently - I need to back off.");
    }
});

chrome.identity.getAuthToken({ interactive: true }, function (token) {
	console.log("get auth token entered");
    if (chrome.runtime.lastError) {
        alert(chrome.runtime.lastError.message);
        return;
    }
    var x = new XMLHttpRequest();
    x.open('GET', 'https://www.googleapis.com/oauth2/v2/userinfo?alt=json&access_token=' + token);
    x.onload = function() {
        console.log("Succeeded");
    };
    x.send();
});
