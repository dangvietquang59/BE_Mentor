const multer = require("multer");

// Cấu hình Multer để lưu trữ file trong bộ nhớ
const storage = multer.memoryStorage();

const upload = multer({ storage });

module.exports = upload;
