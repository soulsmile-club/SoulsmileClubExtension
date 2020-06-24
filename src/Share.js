import React from 'react';
import './App.css';
import FacebookIcon from '@material-ui/icons/Facebook';
import MailIcon from '@material-ui/icons/Mail';
import TwitterIcon from '@material-ui/icons/Twitter';

function Share() {
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
	    	</div>
	    </>
    );
}

export default Share;
