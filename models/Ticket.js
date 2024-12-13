// File: models/ticketModel.js

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
  

const ticketSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ticketType: { type: String, enum: ["standard", "VIP"], default: "standard" },
    status: { type: String, enum: ["active", "cancelled"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);
