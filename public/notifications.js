$(document).ready(function() {
    var strippedUrl = stripURL(window.location.href);
    chrome.storage.sync.get(['lastURLInserted' + strippedUrl,
        'refreshAffiliate',
        'noTimestamp' + strippedUrl
    ], function (data) {
        // User clicks yes to earn soulsmiles
        if (data.refreshAffiliate) {
            chrome.storage.sync.set({refreshAffiliate: false}, function() {
                createEarningReminder();
            });
        }
        if (!data["lastURLInserted" + strippedUrl]) {
            // User has never started earning soulsmiles on this site before
            if (!data["noTimestamp" + strippedUrl]) {
                // User has never clicked remind me later
                createPermissionNotification();
            } else if (Date.now() - data["noTimestamp" + strippedUrl] >= 86400000) {
                // User has clicked remind me later and they need to be asked again
                createPermissionNotification();
            } else {
                // User has clicked remind me later but it hasn't been 24 hours yet -- do nothing
            }
        } else if (Date.now() - data["lastURLInserted" + strippedUrl] >= 86400000) {
            // User is earning soulsmiles on this site but needs to be refreshed
            chrome.storage.sync.set({refreshAffiliate: true}, function() {
                redirectToAffiliate();
            });
        } else {
            // User is earning soulsmiles on this site, no need to refresh, just check for checkout page
            console.log("already earning");
            checkIfCheckoutPage();
        }
    });
});

function createPermissionNotification() {
    var permissionNotification = Boundary.createBox("permissionNotification");
    Boundary.loadBoxCSS("#permissionNotification", chrome.extension.getURL('bootstrap.min.css'));
	Boundary.loadBoxCSS("#permissionNotification", chrome.extension.getURL('your-stylesheet-for-elements-within-boxes.css'));
    Boundary.rewriteBox("#permissionNotification", `
    <div class="modal-header">
        <button type="button" id="noButton" class="close" data-dismiss="modal" aria-label="Close">
        <span aria-hidden="true">Remind me later</span>
        </button>
    </div>
    `);
    Boundary.appendToBox("#permissionNotification", `<div>
        <h2 id='soulsmile-title'>soul<span id="smile">smile</span> club</h2>
    </div>
    `);
    Boundary.appendToBox("#permissionNotification", `
    <div>
        <p id='earn-soulsmiles'>Would you like to earn soulsmiles for your purchases?</p>
    </div>`);
    Boundary.appendToBox("#permissionNotification", `
    <div>
        <button type='button' class='btn btn-secondary' id='yesButton'>Yes, please!</button>
    </div>`);
    Boundary.appendToBox("#permissionNotification",`
    <div id="disclosure">
        <b>Disclosure:</b> As an Amazon Associate and an affiliate of other brands, 
        Soulsmile Club earns a commission from qualifying purchases. However, instead of 
        keeping the commission, we donate all of it to causes listed on <a href="https://www.soulsmile.club" target="_blank" rel="noopener noreferrer">our website</a>.
    </div>
    `);
    Boundary.findElemInBox("#noButton", '#permissionNotification').click(function() {
        $('#permissionNotification').remove();
        setNoTimestamp();
    })
	Boundary.findElemInBox("#yesButton", "#permissionNotification").click(function() {
        $('#permissionNotification').remove();
        chrome.storage.sync.set({refreshAffiliate: true}, function() {
            redirectToAffiliate();
        });
    });
}

function createEarningReminder() {
    var earningsNotification = Boundary.createBox("earningsNotification");
    Boundary.loadBoxCSS("#earningsNotification", chrome.extension.getURL('bootstrap.min.css'));
    Boundary.loadBoxCSS("#earningsNotification", chrome.extension.getURL('your-stylesheet-for-elements-within-boxes.css'));
    Boundary.rewriteBox("#earningsNotification", `
    <div class="modal-header">
        <button type="button" id="xButton" class="close" data-dismiss="modal" aria-label="Close">
        <span aria-hidden="true">&times;</span>
        </button>
    </div>
    `);
    Boundary.appendToBox("#earningsNotification", `<div id='soulsmile-title'>
        <h2>soul<span id="smile">smile</span> club</h2>
    </div>
    `);
    Boundary.appendToBox("#earningsNotification", `
    <div>
        <p id='earn-soulsmiles'>You are earning soulsmiles for your purchases on this website!</p>
    </div>`);
    Boundary.findElemInBox("#xButton", '#earningsNotification').click(function() {
        $('#earningsNotification').remove();
    })
}

function stripURL(urlString) {
    var url = new URL(urlString);
    var strippedUrl = url.hostname.indexOf('www.') && url.hostname || url.hostname.replace('www.', '');
    var splitUrl = strippedUrl.split(".");
    console.log(splitUrl[splitUrl.length-2] + splitUrl[splitUrl.length-1]);
    return splitUrl[splitUrl.length-2] + "." + splitUrl[splitUrl.length-1];
}

function checkIfCheckoutPage() {
    const url = chrome.runtime.getURL('checkout.json');
    console.log("check against checkouts");
    fetch(url)
        .then((response) => response.json())
        .then((json) => displayCheckoutNotif(json));
}

function displayCheckoutNotif(checkouts) {
    console.log("checking checkoutnotif");
    var urlString = window.location.href;
    var strippedUrl = stripURL(urlString);
    if (urlString.includes(checkouts[strippedUrl])) {
        createEarningReminder();
    }
}

function setNoTimestamp() {
    var url = new URL(window.location.href);    
    var strippedUrl = url.hostname.indexOf('www.') && url.hostname || url.hostname.replace('www.', '');
    var key = "noTimestamp" + strippedUrl;
    chrome.storage.sync.set({[key]: Date.now()}, function() {
        console.log("New no timestamp for " + strippedUrl + " is " + Date.now());
    });
}

function redirectToAffiliate() {
    var strippedUrl = stripURL(window.location.href);
    var key = "lastURLInserted" + strippedUrl;
    chrome.storage.sync.set({[key]: Date.now()}, function() {
        console.log("New timestamp for " + strippedUrl + " is " + Date.now());
        if (window.location.href.includes('amazon.com')) {
            addAmazonTagURL();
        } else {
            const url = chrome.runtime.getURL('affiliates.json');
            fetch(url)
                .then((response) => response.json())
                .then((json) => getAffiliateLink(json));
        }
    });
}

function getAffiliateLink(affiliates) {
    var strippedUrl = stripURL(window.location.href);
    window.location.href = affiliates[strippedUrl];
}

function addAmazonTagURL() {
    if (!window.location.href.includes('tag=soulsmilecl09-20')
        && !window.location.href.includes('tag=soulsmileclubblm-20')
        && !window.location.href.includes('tag=soulsmileclubcovid-20')
        && !window.location.href.includes('tag=soulsmileclubswe-20')) {
        var url = new URL(window.location.href)
        url.searchParams.append('tag', 'soulsmilecl09-20')
        window.location.href = url
    } else {
        window.location.href = window.location.href;
        console.log('Page reloaded');
    }
};