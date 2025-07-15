import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (data.success) {
        onLogin(email); // Use the handler from App.js to update auth state and navigate
      } else {
        setError(data.message || 'Login failed.');
      }
    } catch (err) {
      setError('Server error. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
      <form onSubmit={handleSubmit} className="bg-[#1E293B] p-8 rounded-xl shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold text-white mb-6">Login</h2>
        {error && <div className="text-red-400 mb-2">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-2 rounded bg-[#0F172A] text-white"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 p-2 rounded bg-[#0F172A] text-white"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-bold py-2 rounded transition">
          Login
        </button>
        <p className="text-gray-400 mt-4 text-center">
          Don't have an account? <Link to="/signup" className="text-[#FCD34D]">Sign Up</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;