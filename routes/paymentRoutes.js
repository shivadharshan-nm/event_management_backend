const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Payment = require("../models/paymentModel");
const Event = require("../models/eventModel");
const { verifyUser } = require("../middleware/authMiddleware");

// Payment Route: Create a payment session
router.post("/create-payment-intent", verifyUser, async (req, res) => {
  try {
    const { eventId, ticketType } = req.body;

    if (!eventId || !ticketType) {
      return res.status(400).json({ message: "eventId and ticketType are required." });
    }

    // Fetch event details
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    if (!event.price) {
      return res.status(400).json({ message: "Event price is not set." });
    }

    // Set ticket price (assuming price varies by ticket type)
    let ticketPrice = event.price; // Base price
    if (ticketType === "VIP") {
      ticketPrice += 50; // Example premium for VIP tickets
    }

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: ticketPrice * 100, // Amount in cents
      currency: "usd",
      metadata: {
        eventId: eventId,
        userId: req.user.id,
        ticketType: ticketType,
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    const message = error instanceof stripe.errors.StripeError ? error.message : "Failed to create payment intent.";
    res.status(500).json({ message });
  }
});

// Payment Route: Confirm payment and create a record
router.post("/confirm-payment", verifyUser, async (req, res) => {
  try {
    const { paymentIntentId, eventId } = req.body;

    if (!paymentIntentId || !eventId) {
      return res.status(400).json({ message: "paymentIntentId and eventId are required." });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      // Check if payment already exists
      const existingPayment = await Payment.findOne({ paymentId: paymentIntentId });
      if (existingPayment) {
        return res.status(400).json({ message: "Payment already processed." });
      }

      // Update tickets sold for the event
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found." });
      }
      event.ticketsSold += 1;
      await event.save();

      // Save payment in the database
      const newPayment = new Payment({
        paymentId: paymentIntentId,
        userId: req.user.id,
        eventId: eventId,
        amount: paymentIntent.amount / 100, // Convert cents to dollars
        status: "completed",
      });
      await newPayment.save();

      res.status(200).json({ message: "Payment successful!" });
    } else {
      res.status(400).json({ message: "Payment not successful." });
    }
  } catch (error) {
    console.error("Error confirming payment:", error);
    const message = error instanceof stripe.errors.StripeError ? error.message : "Failed to confirm payment.";
    res.status(500).json({ message });
  }
});

module.exports = router;
