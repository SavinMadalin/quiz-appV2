// src/App.js (or index.js where you have your Redux Provider)
import React from "react"; // Make sure React is imported
import { Provider } from "react-redux"; // Assuming you use Provider here
import { store } from "./redux/store"; // <-- Use named import
import AppContent from "./AppContent"; // Create a new component for the main App logic
import { BrowserRouter as Router } from "react-router-dom";

// --- Stripe Imports ---
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

// --- Subscription Context Import ---
import { SubscriptionProvider } from "./contexts/SubscriptionContext";

// Load Stripe with your publishable key from .env
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function App() {
  return (
    <Provider store={store}>
      {/* Wrap with Elements provider */}
      <Elements stripe={stripePromise}>
        {/* Wrap with SubscriptionProvider */}
        <SubscriptionProvider>
          {/* Move existing App logic into AppContent */}
          <Router>
            <AppContent />
          </Router>
        </SubscriptionProvider>
      </Elements>
    </Provider>
  );
}

export default App;
