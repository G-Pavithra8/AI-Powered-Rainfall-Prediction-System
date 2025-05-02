import './index.css'; // or './App.css' if that's where you put the Tailwind imports
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import TopNav from './components/TopNav';
import MainDashboard from './pages/MainDashboard';
import Login from './pages/Login';
import Signup from './pages/SignUp';
import About from './pages/About';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users, setUsers] = useState([]); // [{email, password}]

  const handleLogin = (email, password) => {
    // Check if user exists
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleSignup = (email, password) => {
    // Check if user already exists
    if (users.find(u => u.email === email)) {
      return false; // User already exists
    }
    setUsers([...users, { email, password }]);
    setIsAuthenticated(true);
    return true;
  };

  const handleLogout = () => setIsAuthenticated(false);

  return (
    <>
      {isAuthenticated && window.location.pathname !== '/about' && (
        <TopNav onLogout={handleLogout} />
      )}
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated
              ? <Navigate to="/" />
              : <Login onLogin={handleLogin} />
          }
        />
        <Route
          path="/signup"
          element={
            isAuthenticated
              ? <Navigate to="/" />
              : <Signup onSignup={handleSignup} />
          }
        />
        <Route path="/about" element={<About />} />
        <Route
          path="/"
          element={
            isAuthenticated
              ? <MainDashboard />
              : <Navigate to="/login" />
          }
        />
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/" : "/login"} />}
        />
      </Routes>
    </>
  );
}

export default App;