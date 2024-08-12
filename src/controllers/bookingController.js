const BookingDetails = require("../models/BookingDetails");
const Booking = require("../models/Booking");
const FreeTime = require("../models/Freetime");

async function bookTimeSlot(req, res) {
  try {
    const { mentorId, startDate, startTime, endTime } = req.body;
    const menteeId = req.user.userId;

    // Tìm lịch rảnh của mentor
    const freeTimeSlot = await FreeTime.findOne({
      userId: mentorId,
      freeDate: startDate,
      startTime: { $lte: startTime },
      endTime: { $gte: endTime },
    });

    if (!freeTimeSlot) {
      return res.status(400).json({
        message: "Thời gian đặt không nằm trong thời gian rảnh của mentor.",
      });
    }

    // Kiểm tra lịch đặt trùng lặp
    const overlappingBooking = await BookingDetails.findOne({
      bookingId: freeTimeSlot._id,
      from: { $lt: new Date(`${startDate}T${endTime}:00.000Z`) },
      to: { $gt: new Date(`${startDate}T${startTime}:00.000Z`) },
    });

    if (overlappingBooking) {
      return res
        .status(400)
        .json({ message: "Thời gian đặt bị trùng với một lịch đặt khác." });
    }

    // Tạo lịch đặt mới
    const newBooking = await Booking.create({
      menteeId: menteeId,
      freetimeId: freeTimeSlot._id,
      startDate,
      startTime,
      status: "Pending",
    });

    await BookingDetails.create({
      bookingId: newBooking._id,
      from: new Date(`${startDate}T${startTime}:00.000Z`),
      to: new Date(`${startDate}T${endTime}:00.000Z`),
    });

    res
      .status(201)
      .json({ message: "Lịch đã được tạo thành công.", booking: newBooking });
  } catch (error) {
    console.error("Error booking time slot:", error);
    res.status(500).json({ message: "Có lỗi xảy ra khi đặt lịch." });
  }
}

module.exports = {
  bookTimeSlot,
};
