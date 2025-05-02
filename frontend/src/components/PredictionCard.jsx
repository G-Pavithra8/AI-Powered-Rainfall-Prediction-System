import React from 'react';
import { MapPin, Calendar, Droplet, BarChart2 } from 'lucide-react';

const PredictionCard = ({ predictions, location, forecastPeriod }) => {
  // Get the confidence level color
  const getConfidenceColor = (confidence) => {
    switch (confidence.toLowerCase()) {
      case 'high':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-red-400';
      default:
        return 'text-blue-400';
    }
  };

  return (
    <div className="bg-[#1E293B] rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:shadow-xl">
      <div className="p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <Droplet className="h-5 w-5 text-[#10B981] mr-2" />
          Rainfall Predictions
        </h2>

        <div className="mb-6 space-y-2">
          <div className="flex items-center text-gray-300">
            <MapPin className="h-4 w-4 mr-2 text-[#FCD34D]" />
            <span className="font-medium">{location.name}, {location.country}</span>
          </div>
          <div className="flex items-center text-gray-300">
            <Calendar className="h-4 w-4 mr-2 text-[#FCD34D]" />
            <span className="font-medium">Forecast Period: {forecastPeriod}</span>
          </div>
        </div>

        <div className="space-y-4">
          {predictions.map((prediction, index) => (
            <div
              key={index}
              className="bg-[#0F172A] p-4 rounded-lg transition-transform duration-300 hover:translate-y-[-2px]"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-white">{prediction.month}</h3>
                <span className={`flex items-center ${getConfidenceColor(prediction.confidence)}`}>
                  <BarChart2 className="h-4 w-4 mr-1" />
                  {prediction.confidence.charAt(0).toUpperCase() + prediction.confidence.slice(1)} confidence
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Droplet className="h-5 w-5 text-[#10B981] mr-2" />
                  <span className="text-lg font-bold text-white">{prediction.rainfall_mm.toFixed(2)} mm</span>
                </div>
                <span className="text-xs text-gray-400">{new Date(prediction.date).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PredictionCard; 