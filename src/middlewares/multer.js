const multer = require("multer");
const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

const singleUpload = upload.single("file");

module.exports = singleUpload;
