// File: models/userModel.js
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
  


const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    purchasedTickets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ticket",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
