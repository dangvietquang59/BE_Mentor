const Transaction = require("../models/Transactions");
const User = require("../models/User");
const AdminRevenue = require("../models/AdminRevenue");

// Helper: Cập nhật số dư người dùng
async function updateUserBalance(userId, amount) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  user.coin += amount;
  if (user.coin < 0) throw new Error("Insufficient balance");
  await user.save();
}

// Nạp tiền (Deposit)
exports.deposit = async (req, res) => {
  const { userId, amount } = req.body;

  try {
    if (amount <= 0) throw new Error("Amount must be greater than zero");

    const transaction = new Transaction({
      userId,
      type: "deposit",
      amount,
      status: "pending",
    });

    await transaction.save();
    res.json({ message: "Deposit request submitted", transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Rút tiền (Withdrawal)
exports.withdraw = async (req, res) => {
  const { userId, amount } = req.body;

  try {
    if (amount <= 0) throw new Error("Amount must be greater than zero");

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    if (user.coin < amount) throw new Error("Insufficient balance");

    const transaction = new Transaction({
      userId,
      type: "withdrawal",
      amount: -amount,
      status: "pending", // Chờ admin xử lý
    });

    await transaction.save();
    user.coin -= amount;
    await user.save();

    res.json({ message: "Withdrawal request submitted", transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.transfer = async (req, res) => {
  const { userId, recipientId, amount, bookingId } = req.body;

  try {
    if (amount <= 0) throw new Error("Amount must be greater than zero");

    const sender = await User.findById(userId);
    const recipient = await User.findById(recipientId);

    if (!sender || !recipient) throw new Error("User not found");
    if (sender.coin < amount) throw new Error("Insufficient balance");

    const userAmout = (amount * 90) / 100;
    const adminAmount = (amount * 10) / 100;

    const transaction = new Transaction({
      userId,
      relatedUserId: recipientId,
      type: "transfer",
      amount: userAmout,
      bookingId,
      status: "success",
    });

    await transaction.save();

    const adminRevenue = new AdminRevenue({
      transactionId: transaction._id,
      amount: adminAmount,
    });

    await adminRevenue.save();

    await updateUserBalance(sender._id, -amount);
    await updateUserBalance(recipient._id, amount);

    res.json({ message: "Transfer request submitted", transaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
// Admin xử lý giao dịch (Approve/Reject)
exports.processTransaction = async (req, res) => {
  const { transactionId, action } = req.body;

  try {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction || transaction.status !== "pending") {
      throw new Error("Transaction not valid or already processed");
    }

    const user = await User.findById(transaction.userId);
    if (!user) throw new Error("User not found");

    if (action === "approve") {
      transaction.status = "success";

      // Nếu là rút tiền, không cần hoàn tiền
      if (transaction.type === "withdrawal") {
        // Tiền đã bị trừ trước khi tạo giao dịch, không cần thay đổi thêm.
      } else if (transaction.type === "deposit") {
        await updateUserBalance(transaction.userId, transaction.amount);
      }
    } else if (action === "reject") {
      transaction.status = "failed";

      // Hoàn lại tiền nếu là rút tiền
      if (transaction.type === "withdrawal") {
        user.coin += Math.abs(transaction.amount);
        await user.save();
      }
    }

    await transaction.save();

    res.json({ message: `Transaction ${action}ed successfully`, transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy danh sách giao dịch của người dùng
exports.getTransactionsByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    // Truy vấn tất cả các giao dịch của người dùng với userId hoặc relatedUserId
    const transactions = await Transaction.find({
      $or: [{ userId: userId }, { relatedUserId: userId }],
    })
      .populate("userId relatedUserId")
      .sort({ createdAt: -1 });

    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
