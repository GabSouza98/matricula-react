import { createContext, useContext, useEffect, useState } from "react";
import { auth } from '../firebase'
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    signInWithPopup,
  } from "firebase/auth";

const authContext = createContext();

export function AuthContextProvider({ children }) {
    const [user, setUser] = useState({});

    function logIn(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    function signUp(email, password) {
        return createUserWithEmailAndPassword(auth, email, password);
    }

    function logOut() {
        return signOut(auth);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentuser) => {
          console.log("Auth", currentuser);
          setUser(currentuser);
        });
    
        return () => {
          unsubscribe();
        };
    }, []);
  
    return (
      <authContext.Provider
        value={{ user, logIn, signUp, logOut }}
      >
        {children}
      </authContext.Provider>
    );
}


export function useAuth() {
    return useContext(authContext);
}