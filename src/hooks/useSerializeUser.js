// src/hooks/useSerializeUser.js
const useSerializeUser = () => {
    const serializeUser = (firebaseUser) => {
        if (!firebaseUser) return null;
        return {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || null, // Handle null displayName
            provider: firebaseUser.providerData[0]?.providerId || null, // Handle null provider
            emailVerified: firebaseUser.emailVerified, // Add the emailVerified
        };
    };
    return {serializeUser};
};

export default useSerializeUser;
