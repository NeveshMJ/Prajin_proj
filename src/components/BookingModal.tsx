import React, { useState } from 'react';
import { X, Plane, CreditCard } from 'lucide-react';
import axios from 'axios';

interface Flight {
  _id: string;
  flightNumber: string;
  airline: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
}

interface BookingModalProps {
  flight: Flight | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingComplete: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ flight, isOpen, onClose, onBookingComplete }) => {
  const [passengerName, setPassengerName] = useState('');
  const [passengerEmail, setPassengerEmail] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [seatCount, setSeatCount] = useState(1);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !flight) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const seatNumbers = Array.from({ length: seatCount }, (_, i) => `${Math.floor(Math.random() * 30) + 1}A`);
      
      await axios.post('http://localhost:3001/api/bookings', {
        flightId: flight._id,
        passengerName,
        passengerEmail,
        passengerPhone,
        seatNumbers,
      });

      alert('Booking confirmed successfully!');
      onBookingComplete();
      onClose();
      resetForm();
    } catch (error) {
      alert('Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPassengerName('');
    setPassengerEmail('');
    setPassengerPhone('');
    setSeatCount(1);
  };

  const formatTime = (datetime: string) => {
    return new Date(datetime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (datetime: string) => {
    return new Date(datetime).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const totalPrice = flight.price * seatCount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-90vh overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Plane className="h-6 w-6 text-blue-600" />
            <span>Book Your Flight</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Flight Details */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{flight.airline}</h3>
                <p className="text-gray-600">{flight.flightNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">₹{flight.price.toLocaleString()}</p>
                <p className="text-sm text-gray-600">per person</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-lg">{formatTime(flight.departureTime)}</p>
                <p className="text-gray-600">{flight.from}</p>
              </div>
              <div className="text-center">
                <Plane className="h-6 w-6 text-blue-600 mx-auto" />
              </div>
              <div className="text-right">
                <p className="font-semibold text-lg">{formatTime(flight.arrivalTime)}</p>
                <p className="text-gray-600">{flight.to}</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mt-2 text-center">
              {formatDate(flight.departureTime)}
            </p>
          </div>

          {/* Booking Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Passenger Name *
              </label>
              <input
                type="text"
                required
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Full Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={passengerEmail}
                onChange={(e) => setPassengerEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={passengerPhone}
                onChange={(e) => setPassengerPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Seats
              </label>
              <select
                value={seatCount}
                onChange={(e) => setSeatCount(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num} {num === 1 ? 'Seat' : 'Seats'}</option>
                ))}
              </select>
            </div>

            {/* Price Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Base Price ({seatCount} seat{seatCount > 1 ? 's' : ''})</span>
                <span className="text-gray-900">₹{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Taxes & Fees</span>
                <span className="text-gray-900">₹{Math.round(totalPrice * 0.1).toLocaleString()}</span>
              </div>
              <hr className="my-3" />
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total Amount</span>
                <span className="text-blue-600">₹{Math.round(totalPrice * 1.1).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all duration-200 flex items-center justify-center space-x-2 disabled:bg-blue-400"
              >
                <CreditCard className="h-5 w-5" />
                <span>{loading ? 'Processing...' : 'Confirm Booking'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;