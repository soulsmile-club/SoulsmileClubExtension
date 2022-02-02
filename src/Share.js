import React from 'react';
import './App.css';
import FacebookIcon from '@material-ui/icons/Facebook';
import MailIcon from '@material-ui/icons/Mail';
import TwitterIcon from '@material-ui/icons/Twitter';
import LinkIcon from '@material-ui/icons/Link';
import Tooltip from '@material-ui/core/Tooltip';

/*
 * Share page to allow user to share Soulsmile on social media, email, or copy/paste link
*/
function Share() {

	// value for text that should appear when hovering over copy text
	const [copied, setCopied] = React.useState('Copy link to clipboard.');

	/*
	 * Sets event listener to copy chrome extension link to clipboard and change copy text when copy button is clicked
	*/
	function copyToClipboard() {
		var url = document.getElementById("copyLink").href;
		document.addEventListener("copy", function(e) {
			e.clipboardData.setData("text/plain", url);
			e.preventDefault();
		}, true);
		document.execCommand("copy");
		setCopied("Copied link to clipboard!");
	};

    return (
    	<>
	        <div id="soul">Share with Friends</div>
	        <div id = "message">
	            Love using Soulsmile and want to do even more good in the world? Share with your friends to increase your impact!
	        </div>
	        <div id="shareButtons">
		        <a href="mailto:?to=&body=I've been using Soulsmile to donate portions of my purchases to charity (without spending any extra)! Join me by downloading the extension at http://tiny.cc/soulsmile-extension, or learn more at http://www.soulsmile.club. Thanks! :)&subject=Check out Soulsmile Club!"><MailIcon id="icon" fontSize="large" /></a>
		        <a rel="noopener noreferrer" target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fsoulsmile-club%2Fiikdmahefbhmbconbhnfenejbdilchda%3Fhl%3Den&amp;src=sdkpreparse" ><FacebookIcon id="icon" fontSize="large" /></a>
		    	<a rel="noopener noreferrer" target="_blank" href="https://twitter.com/share?ref_src=twsrc%5Etfw"><TwitterIcon id="icon" fontSize="large" /></a>
				
				{/* Change link once publicly listed. */}
				<Tooltip title={copied}>
					<a id="copyLink" href="https://chrome.google.com/webstore/detail/soulsmile-club/iikdmahefbhmbconbhnfenejbdilchda?hl=en" onClick={copyToClipboard}>
						<LinkIcon id="icon" fontSize="large" />	
					</a>
				</Tooltip>
	    	</div>
	    	<div id="learnMore">
	    		<div>Learn more: <a href="https://www.soulsmile.club" target="_blank" rel="noopener noreferrer">www.soulsmile.club</a></div>
	    		<div>Give us feedback: <a href="https://tiny.cc/soulsmile-feedback" target="_blank" rel="noopener noreferrer">tiny.cc/soulsmile-feedback</a></div>
	    		<div><a href="https://www.soulsmile.club/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a></div>
	    	</div>
	    </>
    );
}

export default Share;
