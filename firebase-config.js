const firebaseConfig = {
  apiKey: "AIzaSyAzC12vNtk6gmBKeIrXhRsKu6rFQepojsc",
  authDomain: "itemshop-146f3.firebaseapp.com",
  projectId: "itemshop-146f3",
  storageBucket: "itemshop-146f3.firebasestorage.app",
  messagingSenderId: "678429795030",
  appId: "1:678429795030:web:1d36b025b9c6319f139f77"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
