const User = require("../models/User");
const Booking = require("../models/Booking");
const Transaction = require("../models/Transactions");

// 1. Tổng số lượng người dùng (chia theo loại)
const getUserCountByRole = async (req, res) => {
  try {
    const userCount = await User.aggregate([
      {
        $group: {
          _id: "$role", // Nhóm theo role của user
          count: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(userCount);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

// 2. Tổng số giao dịch theo trạng thái
const getTransactionCountByStatus = async (req, res) => {
  try {
    const transactionCount = await Transaction.aggregate([
      {
        $group: {
          _id: "$status", // Nhóm theo trạng thái giao dịch
          count: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(transactionCount);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

// 3. Tổng số Booking theo trạng thái
const getBookingCountByStatus = async (req, res) => {
  try {
    const bookingCount = await Booking.aggregate([
      {
        $group: {
          _id: "$status", // Nhóm theo trạng thái của booking
          count: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(bookingCount);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

// 4. Top Mentor theo số giờ tư vấn
const getTopMentorsByConsultationHours = async (req, res) => {
  try {
    const topMentors = await User.aggregate([
      { $match: { role: "mentor" } },
      { $unwind: "$technologies" }, // Tính tổng giờ tư vấn theo từng công nghệ
      {
        $group: {
          _id: "$_id",
          fullName: { $first: "$fullName" },
          totalHours: { $sum: "$technologies.experienceYears" },
        },
      },
      { $sort: { totalHours: -1 } }, // Sắp xếp giảm dần theo tổng số giờ tư vấn
      { $limit: 10 }, // Lấy 10 Mentor hàng đầu
    ]);
    res.status(200).json(topMentors);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

// 5. Số lượng giao dịch theo loại
const getTransactionCountByType = async (req, res) => {
  try {
    const transactionCount = await Transaction.aggregate([
      {
        $group: {
          _id: "$type", // Nhóm theo loại giao dịch
          count: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(transactionCount);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

// 6. Tổng số tiền giao dịch theo loại
const getTransactionAmountByType = async (req, res) => {
  try {
    const transactionAmount = await Transaction.aggregate([
      {
        $group: {
          _id: "$type",
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);
    res.status(200).json(transactionAmount);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

// 7. Số lượng Mentor bị khóa
const getBlockedMentorCount = async (req, res) => {
  try {
    const blockedMentorCount = await User.countDocuments({
      role: "mentor",
      blocked: true,
    });
    res.status(200).json({ blockedMentorCount });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

// 8. Số lượng Mentor đã xác nhận
const getConfirmedMentorCount = async (req, res) => {
  try {
    const confirmedMentorCount = await User.countDocuments({
      role: "mentor",
      confirmed: true,
    });
    res.status(200).json({ confirmedMentorCount });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

// 9. Doanh thu hàng tháng của Admin (10% từ các giao dịch 'transfer')
const getMonthlyAdminRevenue = async (req, res) => {
  const currentMonth = new Date().getMonth();
  try {
    const transactions = await Transaction.aggregate([
      {
        $match: {
          type: "transfer",
          createdAt: {
            $gte: new Date(new Date().getFullYear(), currentMonth, 1),
          },
        },
      },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]);

    const totalRevenue =
      transactions.length > 0 ? transactions[0].totalAmount : 0;
    const adminFee = totalRevenue * 0.1; // 10% từ tổng số tiền giao dịch transfer

    res.status(200).json({ totalRevenue, adminFee });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

module.exports = {
  getUserCountByRole,
  getTransactionCountByStatus,
  getBookingCountByStatus,
  getTopMentorsByConsultationHours,
  getTransactionCountByType,
  getTransactionAmountByType,
  getBlockedMentorCount,
  getConfirmedMentorCount,
  getMonthlyAdminRevenue,
};
