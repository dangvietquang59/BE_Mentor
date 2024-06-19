const Booking = require("../models/Booking");

async function createBooking(req, res) {
  try {
    const { startDate, startTime } = req.body;

    const formatDate = new Date(startDate);

    const newBooking = new Booking({
      startDate: formatDate,
      startTime,
    });
  } catch (error) {}
}

module.exports = {
  createBooking,
};
