import React, { useState } from 'react';
import { Leaf, Info, Activity, DollarSign } from 'lucide-react';

const RecommendationCard = ({ recommendations, ethicalExplanations }) => {
  const [activeTab, setActiveTab] = useState('recommendations');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'recommendations':
        return (
          <div className="space-y-3">
            {recommendations.map((recommendation, index) => (
              <div
                key={index}
                className="bg-[#0F172A] p-4 rounded-lg flex items-start transition-transform duration-300 hover:translate-y-[-2px]"
              >
                <Leaf className="h-5 w-5 text-[#10B981] mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-gray-300">{recommendation}</p>
              </div>
            ))}
          </div>
        );

      case 'sustainability':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">{ethicalExplanations.sustainability.title}</h3>
            <p className="text-gray-300 mb-3">{ethicalExplanations.sustainability.description}</p>
            <div className="space-y-3">
              {ethicalExplanations.sustainability.considerations.map((consideration, index) => (
                <div
                  key={index}
                  className="bg-[#0F172A] p-4 rounded-lg flex items-start transition-transform duration-300 hover:translate-y-[-2px]"
                >
                  <Info className="h-5 w-5 text-[#10B981] mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">{consideration}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'reliability':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">{ethicalExplanations.reliability.title}</h3>
            <p className="text-gray-300 mb-3">{ethicalExplanations.reliability.description}</p>
            <div className="space-y-3">
              {ethicalExplanations.reliability.considerations.map((consideration, index) => (
                <div
                  key={index}
                  className="bg-[#0F172A] p-4 rounded-lg flex items-start transition-transform duration-300 hover:translate-y-[-2px]"
                >
                  <Activity className="h-5 w-5 text-[#FCD34D] mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">{consideration}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'economic':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">{ethicalExplanations.economic.title}</h3>
            <p className="text-gray-300 mb-3">{ethicalExplanations.economic.description}</p>
            <div className="space-y-3">
              {ethicalExplanations.economic.considerations.map((consideration, index) => (
                <div
                  key={index}
                  className="bg-[#0F172A] p-4 rounded-lg flex items-start transition-transform duration-300 hover:translate-y-[-2px]"
                >
                  <DollarSign className="h-5 w-5 text-[#FCD34D] mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">{consideration}</p>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-[#1E293B] rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:shadow-xl">
      <div className="p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <Leaf className="h-5 w-5 text-[#10B981] mr-2" />
          Agricultural Insights
        </h2>

        <div className="flex border-b border-[#334155] mb-5">
          <button
            className={`py-2 px-3 text-sm font-medium mr-2 transition-colors duration-200 ${
              activeTab === 'recommendations'
                ? 'text-[#10B981] border-b-2 border-[#10B981]'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('recommendations')}
          >
            Recommendations
          </button>
          <button
            className={`py-2 px-3 text-sm font-medium mr-2 transition-colors duration-200 ${
              activeTab === 'sustainability'
                ? 'text-[#10B981] border-b-2 border-[#10B981]'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('sustainability')}
          >
            Sustainability
          </button>
          <button
            className={`py-2 px-3 text-sm font-medium mr-2 transition-colors duration-200 ${
              activeTab === 'reliability'
                ? 'text-[#10B981] border-b-2 border-[#10B981]'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('reliability')}
          >
            Reliability
          </button>
          <button
            className={`py-2 px-3 text-sm font-medium transition-colors duration-200 ${
              activeTab === 'economic'
                ? 'text-[#10B981] border-b-2 border-[#10B981]'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('economic')}
          >
            Economic
          </button>
        </div>

        {renderTabContent()}
      </div>
    </div>
  );
};

export default RecommendationCard; 