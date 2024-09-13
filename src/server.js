const express = require("express");
const db = require("./config/db");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");
const freetimeRoutes = require("./routes/freetime");
const bookingRoutes = require("./routes/booking");
const uploadRoutes = require("./routes/upload");
const technologiesRoutues = require("./routes/technologies");
const chatGroupRoutes = require("./routes/chat");
const messageRoutes = require("./routes/message");
const cron = require("node-cron");
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
app.use("/technologies", technologiesRoutues);
app.use("/chat-groups", chatGroupRoutes);
app.use("/messages", messageRoutes);
app.use("/uploads", express.static("uploads"));

cron.schedule("*/1 * * * *", () => {
  console.log("Running a task every 1 minutes");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
