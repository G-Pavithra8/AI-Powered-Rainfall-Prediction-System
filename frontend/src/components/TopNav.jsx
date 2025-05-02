import React from 'react';
import { useNavigate } from 'react-router-dom';

const TopNav = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleAbout = () => {
    navigate('/about');
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
          onClick={onLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default TopNav;