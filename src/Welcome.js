/*global chrome*/
import React, { useEffect } from 'react';
import { Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import './App.css';

const useStyles = makeStyles({
    root: {
      background: '#444444',
      fontSize: '14px !important',
    },
    contained: {
      color: '#444444',
      fontFamily: 'Montserrat',
      fontSize: '14px !important',
    },
  });

function Welcome() {

    const classes = useStyles();
    const [isPartnerSite, setIsPartnerSite] = React.useState(false);
    const [isActivated, setIsActivated] = React.useState(false);

    useEffect(() => {
        chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
            function(tabs) {
                var strippedUrl = stripURL(tabs[0].url);
                chrome.storage.sync.get(['lastURLInserted' + strippedUrl], function (data) {
                    checkIfPartnerSite(strippedUrl);
                    if (data["lastURLInserted" + strippedUrl] && (Date.now() - data["lastURLInserted" + strippedUrl] < 86400000)) {
                        // current website is partner site and has already been activated within 24 hrs
                        setIsActivated(true);
                    }
                });
            }
        );
    });

    function stripURL(urlString) {
        var url = new URL(urlString);
        var strippedUrl = url.hostname.indexOf('www.') && url.hostname || url.hostname.replace('www.', '');
        var splitUrl = strippedUrl.split(".");
        return splitUrl[splitUrl.length-2] + "." + splitUrl[splitUrl.length-1];
    }

    function checkIfPartnerSite(strippedUrl) {
        const url = chrome.runtime.getURL('affiliates.json');
        fetch(url)
            .then((response) => response.json())
            .then((json) => checkAgainstAllPartners(json, strippedUrl));
    }

    function checkAgainstAllPartners(affiliates, url) {
        if (url.includes("amazon.com")) {
            setIsPartnerSite(true);
            return;
        }
        for (var key in affiliates) {
            if (url.includes(key)) {
                setIsPartnerSite(true);
                return;
            }
        }
    }

    function activateDonations() {
        console.log('activate donations');
        chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
            function(tabs) {
                var strippedUrl = stripURL(tabs[0].url);
                var key = "lastURLInserted" + strippedUrl;
                chrome.storage.sync.set({[key]: Date.now(), reload: true}, function() {
                    console.log("New timestamp for " + strippedUrl + " is " + Date.now());
                    setIsActivated(true);
                    chrome.tabs.reload(function() {
                        console.log('reloaded');
                    });
                });
            }
        );
    }

    var activateButton = (
        <div id='activateButton'>
            <Button id='activate' 
            // should be deactivated ??
                disabled={!isPartnerSite || (isPartnerSite && isActivated)}
                variant='contained' 
                color='default' 
                onClick={activateDonations}
                classes={{
                    root: classes.button, 
                    label: classes.label, 
                    contained: classes.contained, 
                    textSecondary: classes.textSecondary
                }}
            >
                Earn Soulsmiles
            </Button>
        </div>
    );

    var checkmark = (
        <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"><circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/><path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/></svg>
    );

    var message;
    if (!isPartnerSite) {
        message = (
            <div id ="message">Sorry, this site is not one of our partner sites! See all of our partners <a href="https://www.soulsmile.club" target="_blank" rel="noopener noreferrer">here</a>.</div>
        );
    } else if (isActivated) {
        message = (
            <div id="message">Thank you for using Soulsmile Club! You are currently earning soulsmiles for this site.</div>
        );
    } else {
        message = (
            <div id="message">Click the button below to start earning soulsmiles for your purchases on this site!</div>
        );
    }

    var disclosure = (
        <div>
            <h3>Disclosure:</h3>
            <p id="disclosure">As an Amazon Associate and an affiliate of other brands, 
            Soulsmile Club earns a commission from qualifying purchases. However, instead of 
            keeping the commission, we donate all of it to causes listed below.</p>
        </div>
    );

    var privacyPolicy = (
        <div>
            <p id="disclosure">Link to our privacy policy is <a href="https://www.soulsmile.club/blog/privacy-policy" target="_blank" rel="noopener noreferrer"> here</a>.</p>
        </div>
    );

    return (
        <>
        <div id='soul'>soul<span id='smile'>smile</span> club</div>
        {message}
        {disclosure}
        {isActivated ? checkmark : activateButton}
        {privacyPolicy}
        </>
    );

}

export default Welcome;
