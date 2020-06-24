$(document).ready(function() {
    var url = new URL(window.location.href);
    var strippedUrl = url.hostname.indexOf('www.') && url.hostname || url.hostname.replace('www.', '');
    chrome.storage.sync.get([
        'lastURLInserted' + strippedUrl, 
        'reload', 
        'noTimestamp' + strippedUrl
    ], function (data) {
        if (data.reload) {
            chrome.storage.sync.set({reload: false}, function() {
                redirectToAffiliate();
            });
        }
        /* 
        Either yes and 'remind me later' have not been clicked yet, or no has been clicked 
        and it's been 24 hours - create popup box again.
        */
        if (!data["lastURLInserted" + strippedUrl] && !data["noTimestamp" + strippedUrl] 
            || (data["noTimestamp" + strippedUrl] && Date.now() - data["noTimestamp" + strippedUrl] >= 86400000)) {
            createBox();
        } else if (Date.now() - data["lastURLInserted" + strippedUrl] >= 86400000) {
            redirectToAffiliate();
        }
    });
});

function createBox() {
    var yourBoxOneID = Boundary.createBox("yourBoxOneID");
    Boundary.loadBoxCSS("#yourBoxOneID", chrome.extension.getURL('bootstrap.min.css'));
	Boundary.loadBoxCSS("#yourBoxOneID", chrome.extension.getURL('your-stylesheet-for-elements-within-boxes.css'));
	/* modify box one content */
    Boundary.rewriteBox("#yourBoxOneID", `
    <div class="modal-header">
        <button type="button" id="noButton" class="close" data-dismiss="modal" aria-label="Close">
        <span aria-hidden="true">Remind me later</span>
        </button>
    </div>
    `);
    Boundary.appendToBox("#yourBoxOneID", `<div>
        <h2 id='soulsmile-title'>soul<span id="smile">smile</span> club</h2>
    </div>
    `);
    Boundary.appendToBox("#yourBoxOneID", `
    <div>
        <h4 id='earn-soulsmiles'>Would you like to earn soulsmiles for your purchases?</h4>
    </div>`);
    Boundary.appendToBox("#yourBoxOneID", `
    <div>
        <button type='button' class='btn btn-secondary' id='yesButton'>Yes, please!</button>
    </div>`);
    // /* add some silly interaction to box one */
    Boundary.findElemInBox("#noButton", '#yourBoxOneID').click(function() {
        $('#yourBoxOneID').remove();
        setNoTimestamp();
    })
	Boundary.findElemInBox("#yesButton", "#yourBoxOneID").click(function() {
        $('#yourBoxOneID').remove();
        redirectToAffiliate();
    });
}

function setNoTimestamp() {
    var url = new URL(window.location.href);    
    var strippedUrl = url.hostname.indexOf('www.') && url.hostname || url.hostname.replace('www.', '');
    var key = "noTimestamp" + strippedUrl;
    chrome.storage.sync.set({[key]: Date.now()}, function() {
        console.log("New no timestamp for " + strippedUrl + " is " + Date.now());
    });
}

function setURLInsertedTime() {
    var url = new URL(window.location.href);    
    var strippedUrl = url.hostname.indexOf('www.') && url.hostname || url.hostname.replace('www.', '');
    var key = "lastURLInserted" + strippedUrl;
    chrome.storage.sync.set({[key]: Date.now()}, function() {
        console.log("New url inserted timestamp for " + strippedUrl + " is " + Date.now());
    });
}

function redirectToAffiliate() {
    if (window.location.href.includes('amazon.com')) {
        addAmazonTagURL();
    } else {
        const url = chrome.runtime.getURL('affiliates.json');
        fetch(url)
            .then((response) => response.json())
            .then((json) => getAffiliateLink(json));
    }
    setURLInsertedTime();
}

function getAffiliateLink(affiliates) {
    var url = new URL(window.location.href);
    var strippedUrl = url.hostname.indexOf('www.') && url.hostname || url.hostname.replace('www.', '');
    window.location.href = affiliates[strippedUrl];
}

function addAmazonTagURL() {
    if (!window.location.href.includes('tag=soulsmilecl09-20')) {
        var url = new URL(window.location.href)
        url.searchParams.append('tag', 'soulsmilecl09-20')
        window.location.href = url
    }
};