$(document).ready(function() {
    console.log("document is ready");
    // get current URL domain name
    var strippedUrl = stripURL(window.location.href);
    console.log("current URL: " + strippedUrl);

    if (strippedUrl === "soulsmile.club") {
        handleSoulsmileWebsite();
    } else {
        console.log("after return");

        // get lastURLInserted (timestamp of last time user was redirected to affiliate on this site),
        // refreshAffiliate (whether we need to put earning notification right now),
        // and noTimestamp (last time user clicked remind me later)
        chrome.storage.sync.get(["lastURLInserted" + strippedUrl,
            "refreshAffiliate",
            "refreshAffiliateThroughSoulsmile",
            "noTimestamp" + strippedUrl
        ], function (data) {
            console.log(JSON.stringify(data));
            if (data.refreshAffiliate) {
                // User just clicked got redirected through affiliate link -- show earning reminder
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
                showPermissionNotification();
            } else {
                // User is earning soulsmiles on this site, no need to refresh, just check for checkout page
                console.log("already earning");
                checkIfCheckoutPage();
                checkIfCartPage();
            }
        });
    }
});

function handleSoulsmileWebsite() {
    console.log("soulsmile website");
    var checkExist = setInterval(function() {
        if ($("#activateButton").length) {
            console.log("exists");
            clearInterval(checkExist);
            $("#activateButton").click(function () {
                console.log("clicked");
                redirectToAffiliate($("#strippedUrl").html());
            });
        } else {
            console.log("does not exist");
        }
    });
}

/* 
 * Creates notification asking user for permission to start earning soulsmiles on this site by
 * creating box using Boundary API
*/ 
function createPermissionNotification() {
    var strippedUrl = stripURL(window.location.href);
    var AIRTABLE_RETAILERS_DOC = 'https://api.airtable.com/v0/app6kGp5x2cQ2Bfrs/Retailers?api_key=keySwjNfgz4FoST54';
    fetch(AIRTABLE_RETAILERS_DOC)
        .then(res => res.json())
        .then(res => {
            const data = res.records;
            for (var j = 0; j < data.length; j++) {
                const domain = data[j]["fields"]["Domain"];
                const extensionAllowed = data[j]["fields"]["Extension Allowed"];
                const keyword = data[j]["fields"]["Keyword"];
                if (strippedUrl == domain && extensionAllowed) {
                    // affiliate link redirection is allowed by this retailer
                    showPermissionNotification();
                    break;
                } 
                if (strippedUrl == domain) {
                    // redirection is not allowed, so direct to Soulsmile website, pass in retailer keyword for URL
                    showSoulsmilePopup(keyword);
                    break;
                }
            }
        });
}

