// src/LoginPage.js
import React, { useState } from 'react';
import { loginWithEmailAndPassword } from './firebase';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from './Navbar';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await loginWithEmailAndPassword(email, password);
      console.log('User logged in successfully!');
      navigate('/'); // Redirect to home page after successful login
    } catch (err) {
      if (err.message === 'auth/email-not-verified') {
        setError('Please verify your email before logging in.'); // Custom error message
      } else {
        setError('Invalid email or password.'); // Generic error message
        console.error('Login failed:', err);
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-light-blue-matte dark:bg-dark-blue-matte text-light-text dark:text-white p-6">
      <div className="bg-white dark:bg-dark-grey p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 border rounded-md bg-light-grey dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 border rounded-md bg-light-grey dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-center">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-500 hover:text-blue-600 underline">
            Register
          </Link>
        </p>
      </div>
      <Navbar />
    </div>
  );
};

export default LoginPage;
