import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Plane, Download } from 'lucide-react';
import axios from 'axios';

interface Booking {
  _id: string;
  flightId: {
    flightNumber: string;
    airline: string;
    from: string;
    to: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
  };
  passengerName: string;
  passengerEmail: string;
  seatNumbers: string[];
  totalPrice: number;
  bookingStatus: string;
  bookingDate: string;
  pnr: string;
}

const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/bookings');
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
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
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="mt-2 text-gray-600">Manage and view your flight reservations</p>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-16">
            <Plane className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-600 mb-6">Start exploring and book your first flight!</p>
            <a
              href="/"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Browse Flights
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {booking.flightId.airline}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            booking.bookingStatus
                          )}`}
                        >
                          {booking.bookingStatus.charAt(0).toUpperCase() + booking.bookingStatus.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        PNR: <span className="font-mono font-semibold">{booking.pnr}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        ₹{booking.totalPrice.toLocaleString()}
                      </p>
                      <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1">
                        <Download className="h-4 w-4" />
                        <span>Download Ticket</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatTime(booking.flightId.departureTime)}
                        </p>
                        <p className="text-gray-600 flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{booking.flightId.from}</span>
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(booking.flightId.departureTime)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <div className="flex items-center space-x-2 text-gray-400 mb-2">
                          <Plane className="h-6 w-6 rotate-90" />
                          <div className="h-px bg-gray-300 w-16"></div>
                        </div>
                        <p className="text-sm text-gray-600 flex items-center justify-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{booking.flightId.duration}</span>
                        </p>
                        <p className="text-xs text-gray-500">{booking.flightId.flightNumber}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          {formatTime(booking.flightId.arrivalTime)}
                        </p>
                        <p className="text-gray-600 flex items-center space-x-1 justify-end">
                          <MapPin className="h-4 w-4" />
                          <span>{booking.flightId.to}</span>
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(booking.flightId.arrivalTime)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Passenger</p>
                        <p className="font-semibold text-gray-900">{booking.passengerName}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Seats</p>
                        <p className="font-semibold text-gray-900">
                          {booking.seatNumbers.join(', ')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Booked On</p>
                        <p className="font-semibold text-gray-900 flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(booking.bookingDate)}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;