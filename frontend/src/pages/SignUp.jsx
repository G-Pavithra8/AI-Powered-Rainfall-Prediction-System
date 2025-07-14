import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Signup = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await fetch('http://localhost:5001/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (data.success) {
        onLogin(email); // Automatically log in and redirect after signup
      } else {
        setError(data.message || 'Sign up failed.');
      }
    } catch (err) {
      setError('Server error. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
      <form onSubmit={handleSubmit} className="bg-[#1E293B] p-8 rounded-xl shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold text-white mb-6">Sign Up</h2>
        {error && <div className="text-red-400 mb-2">{error}</div>}
        {success && <div className="text-green-400 mb-2">{success}</div>}
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
          Sign Up
        </button>
        <p className="text-gray-400 mt-4 text-center">
          Already have an account? <Link to="/login" className="text-[#FCD34D]">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;