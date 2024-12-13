// File: controllers/ticketController.js

const Ticket = require("../models/ticketModel");
const Event = require("../models/eventModel");

// Create a ticket
const createTicket = async (req, res) => {
  try {
    const { userId, eventId, ticketType, status } = req.body;

    // Validate event
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    const newTicket = new Ticket({
      eventId,
      userId,
      ticketType,
      status,
    });

    const savedTicket = await newTicket.save();

    res.status(201).json({ message: "Ticket created successfully", ticket: savedTicket });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create ticket" });
  }
};

// Retrieve tickets for a specific user
const getTicketsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const tickets = await Ticket.find({ userId }).populate("eventId", "title date location");

    res.status(200).json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
};

// Cancel a ticket
const cancelTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticketId,
      { status: "cancelled" },
      { new: true }
    );

    if (!updatedTicket) return res.status(404).json({ error: "Ticket not found" });

    res.status(200).json({ message: "Ticket cancelled successfully", ticket: updatedTicket });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to cancel ticket" });
  }
};

module.exports = {
  createTicket,
  getTicketsByUser,
  cancelTicket,
};
