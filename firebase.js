// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirebase} from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC9wiV47BsdD0MCaPIWnWQRiDgsjoM9W4c",
  authDomain: "flashcard-saas-cbadc.firebaseapp.com",
  projectId: "flashcard-saas-cbadc",
  storageBucket: "flashcard-saas-cbadc.appspot.com",
  messagingSenderId: "40189461019",
  appId: "1:40189461019:web:d601056d704ec12322aebe"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirebase(app);
export {db};