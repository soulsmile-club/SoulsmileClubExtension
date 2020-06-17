/*global chrome*/
import React, { useEffect } from 'react';
import './App.css';

function Welcome() {

    useEffect(() => {
        document.getElementById('activate').disabled = false;
        chrome.storage.sync.get(['url', 'isEarning'], function (data) {
            if (!data.url.includes("amazon.com")) {
                document.getElementById('activate').disabled = true;
            }
            if (data.url.includes("amazon.com") && data.isEarning) {
                console.log('is reached for disabled')
                document.getElementById('activate').disabled = true;
            }
        });
    });

    function activateDonations() {
        console.log('activate donations');
        chrome.storage.sync.set({isEarning: true}, function() {
            console.log('This user is earning.');
            document.getElementById('activate').disabled = true;
            chrome.tabs.reload(function() {
                console.log('reloaded');
            });
        });
    }

    return (
        <button id='activate' onClick={activateDonations}>activate donations</button>
    );

}

export default Welcome;
