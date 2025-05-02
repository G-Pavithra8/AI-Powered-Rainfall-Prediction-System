import React from 'react';
import { CloudRain } from 'lucide-react';

const Header = () => {
  return (
    <header className="py-8 mb-8">
      <div className="container mx-auto flex flex-col items-center justify-center text-center px-4">
        <div className="flex items-center mb-4">
          <CloudRain className="h-12 w-12 text-[#10B981] mr-3 animate-bounce" />
          <h1 className="text-4xl md:text-5xl font-bold">
            <span className="rain-text">Rain</span>
            <span className="text-[#FCD34D]">Predict</span>
          </h1>
        </div>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl">
          Empowering Agriculture with Precision Weather Forecasting
        </p>
      </div>
    </header>
  );
};

export default Header; 