const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const RefreshToken = require("../models/refreshtoken");

async function login(req, res) {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không chính xác." });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không chính xác." });
    }

    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "2h" }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_TOKEN_SECRET
    );

    const newRefreshToken = new RefreshToken({
      userId: user._id,
      token: refreshToken,
    });
    await newRefreshToken.save();

    const { password: userPassword, ...userInformation } = user.toObject();

    res.json({
      message: "Đăng nhập thành công.",
      data: userInformation,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res
      .status(500)
      .json({ message: "Đã xảy ra lỗi trong quá trình đăng nhập." });
  }
}

async function register(req, res) {
  const { email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã được sử dụng." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ email, password: hashedPassword, role });
    await newUser.save();

    res.json({ message: "Đăng ký thành công." });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({
      message: "Đã xảy ra lỗi trong quá trình đăng ký.",
      error: error.message,
    });
  }
}

async function logout(req, res) {
  const refreshToken = req.body.refreshToken;

  try {
    await RefreshToken.deleteOne({ token: refreshToken });
    res.json({ message: "Đăng xuất thành công." });
  } catch (error) {
    console.error("Error during logout:", error);
    res
      .status(500)
      .json({ message: "Đã xảy ra lỗi trong quá trình đăng xuất." });
  }
}

module.exports = { login, register, logout };
