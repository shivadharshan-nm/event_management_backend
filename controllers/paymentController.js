const nodemailer = require("nodemailer");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // Initialize Stripe with your secret key
const Payment = require("../models/Payment");
const Event = require("../models/Event");
const Ticket = require("../models/Ticket");
const User = require("../models/User");

// Email Transporter Configuration
const transporter = nodemailer.createTransport({
  service: "Gmail", // Use your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send tickets via email
const sendTicketEmail = async (user, event, ticket) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: `Your Ticket for ${event.title}`,
    text: `Hello ${user.name},\n\nThank you for your purchase. Here are your ticket details:\n\nEvent: ${event.title}\nDate: ${event.date}\nLocation: ${event.location}\n\nTicket ID: ${ticket._id}\n\nEnjoy the event!\n\nBest Regards,\nEvent Management Team`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Ticket email sent successfully!");
  } catch (error) {
    console.error("Error sending ticket email:", error);
  }
};

// Create Payment Intent
exports.createPaymentIntent = async (req, res) => {
  try {
    const { eventId } = req.body;

    // Retrieve event details
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: event.price * 100, // Amount in cents
      currency: "usd",
      payment_method_types: ["card"],
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ message: "Failed to create payment intent" });
  }
};

// Confirm Payment and Send Ticket
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, eventId } = req.body;

    // Retrieve payment intent to confirm its status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ message: "Payment not successful" });
    }

    // Retrieve event and user data
    const event = await Event.findById(eventId);
    const user = await User.findById(req.user.id);

    if (!event) return res.status(404).json({ message: "Event not found" });

    // Save payment to DB
    const payment = new Payment({
      paymentId: paymentIntent.id,
      userId: user._id,
      eventId: event._id,
      amount: event.price,
      status: "completed",
    });
    await payment.save();

    // Generate Ticket and email it to the user
    const ticket = new Ticket({
      eventId: event._id,
      userId: user._id,
      ticketType: "Regular",
      status: "active",
    });
    await ticket.save();

    // Email the ticket to the user
    await sendTicketEmail(user, event, ticket);

    res.status(200).json({ message: "Payment successful and ticket emailed!" });
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).json({ message: "Payment confirmation failed" });
  }
};
