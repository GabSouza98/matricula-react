import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "-",
  authDomain: "-",
  databaseURL: "-",
  projectId: "-",
  storageBucket: "-",
  messagingSenderId: "-",
  appId: "-"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;