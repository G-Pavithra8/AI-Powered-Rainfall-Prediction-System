import React from 'react';
import { MapPin, ArrowUpRight } from 'lucide-react';

const LocationDisplay = ({ location }) => {
  const { name, country, coordinates } = location;
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${coordinates.latitude},${coordinates.longitude}`;

  return (
    <div className="mb-6">
      <div className="bg-[#1E293B] rounded-xl p-4 shadow-md inline-flex items-center">
        <div className="h-10 w-10 rounded-full bg-[#0F172A] flex items-center justify-center mr-3">
          <MapPin className="h-5 w-5 text-[#FCD34D]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">
            {name}
            <span className="ml-2 text-sm font-normal text-gray-400">{country}</span>
          </h2>
          <a 
            href={mapUrl}
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-[#10B981] hover:text-[#0E9F6E] transition-colors duration-200 inline-flex items-center"
          >
            View on map
            <ArrowUpRight className="h-3 w-3 ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default LocationDisplay; 