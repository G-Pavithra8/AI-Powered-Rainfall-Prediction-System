import './index.css'; // or './App.css' if that's where you put the Tailwind imports
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import TopNav from './components/TopNav';
import MainDashboard from './pages/MainDashboard';
import Login from './pages/Login';
import Signup from './pages/SignUp';
import About from './pages/About';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('userEmail'));
  const navigate = useNavigate();

  // Listen for changes in localStorage (for multi-tab support)
  useEffect(() => {
    const onStorage = () => setIsAuthenticated(!!localStorage.getItem('userEmail'));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Pass these handlers to children
  const handleLogin = (email) => {
    localStorage.setItem('userEmail', email);
    setIsAuthenticated(true);
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    setIsAuthenticated(false);
    navigate('/login');
  };

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
              : <Signup onLogin={handleLogin} />
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