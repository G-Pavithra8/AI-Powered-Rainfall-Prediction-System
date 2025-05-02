import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Signup = ({ onSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = onSignup(email, password);
    if (!success) {
      setError('User already exists. Please login.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
      <form onSubmit={handleSubmit} className="bg-[#1E293B] p-8 rounded-xl shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold text-white mb-6">Sign Up</h2>
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