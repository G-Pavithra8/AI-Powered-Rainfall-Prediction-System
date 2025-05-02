import React, { useState } from 'react';
import Header from '../components/Header';
import SearchSection from '../components/SearchSection';
import WeatherCharts from '../components/WeatherCharts';
import PredictionCard from '../components/PredictionCard';
import RecommendationCard from '../components/RecommendationCard';
import LocationDisplay from '../components/LocationDisplay';
import ErrorMessage from '../components/ErrorMessage';
import { fetchPredictions } from '../api';

function MainDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (location, months) => {
    setLoading(true);
    setError(null);
    try {
      const request = { location, months };
      const response = await fetchPredictions(request);
      setData(response);
    } catch (err) {
      setError('Please ensure your prediction server is running at http://127.0.0.1:5000 and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (data) {
      handleSearch(data.location.name, parseInt(data.forecast_period.split(' ')[0]));
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 -z-10 animate-gradient bg-gradient-to-br from-[#10B981] via-[#1E293B] to-[#FCD34D]"></div>
      {/* Overlay for darkness */}
      <div className="absolute inset-0 -z-10 bg-[#0F172A] opacity-80"></div>

      {/* Main Content */}
      <div className="relative z-10 text-white pb-10">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 space-y-6">
          <SearchSection onSearch={handleSearch} isLoading={loading} />
          {error && <ErrorMessage message={error} onRetry={handleRetry} />}
          {loading && !data && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#10B981] mb-4"></div>
              <p className="text-xl text-gray-300">Fetching weather predictions...</p>
            </div>
          )}
          {data && !loading && (
            <div className="space-y-6 animate-fadeIn">
              <LocationDisplay location={data.location} />
              <WeatherCharts data={data.visualization_data} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PredictionCard 
                  predictions={data.predictions} 
                  location={data.location}
                  forecastPeriod={data.forecast_period}
                />
                <RecommendationCard 
                  recommendations={data.crop_recommendations}
                  ethicalExplanations={data.visualization_data.ethical_explanations}
                />
              </div>
            </div>
          )}
        </main>
      </div>
      {/* Animated gradient keyframes */}
      <style>
        {`
          .animate-gradient {
            background-size: 200% 200%;
            animation: gradientMove 8s ease-in-out infinite;
          }
          @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
    </div>
  );
}

export default MainDashboard;