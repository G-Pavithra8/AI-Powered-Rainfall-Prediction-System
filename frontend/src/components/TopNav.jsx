import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TopNav = ({ onLogout }) => {
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const handleAbout = () => {
    navigate('/about');
  };

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    setShowPopup(false);
    navigate('/login');
  };

  return (
    <nav className="w-full bg-[#1E293B] px-4 py-3 flex items-center justify-between shadow-md">
      <span className="text-2xl font-bold text-[#10B981]">RainPredict</span>
      <div className="flex items-center gap-4">
        <button
          onClick={handleAbout}
          className="text-[#FCD34D] font-medium px-4 py-1 rounded transition hover:bg-[#FCD34D] hover:text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#FCD34D] focus:ring-offset-2"
        >
          About
        </button>
        <button
          onClick={() => setShowPopup(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded transition"
        >
          Logout
        </button>
      </div>
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow-lg text-center">
            <p className="mb-4 text-lg">Are you sure you want to logout?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowPopup(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Back
              </button>
              <button
                onClick={() => { setShowPopup(false); onLogout(); }}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default TopNav;