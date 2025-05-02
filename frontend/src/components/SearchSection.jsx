import React, { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';

const SearchSection = ({ onSearch, isLoading }) => {
  const [location, setLocation] = useState('');
  const [months, setMonths] = useState(3);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (location.trim()) {
      onSearch(location.trim(), months);
    }
  };

  const monthOptions = [3, 5];

  return (
    <div className="bg-[#1E293B] rounded-xl p-6 shadow-lg transform transition-all duration-300 hover:shadow-xl">
      <form onSubmit={handleSearch} className="space-y-4 md:space-y-0 md:grid md:grid-cols-12 md:gap-4">
        <div className="md:col-span-7">
          <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-1">
            Location
          </label>
          <div className="relative">
            <input
              id="location"
              type="text"
              className="block w-full py-3 px-4 bg-[#0F172A] border border-[#334155] rounded-lg focus:ring-[#10B981] focus:border-[#10B981] text-white placeholder-gray-500 transition-all duration-200"
              placeholder="Enter city name..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isLoading}
              required
            />
            <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="md:col-span-3">
          <label htmlFor="months" className="block text-sm font-medium text-gray-300 mb-1">
            Forecast Period
          </label>
          <div className="relative">
            <button
              type="button"
              className="bg-[#0F172A] border border-[#334155] text-white w-full py-3 px-4 rounded-lg flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-[#10B981]"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={isLoading}
            >
              <span>{months} months</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute mt-1 w-full bg-[#1E293B] border border-[#334155] rounded-lg shadow-lg z-10 py-1">
                {monthOptions.map((option) => (
                  <div
                    key={option}
                    className="px-4 py-2 text-white hover:bg-[#2D3748] cursor-pointer transition-colors duration-150"
                    onClick={() => {
                      setMonths(option);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {option} months
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block invisible text-sm font-medium text-gray-400 mb-1">
            Search
          </label>
          <button
            type="submit"
            className={`w-full py-3 px-4 bg-[#10B981] hover:bg-[#0E9F6E] text-white rounded-lg font-medium transition-colors duration-200 flex justify-center items-center ${
              isLoading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Predict'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchSection; 