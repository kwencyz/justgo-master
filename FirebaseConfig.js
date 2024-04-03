// Import the functions you need from the SDKs you need
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAVnOcInpoWbSU1EO7Vh5B4dE_iWL2uSko",
  authDomain: "justgoapp-575cd.firebaseapp.com",
  databaseURL: "https://justgoapp-575cd-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "justgoapp-575cd",
  storageBucket: "justgoapp-575cd.appspot.com",
  messagingSenderId: "421924935835",
  appId: "1:421924935835:web:911cd2029b259b2ce98e3e",
  measurementId: "G-R1EQGWBTDD"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Initialize Cloud Firestore and get a reference to the service
export const FIRESTORE = getFirestore(FIREBASE_APP);