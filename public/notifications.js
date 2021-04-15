/*
Importing firebase to get information from users/website
*/ 
import firebase from './Firebase.js';






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
    const url = chrome.runtime.getURL("files/affiliates.json");
    fetch(url)
        .then((response) => response.json())
        .then((json) => createPermissionNotificationOrSoulsmilePopup(json));
}


/* 
 * Helper function for createPermissionNotification
 * Creates notification asking user for permission to start earning soulsmiles on this site by
 * creating box using Boundary API, redirects either to affiliate link or 
*/
function createPermissionNotificationOrSoulsmilePopup(affiliates) {
    var strippedUrl = stripURL(window.location.href);
    console.log(affiliates[strippedUrl]);

    if (affiliates[strippedUrl]["extensionAllowed"]) {
        // affiliate link redirection is allowed by this retailer
        showPermissionNotification();
    } else {
        // redirection is not allowed, so direct to Soulsmile website, pass in retailer keyword for URL
        showSoulsmilePopup(affiliates[strippedUrl]["keyword"]);
    }
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
 * Creates the checkout reminder, pops-up only at check out pages. The (checkIfCheckoutpage) function has been modified to get this to pop up when needed. 
*/
function createCheckOutReminder() {
    // create notification box
    var earningsNotification = Boundary.createBox("checkoutNotification");

    // add CSS
    Boundary.loadBoxCSS("#checkoutNotification", chrome.extension.getURL('bootstrap.min.css'));
    Boundary.loadBoxCSS("#checkoutNotification", chrome.extension.getURL('your-stylesheet-for-elements-within-boxes.css'));
    
    // add content
    Boundary.rewriteBox("#checkoutNotfication", `
    <div class="modal-part2">
        <button type="button" id="xButton" class="close" data-dismiss="modal" aria-label="Close">
        <span aria-hidden="true">&times;</span>
        </button>
    </div>
    `);
    Boundary.appendToBox("#checkoutNotification", `<div id='soulsmile-title'>
        <h2>soul<span id="smile">smile</span> club</h2>
    </div>
    `);  

    Boundary.appendToBox("#checkoutNotification", `
    <div>
        <p id='earn-soulsmiles'> Congratulations! You will earn soul<span style="color:#eda1aa">smiles</span> with this purchase. </p> 
    </div>`);  

    Boundary.appendToBox("#checkoutNotification", `
    <div> 
        <p style="color: #444444;" > The exact amount will be reflected in your <a href="https://www.soulsmile.club/login" target="_blank" rel="noopener noreferrer">soul<span style="color:#eda1aa">smiles</span>account</a> shortly. </p> 
    </div>`);

    // add button functionality
    Boundary.findElemInBox("#xButton", '#checkoutNotification').click(function() {
        $('#checkoutNotification').remove();
    })
} 
/* 
Next is the profile reminder, this should have links/access to the website and provides information from a user's profile. Such as wallet, photo, and their last purchase
This function is only to create the notification
*/  
function createProfileReminder() {
    // create notification box
    var earningsNotification = Boundary.createBox("profileNotification");

    // add CSS
    Boundary.loadBoxCSS("#profileNotification", chrome.extension.getURL('bootstrap.min.css'));
    Boundary.loadBoxCSS("#profileNotification", chrome.extension.getURL('your-stylesheet-for-elements-within-boxes.css'));
    
    // add content
    Boundary.rewriteBox("#profileNotification", `
    <div class="modal-part2">
        <button type="button" id="xButton" class="close" data-dismiss="modal" aria-label="Close">
        <span aria-hidden="true">&times;</span>
        </button>
    </div>
    `);
    Boundary.appendToBox("#profileNotification", `<div id='soulsmile-title'>
        <h2>soul<span id="smile">smile</span> club</h2>
    </div>
    `); 
    /*// ADD PROFILE PHOTO HERE
    Boundary.appendToBox("#reginaNotification", `
    <div id= "profile.png"> 
        <img src= "profile.png" alt="profile"/> 
        <h3 id='wallet'> 187 </h3> 
    </div>`); 

    //WAllet
    /*Boundary.appendToBox("#reginaNotification", ` 
    <div> 
        <h3 id='wallet'> 187 </h3> 
    </div>` );  */

    //UnderWALLET */
    
    Boundary.appendToBox("#profileNotification", `
    <div>
        <p id='congrats'>Congratulations!</p>
    </div>`);      

    Boundary.appendToBox("#profileNotification", ` 
    <div> 
        <p> You have earned soulsmiles from your recent purchase! Would you like to donate your soulsmiles to</p> 
    </div>`);  
    Boundary.appendToBox("#profileNotification", ` 
    <div> 
        <p id='donateY'> All Soulsmile Causes?</p> 
    </div>`); 

    Boundary.appendToBox("#profileNotification", `
    <div>
        <button type='button' class='btn btn-secondary' id='DonateNowButton'>Donate Now!</button>
    </div>`);
    // add button functionality 

    Boundary.findElemInBox("#xButton", '#profileNotification').click(function() {
        $('#profileNotification').remove(); 
    
    })  
    Boundary.findElemInBox("#DonateNowButton", "#profileNotification").click(function() {
        $('#profileNotification').remove();
        window.open('https://www.soulsmile.club/login/'); 
    });
}




// I was not able to fork the most recent extension github for some reason, so I will be posting the revised functions here. 
// Here is the modified checkout function 

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
                                createCheckOutReminder();
                            });
                        }
                    });
                }
            }
        });
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
 * Reads checkout JSON file to check if current URL is a checkout page (and then display checkout notification if so)
