import React from 'react';

const About = () => (
  <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
    {/* Animated Gradient Background */}
    <div className="absolute inset-0 -z-10 animate-gradient bg-gradient-to-br from-[#10B981] via-[#1E293B] to-[#FCD34D]"></div>
    {/* Overlay for darkness */}
    <div className="absolute inset-0 -z-10 bg-[#0F172A] opacity-80"></div>
    <div className="relative z-10 bg-[#1E293B]/90 p-10 rounded-2xl shadow-2xl max-w-2xl w-full text-center">
      <h2 className="text-3xl font-bold text-[#10B981] mb-4">About RainPredict</h2>
      <p className="text-lg text-gray-200 mb-6">
        <span className="text-[#FCD34D] font-semibold">RainPredict</span> is a modern web application designed to empower farmers and agricultural planners with accurate, AI-powered rainfall forecasting and crop recommendations.
      </p>
      <div className="text-left text-gray-300 space-y-3">
        <h3 className="text-xl font-semibold text-white mb-2">How was this application built?</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <span className="font-semibold text-[#10B981]">Frontend:</span> Built with <span className="font-semibold">React.js</span> and <span className="font-semibold">Tailwind CSS</span> for a responsive, modern user experience.
          </li>
          <li>
            <span className="font-semibold text-[#10B981]">Backend:</span> Developed using <span className="font-semibold">Python Flask</span> to serve a trained <span className="font-semibold">LSTM deep learning model</span> for rainfall prediction.
          </li>
          <li>
            <span className="font-semibold text-[#10B981]">Machine Learning:</span> Utilizes real-time weather data from the <span className="font-semibold">OpenWeather API</span> and a custom-trained LSTM model.
          </li>
          <li>
            <span className="font-semibold text-[#10B981]">Features:</span> Secure login/signup, interactive dashboard, dynamic crop recommendations, and ethical/sustainability insights.
          </li>
        </ul>
        <h3 className="text-xl font-semibold text-white mt-4 mb-2">Project Highlights</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Mobile-first, accessible design</li>
          <li>Real-time, location-based predictions</li>
          <li>Professional, clean UI with animated backgrounds</li>
        </ul>
      </div>
      <div className="mt-8 text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} RainPredict. Built for the future of smart agriculture.
      </div>
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

export default About;