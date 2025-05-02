import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const WeatherCharts = ({ data }) => {
  const { labels, min_temp, max_temp, rainfall, rh_morning, rh_evening } = data;

  // Common options for charts
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#F8FAFC',
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: '#1E293B',
        titleColor: '#F8FAFC',
        bodyColor: '#F8FAFC',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          color: '#334155',
          borderColor: '#475569',
          display: false,
        },
        ticks: {
          color: '#94A3B8',
        },
      },
      y: {
        grid: {
          color: '#334155',
          borderColor: '#475569',
          drawBorder: true,
        },
        ticks: {
          color: '#94A3B8',
        },
      },
    },
  };

  // Temperature chart data
  const temperatureData = {
    labels,
    datasets: [
      {
        label: 'Max Temperature (°C)',
        data: max_temp,
        borderColor: '#F97316',
        backgroundColor: 'rgba(249, 115, 22, 0.5)',
        pointBackgroundColor: '#F97316',
        pointBorderColor: '#FFFFFF',
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.3,
      },
      {
        label: 'Min Temperature (°C)',
        data: min_temp,
        borderColor: '#38BDF8',
        backgroundColor: 'rgba(56, 189, 248, 0.5)',
        pointBackgroundColor: '#38BDF8',
        pointBorderColor: '#FFFFFF',
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.3,
      },
    ],
  };

  // Rainfall chart data
  const rainfallData = {
    labels,
    datasets: [
      {
        label: 'Rainfall (mm)',
        data: rainfall,
        backgroundColor: '#10B981',
        hoverBackgroundColor: '#059669',
        borderRadius: 6,
        maxBarThickness: 50,
      },
    ],
  };

  // Humidity chart data
  const humidityData = {
    labels,
    datasets: [
      {
        label: 'Morning Humidity (%)',
        data: rh_morning,
        borderColor: '#A78BFA',
        backgroundColor: 'rgba(167, 139, 250, 0.5)',
        pointBackgroundColor: '#A78BFA',
        pointBorderColor: '#FFFFFF',
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.3,
      },
      {
        label: 'Evening Humidity (%)',
        data: rh_evening,
        borderColor: '#FB7185',
        backgroundColor: 'rgba(251, 113, 133, 0.5)',
        pointBackgroundColor: '#FB7185',
        pointBorderColor: '#FFFFFF',
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 mb-6">
      <div className="bg-[#1E293B] rounded-xl p-6 shadow-lg transform transition-all duration-300 hover:shadow-xl lg:col-span-2 2xl:col-span-1">
        <h2 className="text-xl font-bold text-white mb-4">Temperature Forecast</h2>
        <div className="h-[300px]">
          <Line options={commonOptions} data={temperatureData} />
        </div>
      </div>

      <div className="bg-[#1E293B] rounded-xl p-6 shadow-lg transform transition-all duration-300 hover:shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4">Rainfall Forecast</h2>
        <div className="h-[300px]">
          <Bar options={commonOptions} data={rainfallData} />
        </div>
      </div>

      <div className="bg-[#1E293B] rounded-xl p-6 shadow-lg transform transition-all duration-300 hover:shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4">Humidity Forecast</h2>
        <div className="h-[300px]">
          <Line options={commonOptions} data={humidityData} />
        </div>
      </div>
    </div>
  );
};

export default WeatherCharts; 