/*global chrome*/
import React, { useEffect } from 'react';
import { Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import './App.css';

// CSS for activate Button
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

/*
 * Main home page of extension that displays whether you are currently on a website you can/are earning soulsmiles with, 
 * has button to start earning soulsmiles if possible
*/
function Welcome() {

    const classes = useStyles();

    // isPartnerSite is true if the current URL is one of our partner sites, false otherwise
    const [isPartnerSite, setIsPartnerSite] = React.useState(false);

    // isActivated is true if we are already earning soulsmiles on this site (and affiliate link has been inserted within 24 hours), false otherwise
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

    /*
     * Strips full-length URL to just domain name, with no http, www, or parameters (e.g. just amazon.com)
     * @param urlString: string containing full URL of current website
     * @return: string of stripped URL
    */
    function stripURL(urlString) {
        var url = new URL(urlString);

        // gets hostname from URL and strips it of www. (if it exists)
        var strippedUrl = url.hostname.indexOf('www.') && url.hostname || url.hostname.replace('www.', '');
        
        // removes any prefixes to only include last 2 portions of hostname (e.g. buy.logitech.com --> logitech.com)
        var splitUrl = strippedUrl.split(".");
        return splitUrl[splitUrl.length-2] + "." + splitUrl[splitUrl.length-1];
    }

    /*
     * Checks if current URL is one of our partner sites and sets isPartnerSite accordingly
     * @param strippedURL: domain name of current URL
    */
    function checkIfPartnerSite(strippedUrl) {
        // gets affiliates JSON file to read and check if contains current domain name
        const url = chrome.runtime.getURL('affiliates.json');
        fetch(url)
            .then((response) => response.json())
            .then((json) => checkAgainstAllPartners(json, strippedUrl));
    }

    /*
     * Helper function for checkIfPartnerSite, reads affiliates JSON file and sets isPartnerSite based on results
     * @param affiliates: affiliates JSON containing mapping from domain name to affiliate link
     * @param url: current stripped URL (domain name) of page we are on
    */
    function checkAgainstAllPartners(affiliates, url) {
        // check if we are on Amazon (because it is not be included in affiliates.json due to special case with tags)
        if (url.includes("amazon.com")) {
            setIsPartnerSite(true);
            return;
        }

        // otherwise, check if url contains any of the domain name keys in affiliates.json
        for (var key in affiliates) {
            if (url.includes(key)) {
                // if URL has one of the affiliate domain names, set isPartnerSite to true
                setIsPartnerSite(true);
                return;
            }
        }

        // if no affiliate domain names match, leave isPartnerSite as false
    }

    /*
     * Function that is triggered when "earn soulsmiles" button is clicked
     * Redirects current website to affiliate URL and sets lastURLInserted to current timestamp
    */
    function activateDonations() {
        console.log('activate donations');
        chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
            function(tabs) {
                // get URL of current tab
                var url = tabs[0].url;
                var id = tabs[0].id;
                var strippedUrl = stripURL(tabs[0].url);
                var key = "lastURLInserted" + strippedUrl;

                // set lastURLInserted to current timestamp
                chrome.storage.sync.set({[key]: Date.now()}, function() {
                    console.log("New timestamp for " + strippedUrl + " is " + Date.now());
                    // set isActivated to be true so browser Welcome page can update properly
                    setIsActivated(true);

                    // redirects to affiliate link by inserting Amazon tag or getting URL from affiliates.json
                    if (url.includes('amazon.com')) {
                        addAmazonTagURL(url, id);
                    } else {
                        const affiliatesURL = chrome.runtime.getURL('affiliates.json');
                        fetch(affiliatesURL)
                            .then((response) => response.json())
                            .then((json) => getAffiliateLink(url, id, json));
                    }
                });
            }
        );
    }

    /* 
     * Inserts Amazon-specific soulsmile affiliate tag to current URL
     * @param url: string of current URL
     * @param tabId: id number of tab we need to redirect with tag
    */
    function addAmazonTagURL(url, tabId) {
        if (!url.includes('tag=soulsmilecl09-20') 
            && !url.includes('tag=soulsmileclubblm-20')
            && !url.includes('tag=soulsmileclubcovid-20')
            && !url.includes('tag=soulsmileclubswe-20')) {
            // add soulsmilecl09-20 tag as a parameter to current URL
            var newURL = new URL(url)
            newURL.searchParams.append('tag', 'soulsmilecl09-20')

            // redirect correct tab to new URL with tag
            chrome.tabs.update(tabId, {url: newURL.toString()});
        } else {
            // do not insert if the user has already just clicked one of our affiliate links from the soulsmile website, just reload page to show notification
            chrome.tabs.reload(function (data) {
                console.log("Page reload for adding amazon tag");
            })
        }
    }

    /* 
     * Reads affiliates JSON and redirects to the affiliate link of the website we are currently on
     * @param affiliates: JSON (read from public/affiliates.json) containing mapping of domain names to affiliate links
    */
    function getAffiliateLink(url, tabId, affiliates) {
        var strippedUrl = stripURL(url);
        chrome.tabs.update(tabId, {url: affiliates[strippedUrl].toString()});
    }

    // "earn soulsmiles" button that should show up only if we are on an eligible site that is not currently activated
    var activateButton = (
        <div id='activateButton'>
            <Button id='activate' 
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

    // checkmark animation that should only show up when on a partner site that is activated
    var checkmark = (
        <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"><circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/><path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/></svg>
    );

    // set message that should appear based on whether or not we are on an activated/deactivated partner/non-partner site
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
        <div id="disclosure">
            <b>Disclosure:</b> As an Amazon Associate and an affiliate of other brands, 
            Soulsmile Club earns a commission from qualifying purchases. However, instead of 
            keeping the commission, we donate all of it to causes listed on <a href="https://www.soulsmile.club" target="_blank" rel="noopener noreferrer">our website</a>.
        </div>
    );

    var nothing;

    return (
        <>
        <div id='soul'>soul<span id='smile'>smile</span> club</div>
        {message}
        {isActivated ? checkmark : activateButton}
        {isPartnerSite ? disclosure : nothing}
        </>
    );

}

export default Welcome;
