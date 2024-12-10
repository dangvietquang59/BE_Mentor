const User = require("../models/User");
const Booking = require("../models/Booking");
const Transaction = require("../models/Transactions");
const AdminRevenue = require("../models/AdminRevenue");

const getUserCountByRole = async (req, res) => {
  try {
    // Await the result of the countDocuments query
    const userCount = await User.countDocuments();
    const mentorCount = await User.countDocuments({ role: "Mentor" });
    const menteeCount = await User.countDocuments({ role: "Mentee" });
    const totalBookings = await Booking.countDocuments();
    const totalTransactions = await Transaction.countDocuments();

    res.status(200).json({
      userCount,
      mentorCount,
      menteeCount,
      totalBookings,
      totalTransactions,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

const getAdminRevenue = async (req, res) => {
  try {
    // Await the result of the find query to get the revenue data
    const revenue = await AdminRevenue.find().populate("transactionId");
    res.status(200).json(revenue);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};
const getBooking = async (req, res) => {
  try {
    // Await the result of the find query to get the revenue data
    const bookings = await Booking.find()
      .populate("participants", "-password")
      .populate("freetimeDetailId");
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};
const getTransactions = async (req, res) => {
  try {
    // Await the result of the find query to get the revenue data
    const transactions = await Transaction.find()
      .populate("userId", "-password")
      .populate("relatedUserId", "-password")
      .populate("bookingId");
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

const getRevenueAndTransactions = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Missing startDate or endDate" });
    }

    // Chuyển đổi startDate và endDate sang dạng Date
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Đảm bảo thời gian kết thúc là hết ngày

    // Tính tổng giao dịch theo ngày
    const transactions = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalAmount: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } }, // Sắp xếp theo ngày tăng dần
    ]);

    // Tính tổng doanh thu admin theo ngày
    const adminRevenues = await AdminRevenue.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalAmount: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Kết hợp dữ liệu giao dịch và doanh thu của admin theo ngày
    const result = [];
    const transactionMap = transactions.reduce((acc, item) => {
      acc[item._id] = item.totalAmount;
      return acc;
    }, {});

    const adminRevenueMap = adminRevenues.reduce((acc, item) => {
      acc[item._id] = item.totalAmount;
      return acc;
    }, {});

    // Lấy danh sách các ngày trong khoảng thời gian và tính tổng cho cả transaction và adminRevenue
    let currentDate = start;
    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split("T")[0]; // Lấy phần ngày từ ISO string

      result.push({
        date: dateStr,
        transactionTotal: transactionMap[dateStr] || 0,
        adminRevenueTotal: adminRevenueMap[dateStr] || 0,
      });

      // Tiến đến ngày tiếp theo
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
module.exports = {
  getUserCountByRole,
  getAdminRevenue,
  getBooking,
  getTransactions,
  getRevenueAndTransactions,
};
