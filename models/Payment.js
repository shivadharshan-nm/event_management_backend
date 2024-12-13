// File: models/paymentModel.js

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
  

const paymentSchema = new mongoose.Schema(
  {
    paymentId: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["completed", "failed"], default: "completed" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
