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

// Chuyển tiền (Transfer)
exports.transfer = async (req, res) => {
  const { userId, recipientId, amount } = req.body;

  try {
    if (amount <= 0) throw new Error("Amount must be greater than zero");

    const sender = await User.findById(userId);
    const recipient = await User.findById(recipientId);

    if (!sender || !recipient) throw new Error("User not found");
    if (sender.coin < amount) throw new Error("Insufficient balance");

    // Tạo giao dịch chuyển tiền
    const transaction = new Transaction({
      userId,
      relatedUserId: recipientId,
      type: "transfer",
      amount,
      status: "pending", // Chờ admin xử lý
    });

    await transaction.save();
    // Cập nhật số dư người gửi và người nhận
    await updateUserBalance(sender._id, -amount);
    await updateUserBalance(recipient._id, amount);

    res.json({ message: "Transfer request submitted", transaction });
  } catch (error) {
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
