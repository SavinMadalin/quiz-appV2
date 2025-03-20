// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client'; // Import the new root API
import './index.css'; // Your global styles
import { Provider } from 'react-redux';
import { store } from './redux/store'; // Your Redux store
import App from './App';

// Create a root element and render the app using the new API
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
