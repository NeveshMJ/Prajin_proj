import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 3001;
const JWT_SECRET = 'flight-booking-secret-key-2024';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/flightbooking').then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err.message);
  console.log('Please make sure MongoDB is running on your system.');
  console.log('You can start MongoDB by running: mongod');
});

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Flight Schema
const flightSchema = new mongoose.Schema({
  flightNumber: { type: String, required: true, unique: true },
  airline: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  departureTime: { type: Date, required: true },
  arrivalTime: { type: Date, required: true },
  duration: { type: String, required: true },
  price: { type: Number, required: true },
  totalSeats: { type: Number, required: true },
  availableSeats: { type: Number, required: true },
  aircraft: { type: String, required: true },
  status: { type: String, enum: ['active', 'cancelled', 'delayed'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

const Flight = mongoose.model('Flight', flightSchema);

// Booking Schema
const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  flightId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
  passengerName: { type: String, required: true },
  passengerEmail: { type: String, required: true },
  passengerPhone: { type: String, required: true },
  seatNumbers: [{ type: String, required: true }],
  totalPrice: { type: Number, required: true },
  bookingStatus: { type: String, enum: ['confirmed', 'cancelled', 'completed'], default: 'confirmed' },
  bookingDate: { type: Date, default: Date.now },
  pnr: { type: String, required: true, unique: true }
});

const Booking = mongoose.model('Booking', bookingSchema);

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Admin Middleware
const requireAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Initialize Admin User
const initializeAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ email: 'admin@flights.com' });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('trilogy123', 10);
      const admin = new User({
        name: 'Admin',
        email: 'admin@flights.com',
        password: hashedPassword,
        phone: '+1234567890',
        isAdmin: true
      });
      await admin.save();
      console.log('Admin user created successfully');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

// Initialize Sample Flights
const initializeFlights = async () => {
  try {
    const flightCount = await Flight.countDocuments();
    if (flightCount === 0) {
      const sampleFlights = [
        {
          flightNumber: 'AI101',
          airline: 'Air India',
          from: 'Delhi',
          to: 'Mumbai',
          departureTime: new Date('2024-03-20T06:00:00Z'),
          arrivalTime: new Date('2024-03-20T08:15:00Z'),
          duration: '2h 15m',
          price: 5500,
          totalSeats: 180,
          availableSeats: 150,
          aircraft: 'Boeing 737'
        },
        {
          flightNumber: 'SG205',
          airline: 'SpiceJet',
          from: 'Mumbai',
          to: 'Bangalore',
          departureTime: new Date('2024-03-20T10:30:00Z'),
          arrivalTime: new Date('2024-03-20T12:00:00Z'),
          duration: '1h 30m',
          price: 4200,
          totalSeats: 160,
          availableSeats: 140,
          aircraft: 'Boeing 737-800'
        },
        {
          flightNumber: 'UK771',
          airline: 'Vistara',
          from: 'Delhi',
          to: 'Bangalore',
          departureTime: new Date('2024-03-20T14:15:00Z'),
          arrivalTime: new Date('2024-03-20T16:45:00Z'),
          duration: '2h 30m',
          price: 6800,
          totalSeats: 200,
          availableSeats: 180,
          aircraft: 'Airbus A320'
        },
        {
          flightNumber: 'IG401',
          airline: 'IndiGo',
          from: 'Chennai',
          to: 'Kolkata',
          departureTime: new Date('2024-03-20T18:00:00Z'),
          arrivalTime: new Date('2024-03-20T20:30:00Z'),
          duration: '2h 30m',
          price: 5200,
          totalSeats: 186,
          availableSeats: 165,
          aircraft: 'Airbus A320neo'
        }
      ];

      await Flight.insertMany(sampleFlights);
      console.log('Sample flights created successfully');
    }
  } catch (error) {
    console.error('Error creating sample flights:', error);
  }
};

// Routes

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, phone });
    await user.save();

    const token = jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, JWT_SECRET);
    res.status(201).json({ 
      token, 
      user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, JWT_SECRET);
    res.json({ 
      token, 
      user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Login error', error: error.message });
  }
});

// Flight Routes
app.get('/api/flights', async (req, res) => {
  try {
    const { from, to, date } = req.query;
    let query = { status: 'active' };
    
    if (from) query.from = new RegExp(from, 'i');
    if (to) query.to = new RegExp(to, 'i');
    if (date) {
      const searchDate = new Date(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.departureTime = { 
        $gte: searchDate, 
        $lt: nextDay 
      };
    }
    
    const flights = await Flight.find(query).sort({ departureTime: 1 });
    res.json(flights);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching flights', error: error.message });
  }
});

app.get('/api/flights/:id', async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    res.json(flight);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching flight', error: error.message });
  }
});

// Booking Routes
app.post('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const { flightId, passengerName, passengerEmail, passengerPhone, seatNumbers } = req.body;
    
    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    if (flight.availableSeats < seatNumbers.length) {
      return res.status(400).json({ message: 'Not enough seats available' });
    }

    const totalPrice = flight.price * seatNumbers.length;
    const pnr = 'PNR' + Date.now();

    const booking = new Booking({
      userId: req.user.userId,
      flightId,
      passengerName,
      passengerEmail,
      passengerPhone,
      seatNumbers,
      totalPrice,
      pnr
    });

    await booking.save();

    // Update flight availability
    flight.availableSeats -= seatNumbers.length;
    await flight.save();

    const populatedBooking = await Booking.findById(booking._id).populate('flightId');
    res.status(201).json(populatedBooking);
  } catch (error) {
    res.status(500).json({ message: 'Error creating booking', error: error.message });
  }
});

app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.userId }).populate('flightId').sort({ bookingDate: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
});

// Admin Routes
app.get('/api/admin/flights', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const flights = await Flight.find().sort({ createdAt: -1 });
    res.json(flights);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching flights', error: error.message });
  }
});

app.post('/api/admin/flights', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const flight = new Flight(req.body);
    await flight.save();
    res.status(201).json(flight);
  } catch (error) {
    res.status(500).json({ message: 'Error creating flight', error: error.message });
  }
});

app.get('/api/admin/bookings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find().populate('userId').populate('flightId').sort({ bookingDate: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
});

app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalFlights = await Flight.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalUsers = await User.countDocuments({ isAdmin: false });
    const totalRevenue = await Booking.aggregate([
      { $match: { bookingStatus: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    res.json({
      totalFlights,
      totalBookings,
      totalUsers,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

// Initialize data and start server
const startServer = async () => {
  await initializeAdmin();
  await initializeFlights();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();