*/
function checkIfCheckoutPage() {
    // gets JSON file (public/checkout.json) containing mapping of domain name to URL keyword indicating it is a checkout page
    // *** IMPORTANT NOTE: to update with future partner sites, add new site to checkout.json with keyword that URL must contain when reaching the checkout page
    const url = chrome.runtime.getURL("files/checkout.json");
    fetch(url)
        .then((response) => response.json())
        .then((json) => displayCheckoutNotif(json));
}

/*
 * Reads cart JSON file to check if current URL is a cart page (and then insert coupon code if so)
*/
function checkIfCartPage() {
    // gets JSON file (public/coupon.json) containing mapping of domain name to URL keyword indicating it is a checkout page, id of coupon code element, and coupon code
    // *** IMPORTANT NOTE: to update with future partner sites, add new site to coupon.json with keyword that URL must contain when reaching the cart page, id of coupon code element, and coupon code
    const url = chrome.runtime.getURL("files/coupon.json");
    fetch(url)
        .then((response) => response.json())
        .then((json) => addCouponCode(json));
}

/* 
 * Helper function for checkIfCheckoutPage, takes JSON of domain names mapped to checkout URL keywords
 * and shows earning reminder notification if current URL is checkout page
*/
function displayCheckoutNotif(checkouts) {
    var urlString = window.location.href;
    var strippedUrl = stripURL(urlString);
    if (urlString.includes(checkouts[strippedUrl])) {
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

/* 
 * Helper function for checkIfCartPage, takes JSON of domain names mapped to cart URL keywords, coupon code ids, coupon codes, and submit button names
 * and inserts coupon code if current URL is cart page
*/
function addCouponCode(coupons) {
    var urlString = window.location.href;
    var strippedUrl = stripURL(urlString);
    // coupons[strippedUrl] contains 4 elements: cart URL keyword, coupon code field id, coupon code, coupon code submit button name
    if (coupons[strippedUrl] && urlString.includes(coupons[strippedUrl]["cartUrlKeyword"])) {
        // we are on the cart page for this website
        // add coupon code to coupon code field
        var couponCodeField = document.getElementById(coupons[strippedUrl]["couponCodeElementId"]);
        couponCodeField.value = coupons[strippedUrl]["couponCode"] + "\n";
        var couponCodeSubmitButton = document.querySelector("button[type=submit][name="+coupons[strippedUrl]["submitButtonName"]+"]");
        couponCodeSubmitButton.click();
    }
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
    // Websites will redirect to affiliate link specified in JSON file (public/affiliates.json)
    // *** IMPORTANT NOTE: to update with future partner sites, add new site to affiliates.json with affiliate link
    const url = chrome.runtime.getURL("files/affiliates.json");
    fetch(url)
        .then((response) => response.json())
        .then((json) => getAffiliateLink(json, strippedUrl));
}

/* 
 * Reads affiliates JSON and redirects to the affiliate link of the website we are currently on
 * @param affiliates: JSON (read from public/affiliates.json) containing mapping of domain names to affiliate links
*/
function getAffiliateLink(affiliates, strippedUrl) {
    console.log("get affiliate link");
    console.log(affiliates[strippedUrl]);
    if (affiliates[strippedUrl]["productPageLinks"]) {
        // partner site allows us to redirect to affiliate product pages

        // insert query parameter to current URL
        var url = new URL(window.location.href);
        url.searchParams.append(affiliates[strippedUrl]["queryParameterName"], affiliates[strippedUrl]["queryParameterValue"]);

        // set timestamp for redirection and refreshAffiliate
        var key = "lastURLInserted" + strippedUrl;
        chrome.storage.sync.set({[key]: Date.now(), refreshAffiliate: true}, function() {
            // redirect to new URL
            window.location.href = url;
        });
    } else {
        // must redirect to affiliate homepage
        
        // set timestamp for redirection and refreshAffiliate
        var key = "lastURLInserted" + strippedUrl;
        chrome.storage.sync.set({[key]: Date.now(), refreshAffiliate: true}, function() {
            // redirect to new URL
            window.location.href = affiliates[strippedUrl]["link"];
        });
    }
}
