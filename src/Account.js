import React, { useEffect } from 'react';
import './App.css';

// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
import * as firebase from "firebase/app";

// Add the Firebase services that you want to use
import "firebase/auth";
import "firebase/firestore";

import { Button } from '@material-ui/core';

var firebaseConfig = {
	    apiKey: process.env.REACT_APP_API_KEY,
	    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
	    databaseURL: process.env.REACT_APP_DATABASE_URL,
	    projectId: process.env.REACT_APP_PROJECT_ID,
	    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
	    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
	    appId: process.env.REACT_APP_APP_ID
};
	
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
console.log('Initialized firebase app');

/*
 * Account page to register/login and show Soulsmile account, wallet, giving history, and ability to allocate soulsmiles
 * TODO: Add login and account functionality
*/
function Account() {

		const [isLoggedIn, setIsLoggedIn] = React.useState(false);
		const [name, setName] = React.useState('');
		const [email, setEmail] = React.useState('');
		const [photoURL, setPhotoURL] = React.useState('');

    useEffect(() => {
			firebase.auth().onAuthStateChanged(function(user) {
				if (user) {
					console.log(user);
					setName(user.displayName);
					setEmail(user.email);
					setPhotoURL(user.photoURL + "?type=large");
					setIsLoggedIn(true);
				} else {
					console.log('no user found');
					setIsLoggedIn(false);
				}
			});
    });

	function googleLoginPopup () {
		var provider = new firebase.auth.GoogleAuthProvider();

		firebase.auth().signInWithPopup(provider).then(function(result) {
		  // This gives you a Google Access Token. You can use it to access the Google API.
		  var token = result.credential.accessToken;
		  // The signed-in user info.
		  var user = result.user;
		  setIsLoggedIn(true);
		}).catch(function(error) {
		  // Handle Errors here.
		  var errorCode = error.code;
		  var errorMessage = error.message;
		  // The email of the user's account used.
		  var email = error.email;
		  // The firebase.auth.AuthCredential type that was used.
		  var credential = error.credential;
		  // ...
		});
	}


	function facebookLoginPopup() {
		var provider = new firebase.auth.FacebookAuthProvider();
		firebase.auth().signInWithPopup(provider).then(function(result) {
		  // This gives you a Facebook Access Token. You can use it to access the Facebook API.
		  var token = result.credential.accessToken;
		  // The signed-in user info.
			var user = result.user;
			console.log(user);
		  setIsLoggedIn(true);
		}).catch(function(error) {
			console.log(error);
		  // Handle Errors here.
		  var errorCode = error.code;
		  var errorMessage = error.message;
		  // The email of the user's account used.
		  var email = error.email;
		  // The firebase.auth.AuthCredential type that was used.
		  var credential = error.credential;
		});
	}

	// NOTE: Add code below when implementing login with email
	// // Step 1.
	// // User tries to sign in to Google.
	// auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).catch(function(error) {
	//   // An error happened.
	//   if (error.code === 'auth/account-exists-with-different-credential') {
	//     // Step 2.
	//     // User's email already exists.
	//     // The pending Google credential.
	//     var pendingCred = error.credential;
	//     // The provider account's email address.
	//     var email = error.email;
	//     // Get sign-in methods for this email.
	//     auth.fetchSignInMethodsForEmail(email).then(function(methods) {
	//       // Step 3.
	//       // If the user has several sign-in methods,
	//       // the first method in the list will be the "recommended" method to use.
	//       if (methods[0] === 'password') {
	//         // Asks the user their password.
	//         // In real scenario, you should handle this asynchronously.
	//         var password = promptUserForPassword(); // TODO: implement promptUserForPassword.
	//         auth.signInWithEmailAndPassword(email, password).then(function(user) {
	//           // Step 4a.
	//           return user.linkWithCredential(pendingCred);
	//         }).then(function() {
	//           // Google account successfully linked to the existing Firebase user.
	//           goToApp();
	//         });
	//         return;
	//       }
	//       // All the other cases are external providers.
	//       // Construct provider object for that provider.
	//       // TODO: implement getProviderForProviderId.
	//       var provider = getProviderForProviderId(methods[0]);
	//       // At this point, you should let the user know that they already has an account
	//       // but with a different provider, and let them validate the fact they want to
	//       // sign in with this provider.
	//       // Sign in to provider. Note: browsers usually block popup triggered asynchronously,
	//       // so in real scenario you should ask the user to click on a "continue" button
	//       // that will trigger the signInWithPopup.
	//       auth.signInWithPopup(provider).then(function(result) {
	//         // Remember that the user may have signed in with an account that has a different email
	//         // address than the first one. This can happen as Firebase doesn't control the provider's
	//         // sign in flow and the user is free to login using whichever account they own.
	//         // Step 4b.
	//         // Link to Google credential.
	//         // As we have access to the pending credential, we can directly call the link method.
	//         result.user.linkAndRetrieveDataWithCredential(pendingCred).then(function(usercred) {
	//           // Google account successfully linked to the existing Firebase user.
	//           goToApp();
	//         });
	//       });
	//     });
	//   }
	// });

		function signOut () {
			firebase.auth().signOut().then(function() {
				// Sign-out successful.
				setIsLoggedIn(false);
			}).catch(function(error) {
				// An error happened.
			});
		}

		var logoutButton = (
			<>
				<div className="profile">
					<img id="photo" src={photoURL} alt={name}></img>
					<h1>{name}</h1>
				</div>
				
				<Button id='logoutButton' 
						variant='contained' 
						color='default' 
						onClick={signOut}>
						Log Out
				</Button>
			</>
		);

    var loginButtons = (
    	<div>
    	<Button id='googleLoginButton' 
                variant='contained' 
                color='default' 
                onClick={googleLoginPopup}
            >
                Login with Google
        </Button>
        <Button id='facebookLoginButton' 
                variant='contained' 
                color='default' 
                onClick={facebookLoginPopup}
            >
                Login with Facebook
        </Button>
        </div>
    );

    return (
    	<>
	        <div id="soul">Your Account</div>
            {firebase.auth().currentUser ? logoutButton : loginButtons}
	    </>
    );
}

export default Account;
