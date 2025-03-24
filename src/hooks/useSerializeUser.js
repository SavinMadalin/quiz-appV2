// src/hooks/useSerializeUser.js
const useSerializeUser = () => {
    const serializeUser = (firebaseUser) => {
      if (!firebaseUser) return null;
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        emailVerified: firebaseUser.emailVerified, // Ensure this is included
        photoURL: firebaseUser.photoURL,
      };
    };
  
    return { serializeUser };
  };
  
  export default useSerializeUser;
