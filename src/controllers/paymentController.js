require("dotenv").config();
const moment = require("moment");
const crypto = require("crypto");
const querystring = require("qs");
const Transaction = require("../models/Transactions");
const User = require("../models/User");

async function updateUserBalance(userId, amount) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  user.coin += amount;
  if (user.coin < 0) throw new Error("Insufficient balance");
  await user.save();
}

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

const createPayment = (req, res) => {
  process.env.TZ = "Asia/Ho_Chi_Minh";
  const userId = req.user.userId;
  let date = new Date();
  let createDate = moment(date).format("YYYYMMDDHHmmss");

  let ipAddr =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  let tmnCode = process.env.VNP_TMN_CODE;
  let secretKey = process.env.VNP_HASH_SECRET;
  let vnpUrl = process.env.VNP_URL;
  let returnUrl = process.env.VNP_RETURN_URL;
  let orderId = moment(date).format("DDHHmmss");
  let amount = req.body.amount;
  let locale = req.body.language || "vn";

  let vnp_Params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Locale: locale,
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderId,
    vnp_OrderInfo: "Payment for order ID: " + userId,
    vnp_OrderType: "other",
    vnp_Amount: amount * 100,
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
  };

  vnp_Params = sortObject(vnp_Params);

  let signData = querystring.stringify(vnp_Params, { encode: false });
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  vnp_Params["vnp_SecureHash"] = signed;
  vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });

  res.json({ vnpUrl });
};

const paymentResponse = async (req, res) => {
  const params = req.query;
  const secureHash = params["vnp_SecureHash"];
  delete params["vnp_SecureHash"];

  const sortedParams = sortObject(params);
  const signData = querystring.stringify(sortedParams, { encode: false });

  const hmac = crypto.createHmac("sha512", process.env.VNP_HASH_SECRET);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  if (secureHash === signed) {
    if (params["vnp_ResponseCode"] === "00") {
      // Xử lý giao dịch thành công
      const userId = params["vnp_OrderInfo"].split(": ")[1];
      const amount = parseInt(params["vnp_Amount"]) / 100;

      try {
        // Tạo giao dịch nạp tiền
        const transaction = new Transaction({
          userId,
          type: "deposit",
          amount,
          status: "success", // Đánh dấu ngay là thành công
        });

        await transaction.save();

        await updateUserBalance(userId, amount);

        res.redirect(process.env.VNP_RETURN_URL_SUCCESS);
      } catch (error) {
        console.error("Failed to process transaction: ", error);
        res.status(500).json({ error: error.message });
      }
    } else {
      res.redirect(process.env.VNP_RETURN_URL_FAILED);
    }
  } else {
    res.status(403).send("Invalid signature");
  }
};

module.exports = { createPayment, paymentResponse };
