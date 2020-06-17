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

// chrome.storage.onChanged.addListener(function(changes, namespace) {
//     console.log(changes);
//     if (changes.isEarning && changes.isEarning.newValue) {
//         console.log('reached for storage on changed');
//         if (!window.location.href.includes('tag=soulsmileclub-20')) {
//             var url = new URL(window.location.href);
//             url.searchParams.append('tag', 'soulsmileclub-20');
//             window.location.href = url;
//         }
//     }
// });

// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//     chrome.notifications.create({
//         title: "Activate Donations",
//         type: "basic",
//         message: "Start donating with Soulsmile Club today!",
//         iconUrl: chrome.extension.getURL('/soulsmile.png'),
//     }, function () {
//         console.log('hi callback');
//     });
//     sendResponse({returnMsg: 'activated!'});
// });