/*
 * Shows notification asking for permission to redirect user to affiliate link
*/
function showPermissionNotification() {
    // create notification box
    var permissionNotification = Boundary.createBox("permissionNotification");

    // add CSS
    Boundary.loadBoxCSS("#permissionNotification", chrome.extension.getURL('bootstrap.min.css'));
    Boundary.loadBoxCSS("#permissionNotification", chrome.extension.getURL('your-stylesheet-for-elements-within-boxes.css'));
    
    // add content
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
        <b>Disclosure:</b> As an affiliate of this retailer, Soulsmile Club earns commission from qualifying purchases. 
        By clicking "Yes" above, you are giving us your consent to automatically direct you to our affiliate links. 
        However, instead of keeping the commission, we donate all of it to the causes listed on 
        <a href="https://www.soulsmile.club" target="_blank" rel="noopener noreferrer">our website</a>.
    </div>
    `);

    // add button functionalities
    Boundary.findElemInBox("#noButton", '#permissionNotification').click(function() {
        $('#permissionNotification').remove();
        setNoTimestamp();
    })
    Boundary.findElemInBox("#yesButton", "#permissionNotification").click(function() {
        $('#permissionNotification').remove();
        redirectToAffiliate(stripURL(window.location.href));
    });
}

/*
 * Shows notification asking to redirect user to Soulsmile website, where they can then activate donations
 * @param retailer: string for keyword to insert in soulsmile.club/retailers URL
*/
function showSoulsmilePopup(retailer) {
    console.log("show soulsmile popup");

    // create notification box
    var permissionNotification = Boundary.createBox("soulsmilePopup");

    // add CSS
    Boundary.loadBoxCSS("#soulsmilePopup", chrome.extension.getURL('bootstrap.min.css'));
    Boundary.loadBoxCSS("#soulsmilePopup", chrome.extension.getURL('your-stylesheet-for-elements-within-boxes.css'));
    
    // add content
    Boundary.rewriteBox("#soulsmilePopup", `
    <div class="modal-header">
        <button type="button" id="noButton" class="close" data-dismiss="modal" aria-label="Close">
        <span aria-hidden="true">Remind me later</span>
        </button>
    </div>
    `);
    Boundary.appendToBox("#soulsmilePopup", `<div>
        <h2 id='soulsmile-title'>soul<span id="smile">smile</span> club</h2>
    </div>
    `);
    Boundary.appendToBox("#soulsmilePopup", `
    <div>
        <p id='earn-soulsmiles'>Would you like to earn soulsmiles for your purchases?</p>
    </div>`);
    Boundary.appendToBox("#soulsmilePopup", `
    <div>
        <button type='button' class='btn btn-secondary' id='yesButton'>Yes, please!</button>
    </div>`);
    Boundary.appendToBox("#soulsmilePopup",`
    <div id="disclosure">
        <b>Note:</b> This retailer does not allow us to automatically direct you to our affiliate link, so you must click 
        "Start Earning Soulsmiles" from the Soulsmile Club website after clicking "Yes" above in order for your soulsmiles to be earned.
    </div>
    `);

    // add button functionalities
    Boundary.findElemInBox("#noButton", '#soulsmilePopup').click(function() {
        $('#soulsmilePopup').remove();
        setNoTimestamp();
    })
    Boundary.findElemInBox("#yesButton", "#soulsmilePopup").click(function() {
        $('#soulsmilePopup').remove();
        window.open('https://www.soulsmile.club/retailers/' + retailer);
    });
}

/*
 * Creates notification reminding users they are earning soulsmiles
 * (after being redirected to affiliate link)
*/
function createEarningReminder() {
    // create notification box
    var earningsNotification = Boundary.createBox("earningsNotification");

    // add CSS
    Boundary.loadBoxCSS("#earningsNotification", chrome.extension.getURL('bootstrap.min.css'));
    Boundary.loadBoxCSS("#earningsNotification", chrome.extension.getURL('your-stylesheet-for-elements-within-boxes.css'));
    
    // add content
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
    Boundary.appendToBox("#earningsNotification",`
    <div id="earningsDisclosure">
        <b>Disclosure:</b> In order to earn soulsmiles, you are currently shopping through our affiliate link for this retailer. 
        As an affiliate of this retailer, Soulsmile Club earns commission from qualifying purchases. 
        However, instead of keeping the commission, we donate all of it to the causes listed on 
        <a href="https://www.soulsmile.club" target="_blank" rel="noopener noreferrer">our website</a>.
    </div>
    `);

    // add button functionality
    Boundary.findElemInBox("#xButton", '#earningsNotification').click(function() {
        $('#earningsNotification').remove();
    })
}

/*
 * Strips full-length URL to just domain name, with no http, www, or parameters (e.g. just girlfriend.com)
 * @param urlString: string containing full URL of current website
 * @return: string of stripped URL
*/
function stripURL(urlString) {
    var url = new URL(urlString);

    // gets hostname from URL and strips it of www. (if it exists)
    var strippedUrl = url.hostname.indexOf("www.") && url.hostname || url.hostname.replace("www.", "");
    
    // removes any prefixes to only include last 2 portions of hostname (e.g. buy.logitech.com --> logitech.com)
    var splitUrl = strippedUrl.split(".");
    return splitUrl[splitUrl.length-2] + "." + splitUrl[splitUrl.length-1];
}

/*
 * Reads airtable to check if current URL is a checkout page (and then display checkout notification if so)
*/
function checkIfCheckoutPage() {
    var AIRTABLE_RETAILERS_DOC = 'https://api.airtable.com/v0/app6kGp5x2cQ2Bfrs/Retailers?api_key=keySwjNfgz4FoST54';
    fetch(AIRTABLE_RETAILERS_DOC)
        .then(res => res.json())
        .then(res => {
            const data = res.records;
            for (var j = 0; j < data.length; j++) {
                const domain = data[j]["fields"]["Domain"];
                const checkoutPage = data[j]["fields"]["Checkout"];
                var urlString = window.location.href;
                var strippedUrl = stripURL(urlString);
                if (domain == strippedUrl && checkoutPage != "" && urlString.includes(checkoutPage)) {
                    var key = "checkoutTimestamp" + strippedUrl;
                    chrome.storage.sync.get([key], function (data) {
                        // number of minutes for which we should not repeat a checkout notification on a particular site
                        var checkoutMins = 10;
                        if (!data[key] || Date.now() - data[key] >= checkoutMins * 60 * 1000) {
                            // create earning reminder and reset checkoutTimestamp only if there has never been a checkout notification shown or if it was shown >= checkoutMins ago
                            chrome.storage.sync.set({[key]: Date.now()}, function () {
                                console.log("New checkout timestamp for " + strippedUrl + " is " + Date.now());
                                createEarningReminder();
                            });
                        }
                    });
                }
            }
        });
}

/*
 * Reads airtable to check if current URL is a cart page (and then insert coupon code if so)
*/
function checkIfCartPage() {
    var AIRTABLE_RETAILERS_DOC = 'https://api.airtable.com/v0/app6kGp5x2cQ2Bfrs/Retailers?api_key=keySwjNfgz4FoST54';
    fetch(AIRTABLE_RETAILERS_DOC)
        .then(res => res.json())
        .then(res => {
            const data = res.records;
            for (var j = 0; j < data.length; j++) {
                const domain = data[j]["fields"]["Domain"];
                const promoCode = data[j]["fields"]["Promo Code"];
                const promoId = data[j]["fields"]["Promo Id"];
                const cartKeyword = data[j]["fields"]["Cart Keyword"];
                const submitId = data[j]["fields"]["Submit Id"];
                var urlString = window.location.href;
                var strippedUrl = stripURL(urlString);
                if (domain == strippedUrl) {
                    if (cartKeyword != "" && urlString.includes(cartKeyword)) {
                        // we are on the cart page for this website
                        // add coupon code to coupon code field
                        var couponCodeField = document.getElementById(promoId);
                        couponCodeField.value = promoCode + "\n";
                        var couponCodeSubmitButton = document.querySelector("button[type=submit][name="+submitId+"]");
                        couponCodeSubmitButton.click();
                    }
                }
            }
        });
}

/* 
 * Sets noTimestamp with current time, should be called when user clicks "remind me later" so we can store last time they have been reminded
*/
function setNoTimestamp() {
    var strippedUrl = stripURL(window.location.href);
    var key = "noTimestamp" + strippedUrl;
    chrome.storage.sync.set({[key]: Date.now()}, function() {
        console.log("New no timestamp for " + strippedUrl + " is " + Date.now());
    });
}

/* 
 * Redirects current page to the affiliate link of the website, also storing timestamp in lastURLInserted
 * to keep track of how long it's been since the last affiliate link redirection for this site
*/
function redirectToAffiliate(strippedUrl) {
    console.log("get affiliate link");
    var AIRTABLE_RETAILERS_DOC = 'https://api.airtable.com/v0/app6kGp5x2cQ2Bfrs/Retailers?api_key=keySwjNfgz4FoST54';
    fetch(AIRTABLE_RETAILERS_DOC)
        .then(res => res.json())
        .then(res => {
            const data = res.records;
            for (var j = 0; j < data.length; j++) {
                const domain = data[j]["fields"]["Domain"];
                const link = data[j]["fields"]["Link"];
                const affiliateNetwork = data[j]["fields"]["Affiliate Network"];
                const isDeepLinkingAllowed = data[j]["fields"]["Deep Linking"];
                var url = null;
                if (domain == strippedUrl) {
                    chrome.storage.sync.get(['uid'], function (data) {
                        if (data.uid && isDeepLinkingAllowed) {
                            console.log(data.uid);
                            if (affiliateNetwork == "Refersion") {
                                url = new URL(window.location.href);
                                url.searchParams.append("subid", data.uid);
                            } else if (affiliateNetwork == "Tapfiliate") {
                                url = new URL(window.location.href);
                                url.searchParams.append("ref", "soulsmileclub");
                                url.searchParams.append("tm_uid", data.uid);
                            } else if (affiliateNetwork == "Impact") {
                                url = new URL(link);
                                url.searchParams.append("subid1", data.uid);
                            } else if (affiliateNetwork == "Rakuten") {
                                var fullLink = link.split("murl=");
                                var firstHalfLink = fullLink[0];
                                var secondHalfLink = fullLink[1];
                                url = new URL(firstHalfLink);
                                url.searchParams.append("u1", data.uid);
                                url.searchParams.append("murl", decodeURIComponent(secondHalfLink));
                            }
                        } else { // user is not logged into extension and should use default link
                            url = new URL(link);
                        }
                        // set timestamp for redirection and refreshAffiliate
                        var key = "lastURLInserted" + strippedUrl;
                        chrome.storage.sync.set({[key]: Date.now(), refreshAffiliate: true}, function() {
                            // redirect to new URL
                            window.location.href = url;
                        });
                    });
                }
            }
        });
}