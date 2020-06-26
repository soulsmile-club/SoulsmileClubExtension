import React from 'react';
import './App.css';
import FacebookIcon from '@material-ui/icons/Facebook';
import MailIcon from '@material-ui/icons/Mail';
import TwitterIcon from '@material-ui/icons/Twitter';
import LinkIcon from '@material-ui/icons/Link';
import Tooltip from '@material-ui/core/Tooltip';

function Share() {

	const [copied, setCopied] = React.useState('Copy link to clipboard.');

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
	            Love using Soul<span id="smile">smile</span> and want to do even more good in the world? Share with your friends over email, Facebook, or Twitter!
	        </div>
	        <div id="shareButtons">
		        <a href="mailto:?to=&body=I've been using Soulsmile to donate portions of my purchases to charity (without spending any extra)! Join me by trying it out at http://www.soulsmile.club. Thanks! :)&subject=Check out Soulsmile Club!"><MailIcon id="icon" fontSize="large" /></a>
		        <a rel="noopener noreferrer" target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fwww.soulsmile.club%2F&amp;src=sdkpreparse" ><FacebookIcon id="icon" fontSize="large" /></a>
		    	<a rel="noopener noreferrer" target="_blank" href="https://twitter.com/share?ref_src=twsrc%5Etfw"><TwitterIcon id="icon" fontSize="large" /></a>
				
				{/* Change link once publicly listed. */}
				<Tooltip title={copied}>
					<a id="copyLink" href="https://chrome.google.com/webstore/detail/soulsmile-club/iikdmahefbhmbconbhnfenejbdilchda?hl=en" onClick={copyToClipboard}>
						<LinkIcon id="icon" fontSize="large" />	
					</a>
				</Tooltip>
	    	</div>
	    </>
    );
}

export default Share;
