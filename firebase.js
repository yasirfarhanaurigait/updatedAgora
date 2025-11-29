
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBm-GlFZiBBCYLbVz38x2NR8CTuz1r_ayg",
  authDomain: "reactjs-68f31.firebaseapp.com",
  projectId: "reactjs-68f31",
  storageBucket: "reactjs-68f31.appspot.com",
  messagingSenderId: "593278956298",
  appId: "1:593278956298:web:ed077379c4f4b8a02d00f3",
  measurementId: "G-JJ5WVR64JC"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);