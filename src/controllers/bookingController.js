// controllers/bookingController.js

const Booking = require("../models/Booking");
const FreeTimeDetail = require("../models/FreetimeDetail");

// Create a new booking
async function createBooking(req, res) {
  try {
    const { menteeId, freetimeDetailId } = req.body;

    // Check if FreeTimeDetail exists
    const freeTimeDetail = await FreeTimeDetail.findById(freetimeDetailId);
    if (!freeTimeDetail) {
      return res.status(404).json({ message: "FreeTimeDetail not found" });
    }

    // Create and save the booking
    const newBooking = new Booking({ menteeId, freetimeDetailId });
    await newBooking.save();

    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get all bookings
async function getAllBookings(req, res) {
  try {
    const bookings = await Booking.find()
      .populate("menteeId")
      .populate("freetimeDetailId");
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get a specific booking by ID
async function getBookingById(req, res) {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate("menteeId")
      .populate("freetimeDetailId");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Update a booking by ID
async function updateBooking(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Delete a booking by ID
async function deleteBooking(req, res) {
  try {
    const { id } = req.params;
    const deletedBooking = await Booking.findByIdAndDelete(id);

    if (!deletedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
};
