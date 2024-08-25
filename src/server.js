const express = require("express");
const db = require("./config/db");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");
const freetimeRoutes = require("./routes/freetime");
const bookingRoutes = require("./routes/booking");
const uploadRoutes = require("./routes/upload");
const app = express();
const cors = require("cors");
db();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: ["https://mentor-steel.vercel.app", "http://localhost:8080"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/freetime", freetimeRoutes);
app.use("/booking", bookingRoutes);
app.use("/v2", uploadRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
