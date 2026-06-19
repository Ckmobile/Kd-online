// Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDhTuYCrOTO8BvvHMqJF-AP9liFXlH8JxA",
  authDomain: "ukonline.firebaseapp.com",
  projectId: "ukonline",
  storageBucket: "ukonline.firebasestorage.app",
  messagingSenderId: "807239150810",
  appId: "1:807239150810:web:188d487a7827aa5af789e3",
  measurementId: "G-1R09KVCHW2"
};



// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();


