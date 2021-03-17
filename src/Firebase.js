import * as firebase from "firebase/app";

// Add the Firebase services that you want to use
import "firebase/auth";
import "firebase/database";
import "firebase/firestore";

var firebaseConfig = {
    apiKey: "AIzaSyBigQYTouOytX1qhlBmRBIa0g6fHF2_81w",
    authDomain: "soulsmile-club.firebaseapp.com",
    databaseURL: "https://soulsmile-club.firebaseio.com",
    projectId: "soulsmile-club",
    storageBucket: "soulsmile-club.appspot.com",
    messagingSenderId: "310904582055",
    appId: "1:310904582055:web:3d8ee1e910fa9c49221082"
};

firebase.initializeApp(firebaseConfig);

export default firebase;