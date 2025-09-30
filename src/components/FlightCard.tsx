import React from 'react';
import { Clock, Plane, ArrowRight } from 'lucide-react';

interface Flight {
  _id: string;
  flightNumber: string;
  airline: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  availableSeats: number;
  aircraft: string;
}

interface FlightCardProps {
  flight: Flight;
  onBook: (flight: Flight) => void;
}

const FlightCard: React.FC<FlightCardProps> = ({ flight, onBook }) => {
  const formatTime = (datetime: string) => {
    return new Date(datetime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (datetime: string) => {
    return new Date(datetime).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{flight.airline}</h3>
            <p className="text-sm text-gray-600">{flight.flightNumber} • {flight.aircraft}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">₹{flight.price.toLocaleString()}</p>
            <p className="text-sm text-gray-600">per person</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{formatTime(flight.departureTime)}</p>
            <p className="text-sm text-gray-600">{flight.from}</p>
            <p className="text-xs text-gray-500">{formatDate(flight.departureTime)}</p>
          </div>

          <div className="flex items-center space-x-2 text-gray-400">
            <div className="text-center">
              <div className="flex items-center space-x-1">
                <Plane className="h-4 w-4 rotate-90" />
                <ArrowRight className="h-4 w-4" />
              </div>
              <p className="text-xs mt-1 flex items-center justify-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{flight.duration}</span>
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{formatTime(flight.arrivalTime)}</p>
            <p className="text-sm text-gray-600">{flight.to}</p>
            <p className="text-xs text-gray-500">{formatDate(flight.arrivalTime)}</p>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            {flight.availableSeats} seats remaining
          </p>
          <button
            onClick={() => onBook(flight)}
            disabled={flight.availableSeats === 0}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              flight.availableSeats === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg transform hover:scale-105'
            }`}
          >
            {flight.availableSeats === 0 ? 'Sold Out' : 'Book Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlightCard;