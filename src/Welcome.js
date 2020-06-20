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
    const [disabled, setDisabled] = React.useState(false);

    useEffect(() => {
        chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
            function(tabs) {
                const url = tabs[0].url;
                chrome.storage.sync.get(['isEarning'], function (data) {
                    if (!url.includes("amazon.com")) {
                        setDisabled(true);
                    } else if (url.includes("amazon.com") && data.isEarning) {
                        setDisabled(true);
                    }
                });
                chrome.storage.sync.set({url: url}, function () {
                    console.log('set url');
                });
            }
        );
    });

    function activateDonations() {
        console.log('activate donations');
        chrome.storage.sync.set({isEarning: true}, function() {
            console.log('This user is earning.');
            setDisabled(true);
            chrome.tabs.reload(function() {
                console.log('reloaded');
            });
        });
    }

    return (
        <>
        <h1 id='soul'>soul<span id='smile'>smile</span> club</h1>
        <div id='activateButton'>
            <Button id='activate' 
                disabled={disabled}
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
                Activate Donations
            </Button>
        </div>
        {/* <button id='activate' onClick={activateDonations}></button> */}
        </>
    );

}

export default Welcome;
