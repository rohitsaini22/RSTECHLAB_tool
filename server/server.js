const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

const mongoUri = process.env.MONGO_URI;
const jwtSecret = process.env.JWT_SECRET;

// Route Imports
const authRoutes = require('./routes/authRoutes');
const softwareRoutes = require('./routes/softwareRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/software', softwareRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Base Route
app.get('/', (req, res) => {
  res.send('SoftwareHub API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});