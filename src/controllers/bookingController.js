const Booking = require("../models/Booking");
const FreeTimeDetail = require("../models/FreetimeDetail");
const Notification = require("../models/Notification");
const User = require("../models/User");
const mongoose = require("mongoose");

async function createBooking(req, res) {
  try {
    const { menteeId, mentorId, freetimeDetailId } = req.body;

    const freeTimeDetail = await FreeTimeDetail.findById(freetimeDetailId);
    if (!freeTimeDetail) {
      return res.status(404).json({ message: "FreeTimeDetail not found" });
    }

    const existingBooking = await Booking.findOne({
      menteeId,
      mentorId,
      freetimeDetailId,
    });
    if (existingBooking) {
      return res
        .status(400)
        .json({ message: "Booking already exists for this detail" });
    }

    const newBooking = new Booking({ menteeId, mentorId, freetimeDetailId });
    await newBooking.save();

    const mentee = await User.findById(menteeId);
    if (!mentee) {
      return res.status(404).json({ message: "Mentee not found" });
    }

    const newNotification = new Notification({
      user: mentorId,
      sender: menteeId,
      content: `You have a new booking from mentee ${mentee.fullName}`,
      entityType: "Booking",
      entityId: newBooking._id,
    });
    await newNotification.save();

    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getAllBookings(req, res) {
  try {
    const bookings = await Booking.find()
      .populate("menteeId")
      .populate("mentorId")
      .populate("freetimeDetailId");
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getBookingById(req, res) {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate("menteeId")
      .populate("mentorId")
      .populate("freetimeDetailId");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
async function getBookingsByUserId(req, res) {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId format" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const role = user.role;

    let filter = {};
    if (role === "Mentee") {
      filter = { menteeId: new mongoose.Types.ObjectId(userId) };
    } else if (role === "Mentor") {
      filter = { mentorId: new mongoose.Types.ObjectId(userId) };
    } else {
      return res.status(400).json({ message: "Invalid role provided" });
    }

    const bookings = await Booking.find(filter)
      .populate("menteeId")
      .populate("mentorId")
      .populate("freetimeDetailId");

    if (bookings.length === 0) {
      return res
        .status(404)
        .json({ message: "No bookings found for this user" });
    }

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

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
  getBookingsByUserId,
  updateBooking,
  deleteBooking,
};
