// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  sendEmailVerification as firebaseSendEmailVerification,
  updateProfile,
  updateProfile as firebaseUpdateProfile, // Import updateProfile
  deleteUser as firebaseDeleteUser, // Import deleteUser
} from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import { store } from "./redux/store";
import { logoutUser } from "./redux/userSlice";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCSYD_JqZTgvJQFqEcx1R_Ex_sm5wExwNw",
  authDomain: "myproject-6969b.firebaseapp.com",
  projectId: "myproject-6969b",
  storageBucket: "myproject-6969b.firebasestorage.app",
  messagingSenderId: "902764868157",
  appId: "1:902764868157:web:0a907554951dedf4c5f054"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase Authentication
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Firestore Database
const db = getFirestore(app);

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);

// New functions for email/password registration and login
export const registerWithEmailAndPassword = async (email, password, name) => { // Accept name
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  // Send verification email
  try {
    await firebaseSendEmailVerification(userCredential.user);
    console.log('Verification email sent successfully!');
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
  // Update user profile with name
  if (name) {
    await updateProfile(userCredential.user, {
      displayName: name,
    });
  }
  // Sign in the user automatically
  await signInWithEmailAndPassword(auth, email, password);
  return userCredential; // Return the userCredential
};

export const loginWithEmailAndPassword = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user; // Return the user
};

// New function to check if email exists
export const checkIfEmailExists = async (email) => {
  try {
    const methods = await fetchSignInMethodsForEmail(auth, email);
    return methods.length > 0; // Returns true if email exists, false otherwise
  } catch (error) {
    console.error("Error checking email existence:", error);
    return false; // Assume email doesn't exist on error
  }
};

export const logout = async () => {
  await signOut(auth);
  store.dispatch(logoutUser());
};

export const onAuthStateChangedListener = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// New function to send the verification email again
export const resendVerificationEmail = async (user) => {
  try {
    await firebaseSendEmailVerification(user);
    console.log('Verification email sent successfully!');
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

// New function to delete the user
export const deleteUser = async () => {
  try {
    await auth.currentUser.delete();
    console.log('User deleted successfully!');
  } catch (error) {
    if (error.code === 'auth/requires-recent-login') {
            console.error('User needs to re-authenticate to delete account.');
            throw error; // Re-throw the error to be handled in SettingsPage
          } else {
            console.error('Error deleting user:', error);
            throw error; // Re-throw the error to be handled in SettingsPage
          }
  }
};

export const updateDisplayName = async (displayName) => {
    try {
      await firebaseUpdateProfile(auth.currentUser, { displayName });
      console.log('Display name updated successfully!');
    } catch (error) {
      console.error('Error updating display name:', error);
      throw error;
    }
  };

export { auth, googleProvider, db };
