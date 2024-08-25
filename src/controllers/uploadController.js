const cloudinary = require("../config/cloudinary/index");

const uploadFile = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream((error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
      stream.end(file.buffer);
    });

    res.status(200).json({ message: "Upload successful", result });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

module.exports = {
  uploadFile,
};
