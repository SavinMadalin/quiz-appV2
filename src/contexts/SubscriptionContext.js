// src/contexts/SubscriptionContext.js
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { useSelector } from "react-redux";
import { db } from "../firebase"; // Import your initialized Firestore instance
import { doc, onSnapshot } from "firebase/firestore";

const SubscriptionContext = createContext(null);

// Helper to check if a subscription status is considered active
const isActiveStatus = (status) => {
  return ["active", "trialing"].includes(status);
};

export const SubscriptionProvider = ({ children }) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState("loading"); // 'loading', 'active', 'inactive', 'past_due', etc.
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useSelector((state) => state.user); // Get user from Redux

  // Memoized refresh function (optional, listener handles most updates)
  const refreshSubscriptionStatus = useCallback(() => {
    console.log("Manual refresh triggered (listener should handle updates)");
  }, []);

  useEffect(() => {
    let unsubscribe = () => {}; // Initialize unsubscribe function

    if (isAuthenticated && user?.uid) {
      setIsLoading(true);
      const docRef = doc(db, "subscriptions", user.uid); // Path to user's subscription doc

      unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const subData = docSnap.data();
            setSubscriptionDetails(subData);
            setSubscriptionStatus(subData.status || "inactive");
            console.log("Firestore subscription update:", subData.status);
          } else {
            setSubscriptionDetails(null);
            setSubscriptionStatus("inactive");
            console.log("No Firestore subscription document found.");
          }
          setIsLoading(false);
        },
        (error) => {
          console.error("Error listening to subscription status:", error);
          setSubscriptionDetails(null);
          setSubscriptionStatus("inactive");
          setIsLoading(false);
        }
      );
    } else {
      // Not authenticated or no user ID
      setSubscriptionDetails(null);
      setSubscriptionStatus("inactive");
      setIsLoading(false);
      unsubscribe(); // Ensure cleanup if user logs out quickly
    }

    // Cleanup: Unsubscribe when component unmounts or dependencies change
    return () => {
      console.log("Unsubscribing from Firestore listener");
      unsubscribe();
    };
  }, [user, isAuthenticated]); // Dependencies: Re-run when user or auth state changes

  const value = {
    subscriptionStatus,
    subscriptionDetails,
    isLoadingStatus: isLoading,
    refreshSubscriptionStatus,
    isPremium: isActiveStatus(subscriptionStatus), // Derived premium state
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

// Custom hook to use the subscription context
export const useSubscription = () => useContext(SubscriptionContext);
