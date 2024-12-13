// File: models/eventModel.js

const mongoose = require('mongoose');
require('dotenv').config();  // to load environment variables

const connectDB = async () => {
    try {
      // Remove useNewUrlParser and useUnifiedTopology options
      await mongoose.connect(process.env.MONGO_URI);
      console.log('MongoDB connected');
    } catch (error) {
      console.error('Error connecting to MongoDB', error);
      process.exit(1); // Exit the process with failure
    }
  };
  
  connectDB();
  

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    media: { type: String }, // URL for event image or media
    ticketsSold: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
