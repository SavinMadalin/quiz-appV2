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
  sendPasswordResetEmail, // Import sendPasswordResetEmail
  updateProfile as firebaseUpdateProfile, // Import updateProfile
  deleteUser as firebaseDeleteUser, // Import deleteUser
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { store } from "./redux/store";
import { getStorage } from "firebase/storage"; // Import getStorage
import { logoutUser } from "./redux/userSlice";
import { getVertexAI, getGenerativeModel } from "firebase/vertexai";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
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
export const registerWithEmailAndPassword = async (email, password, name) => {
  // Accept name
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  // Send verification email
  try {
    await firebaseSendEmailVerification(userCredential.user);
    console.log("Verification email sent successfully!");
  } catch (error) {
    console.error("Error sending verification email:", error);
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
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
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
export const resendVerificationEmail = async () => {
  try {
    if (auth.currentUser) {
      await firebaseSendEmailVerification(auth.currentUser);
      console.log("Verification email sent successfully!");
    } else {
      console.error("No authenticated user found.");
    }
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};

// New function to delete the user
export const deleteUser = async () => {
  try {
    await auth.currentUser.delete();
    console.log("User deleted successfully!");
  } catch (error) {
    if (error.code === "auth/requires-recent-login") {
      console.error("User needs to re-authenticate to delete account.");
      throw error; // Re-throw the error to be handled in SettingsPage
    } else {
      console.error("Error deleting user:", error);
      throw error; // Re-throw the error to be handled in SettingsPage
    }
  }
};

export const updateDisplayName = async (displayName) => {
  try {
    await firebaseUpdateProfile(auth.currentUser, { displayName });
    console.log("Display name updated successfully!");
  } catch (error) {
    console.error("Error updating display name:", error);
    throw error;
  }
};

export const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log("Password reset email sent successfully!");
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error; // Re-throw the error to be handled in LoginPage
  }
};

const vertexAI = getVertexAI(app); // Example: us-east1
const storage = getStorage(app); // Initialize storage

// Create a `GenerativeModel` instance with a model that supports your use case
export const model = getGenerativeModel(vertexAI, {
  model: "gemini-2.0-flash-lite-001",
});

export { auth, googleProvider, db, storage };
