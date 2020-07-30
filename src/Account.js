import React, { useEffect } from 'react';
import './App.css';
import { makeStyles } from '@material-ui/core/styles';
// import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
import * as firebase from "firebase/app";

// Add the Firebase services that you want to use
import "firebase/auth";
import "firebase/firestore";

const useStyles = makeStyles({
  root: {
    backgroundColor: 'white',
    padding: '5px 5px',
    margin: '5px 0px',
    width: '75%',
    color: '#eda1aa'
},
focused: {
    color: '#eda1aa'
},
label: {
    fontFamily: 'Montserrat !important',
},
button: {
    fontFamily: 'Montserrat !important',
    fontSize: '14px !important',
}
});

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
    const classes = useStyles();
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    const [name, setName] = React.useState('');
    const [username, setUsername] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [photoURL, setPhotoURL] = React.useState('');
    const [isLogin, setIsLogin] = React.useState(true);
    const [isConfirmAccount, setIsConfirmAccount] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState('');
    const [existingEmail, setExistingEmail] = React.useState('');
    const [pendingCred, setPendingCred] = React.useState({});

    useEffect(() => {
        firebase.auth().onAuthStateChanged(function(user) {
            console.log("auth state changed");
            if (user) {
                setName(user.displayName);
                setUsername(user.email);
                if (user.photoURL) {
                    setPhotoURL(user.photoURL + "?type=large");
                } else {
                    setPhotoURL(null);
                }
                setIsLoggedIn(true);
            } else {
                console.log('no user found');
                setIsLoggedIn(false);
            }
        });
    });

    function handleUserLoggedIn (user) {
        setIsLoggedIn(true);
    }

    function confirmPassword() {
        firebase.auth().signInWithEmailAndPassword(existingEmail, password).then(function (result) {
            handleUserLoggedIn(result.user);
            result.user.linkWithCredential(pendingCred);
            console.log("linked");
            setIsConfirmAccount('');
        })
        .catch(function (error) {
            setErrorMessage(error.message);
        });
    }

    function continueWithGoogle() {
        var googProvider = new firebase.auth.GoogleAuthProvider();
        googProvider.setCustomParameters({'login_hint': existingEmail});
        firebase.auth().signInWithPopup(googProvider).then(function(result) {
            handleUserLoggedIn(result.user);
            result.user.linkWithCredential(pendingCred);
            console.log("linked");
            setIsConfirmAccount('');
        })
        .catch(function (error) {
            setErrorMessage(error.message);
        });
    }

    function continueWithFacebook() {
        var fbProvider = new firebase.auth.FacebookAuthProvider();
        fbProvider.setCustomParameters({'login_hint': existingEmail});
        firebase.auth().signInWithPopup(fbProvider).then(function(result) {
            handleUserLoggedIn(result.user);
            result.user.linkWithCredential(pendingCred);
            console.log("linked");
            setIsConfirmAccount('');
        })
        .catch(function (error) {
            setErrorMessage(error.message);
        });
    }

    function handleLoginSignupErrors(error) {
        console.log(error);
        var errorCode = error.code;
        var errorMessage = error.message;
        // Account exists with different credential. To recover both accounts
        // have to be linked but the user must prove ownership of the original
        // account.
        if (errorCode == 'auth/account-exists-with-different-credential') {
            var existingEmail = error.email;
            var pendingCred = error.credential;
            // Lookup existing account’s provider ID.
            firebase.auth().fetchSignInMethodsForEmail(existingEmail)
            .then(function(methods) {
                if (methods[0] === 'password') {
                    // Password account already exists with the same email.
                    // Ask user to provide password associated with that account.
                    setIsConfirmAccount('password');
                    setExistingEmail(existingEmail);
                    setPendingCred(pendingCred);
                } else if (methods[0] == firebase.auth.GoogleAuthProvider.PROVIDER_ID) {
                    // Sign in user to Google with same account.
                    setIsConfirmAccount('google');
                    setExistingEmail(existingEmail);
                    setPendingCred(pendingCred);
                } else if (methods[0] == firebase.auth.FacebookAuthProvider.PROVIDER_ID) {
                    // Sign in user to Facebook with same account.
                    setIsConfirmAccount('facebook');
                    setExistingEmail(existingEmail);
                    setPendingCred(pendingCred);
                }
            });
        } else {
            console.log("Login error " + errorCode + " " + errorMessage);
            setErrorMessage("Error: " + errorMessage + " Please try again.");
        }
    }

    function emailLoginPopup () {
        firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function (user) {
            handleUserLoggedIn(user);
        })
        .catch(handleLoginSignupErrors);
    }

    async function emailSignupPopup () {
        await firebase.auth().createUserWithEmailAndPassword(email, password).then(async function(result) {
            var user = firebase.auth().currentUser;
            await user.updateProfile({
                displayName: name
            }).then(function () {
                // Hacky way to set the name - TODO: user reload
                setName(user.displayName);
                console.log('Email signup with popup');
            })
        })
        .catch(handleLoginSignupErrors);
    }

    function googleLoginPopup () {
        var provider = new firebase.auth.GoogleAuthProvider();

        firebase.auth().signInWithPopup(provider).then(function(result) {
          // This gives you a Google Access Token. You can use it to access the Google API.
          var token = result.credential.accessToken;
          // The signed-in user info.
          var user = result.user;
          setIsLoggedIn(true);
      }).catch(handleLoginSignupErrors);
  }


  function facebookLoginPopup() {
    var provider = new firebase.auth.FacebookAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function(result) {
          // This gives you a Facebook Access Token. You can use it to access the Facebook API.
          var token = result.credential.accessToken;
          // The signed-in user info.
          var user = result.user;
          setIsLoggedIn(true);
      }).catch(handleLoginSignupErrors);
  }

    function loginOrSignup (e) {
        e.preventDefault();
        setIsLogin(!isLogin);
    }

    function signOut () {
        firebase.auth().signOut().then(function() {
            // Sign-out successful.
            setIsLoggedIn(false);
        }).catch(function(error) {
            // An error happened.
        });
    }

    function deleteAccount () {
        firebase.auth().currentUser.delete().then(function() {
          // User deleted.
          console.log("user deleted");
          setIsLoggedIn(false);
        }).catch(function(error) {
          // An error happened.
          console.log(error);
        });
    }

    var logoutButton = (
        <>
        <div className="profile">
        {photoURL ? <img id="photo" src={photoURL} alt={name}></img> : <></>}
        <h1>{name}</h1>
        </div>

        <Button 
        variant='outlined' 
        color='default'
        onClick={signOut}
        classes={{root: classes.root, label: classes.label, button: classes.button}}>
        Log Out
        </Button>

        <Button 
        variant='outlined' 
        color='default'
        onClick={deleteAccount}
        classes={{root: classes.root, label: classes.label, button: classes.button}}>
        Delete Account
        </Button>
        </>
    );

    var confirmPassword = (
        <>
        <div id="message">You already have an existing Soulsmile Club account associated with this email address. Please enter the password below to complete login.</div>

        <TextField 
        id="outlined-secondary"
        label="Password"
        type="password"
        value={password} 
        classes={{root: classes.root, label: classes.label, focused: classes.focused}}
        onChange={e => setPassword(e.target.value)}
        variant="outlined" 
        />

        <Button 
        variant='outlined' 
        color='default'
        onClick={confirmPassword}
        classes={{root: classes.root, label: classes.label, button: classes.button}}>
        Login
        </Button>
        <div id="error" hidden={!errorMessage}>{errorMessage}</div>
        </>
    );

    var continueGoogle = (
        <>
        <div id="message">You already have a Soulsmile Club account associated with this email address, created with Google authentication. Please login through Google to continue.</div>

        <Button 
        variant='outlined' 
        color='default'
        onClick={continueWithGoogle}
        classes={{root: classes.root, label: classes.label, button: classes.button}}>
        Continue with Google
        </Button>
        <div id="error" hidden={!errorMessage}>{errorMessage}</div>
        </>
    );

    var continueFacebook = (
        <>
        <div id="message">You already have a Soulsmile Club account associated with this email address, created with Facebook authentication. Please login through Facebook to continue.</div>

        <Button 
        variant='outlined' 
        color='default'
        onClick={continueWithFacebook}
        classes={{root: classes.root, label: classes.label, button: classes.button}}>
        Continue with Facebook
        </Button>
        <div id="error" hidden={!errorMessage}>{errorMessage}</div>
        </>
    );

    var signupButtons = (
        <div id="container">
        <Button id='googleLoginButton' 
        variant='outlined' 
        color='default'
        onClick={googleLoginPopup}
        classes={{root: classes.root, label: classes.label, button: classes.button}}>
        Sign up with Google
        </Button>
        <Button id='facebookLoginButton' 
        variant='outlined' 
        color='default'
        onClick={facebookLoginPopup}
        classes={{root: classes.root, label: classes.label, button: classes.button}}>
        Sign up with Facebook
        </Button>
        <hr/>
        <form autoComplete="off">
        <TextField 
        id="outlined-secondary"
        label="Name"
        type="text"
        value={name} 
        onChange={e => setName(e.target.value)}
        classes={{root: classes.root, label: classes.label, focused: classes.focused}}
        variant="outlined" 
        />
        <TextField 
        id="outlined-secondary"
        label="Email"
        type="text"
        value={email} 
        onChange={e => setEmail(e.target.value)}
        classes={{root: classes.root, label: classes.label, focused: classes.focused}}
        variant="outlined" 
        />
        <TextField 
        id="outlined-secondary"
        label="Password"
        type="password"
        value={password} 
        classes={{root: classes.root, label: classes.label, focused: classes.focused}}
        onChange={e => setPassword(e.target.value)}
        variant="outlined" 
        />
        <Button 
        variant='outlined' 
        color='default'
        onClick={emailSignupPopup}
        classes={{root: classes.root, label: classes.label, button: classes.button}}>
        Sign up with Email
        </Button>
        </form>
        <div id="error" hidden={!errorMessage}>{errorMessage}</div>
        <div>Have an account already? Log in <a id="loginOrSignup" onClick={loginOrSignup}>here</a>.</div>
        </div>
        );

    var loginButtons = (
        <div id = "container">
        <Button id='googleLoginButton' 
        variant='outlined' 
        color='default'
        onClick={googleLoginPopup}
        classes={{root: classes.root, label: classes.label, button: classes.button}}>
        Login with Google
        </Button>
        <Button id='facebookLoginButton' 
        variant='outlined' 
        color='default'
        onClick={facebookLoginPopup}
        classes={{root: classes.root, label: classes.label, button: classes.button}}>
        Login with Facebook
        </Button>
        <hr/>
        <form autoComplete="off">
        <TextField 
        id="outlined-secondary"
        label="Email"
        type="text"
        value={email} 
        onChange={e => setEmail(e.target.value)}
        classes={{root: classes.root, label: classes.label, focused: classes.focused}}
        variant="outlined" 
        />
        <TextField 
        id="outlined-secondary"
        label="Password"
        type="password"
        value={password} 
        classes={{root: classes.root, label: classes.label, focused: classes.focused}}
        onChange={e => setPassword(e.target.value)}
        variant="outlined" 
        />
        <Button 
        variant='outlined' 
        color='default'
        onClick={emailLoginPopup}
        classes={{root: classes.root, label: classes.label, button: classes.button}}>
        Login with Email
        </Button>
        </form>
        <div id="error" hidden={!errorMessage}>{errorMessage}</div>
        <div>Don't have an account yet? Sign up <a id="loginOrSignup" onClick={loginOrSignup}>here</a>.</div>
        </div>
        );

    return (
        <>
        <div id="soul">Your Account</div>
        {isLoggedIn ? logoutButton : ((isConfirmAccount == 'password') ? confirmPassword :
                                      (isConfirmAccount == 'google') ? continueGoogle :
                                      (isConfirmAccount == 'facebook') ? continueFacebook :
                                      (isLogin ? loginButtons : signupButtons)) }
        </>
        );
}

export default Account;
