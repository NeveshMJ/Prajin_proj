import React, { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, Users } from 'lucide-react';
import axios from 'axios';
import FlightCard from '../components/FlightCard';
import BookingModal from '../components/BookingModal';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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

const Home: React.FC = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useState({
    from: '',
    to: '',
    date: '',
  });

  const { user } = useAuth();
  const navigate = useNavigate();

  const popularCities = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'];

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchParams.from) params.append('from', searchParams.from);
      if (searchParams.to) params.append('to', searchParams.to);
      if (searchParams.date) params.append('date', searchParams.date);

      const response = await axios.get(`http://localhost:3001/api/flights?${params}`);
      setFlights(response.data);
    } catch (error) {
      console.error('Error fetching flights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFlights();
  };

  const handleBookFlight = (flight: Flight) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedFlight(flight);
    setIsBookingModalOpen(true);
  };

  const handleBookingComplete = () => {
    fetchFlights(); // Refresh flights to update available seats
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Find Your Perfect Flight
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Book domestic flights with ease. Compare prices, choose your seats, and travel with confidence.
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-5xl mx-auto">
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    From
                  </label>
                  <input
                    type="text"
                    value={searchParams.from}
                    onChange={(e) => setSearchParams({ ...searchParams, from: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                    placeholder="Departure city"
                    list="cities-from"
                  />
                  <datalist id="cities-from">
                    {popularCities.map(city => (
                      <option key={city} value={city} />
                    ))}
                  </datalist>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    To
                  </label>
                  <input
                    type="text"
                    value={searchParams.to}
                    onChange={(e) => setSearchParams({ ...searchParams, to: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                    placeholder="Destination city"
                    list="cities-to"
                  />
                  <datalist id="cities-to">
                    {popularCities.map(city => (
                      <option key={city} value={city} />
                    ))}
                  </datalist>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Departure Date
                  </label>
                  <input
                    type="date"
                    value={searchParams.date}
                    onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
                    min={getTomorrowDate()}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  />
                </div>
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center space-x-2 mx-auto disabled:bg-blue-400"
                >
                  <Search className="h-5 w-5" />
                  <span>{loading ? 'Searching...' : 'Search Flights'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Searching for flights...</p>
          </div>
        ) : flights.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Available Flights ({flights.length})
              </h2>
              <div className="text-sm text-gray-600">
                Showing flights {searchParams.from && `from ${searchParams.from}`} 
                {searchParams.to && ` to ${searchParams.to}`}
                {searchParams.date && ` on ${new Date(searchParams.date).toLocaleDateString()}`}
              </div>
            </div>
            <div className="grid gap-6">
              {flights.map((flight) => (
                <FlightCard
                  key={flight._id}
                  flight={flight}
                  onBook={handleBookFlight}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchParams.from || searchParams.to ? 'No flights found' : 'Search for flights'}
            </h3>
            <p className="text-gray-600">
              {searchParams.from || searchParams.to 
                ? 'Try adjusting your search criteria or dates'
                : 'Enter your departure and destination cities to find flights'
              }
            </p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <BookingModal
        flight={selectedFlight}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onBookingComplete={handleBookingComplete}
      />
    </div>
  );
};

export default Home;