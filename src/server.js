const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const db = require("./config/db");
const { ExpressPeerServer } = require("peer");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");
const freetimeRoutes = require("./routes/freetime");
const freetimeDetailRoutes = require("./routes/freetimeDetail");
const bookingRoutes = require("./routes/booking");
const uploadRoutes = require("./routes/upload");
const technologiesRoutues = require("./routes/technologies");
const chatGroupRoutes = require("./routes/chat");
const jobTitleRoutes = require("./routes/jobtitle");
const commentRoutes = require("./routes/comment");
const notificationRoutes = require("./routes/notification");
const reviewRoutes = require("./routes/review");
const paymentRoutes = require("./routes/payment");
const transactionsRoutes = require("./routes/transaction.js");
const tagRoutes = require("./routes/tag.js");
const adminRoutes = require("./routes/admin.js");
const repeatFreeTimeDetails = require("./services/repaetTime.js");

const cron = require("node-cron");
const cors = require("cors");
const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: [
      "https://mentor-steel.vercel.app",
      "http://localhost:8080",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});
const peerServer = ExpressPeerServer(server, {
  debug: 2,
  port: 3001,
});
app.use("/peerjs", peerServer);

peerServer.on("connection", (client) => {
  console.log("Client connected: " + client.getId());
});

peerServer.on("disconnect", (client) => {
  console.log("Client disconnected: " + client.getId());
});
const messageRoutes = require("./routes/message")(io);

db();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: [
      "https://mentor-steel.vercel.app",
      "http://localhost:8080",
      "http://localhost:5173",
      process.env.VNP_URL,
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/freetime", freetimeRoutes);
app.use("/freetimeDetails", freetimeDetailRoutes);
app.use("/booking", bookingRoutes);
app.use("/v2", uploadRoutes);
app.use("/technologies", technologiesRoutues);
app.use("/chat-groups", chatGroupRoutes);
app.use("/messages", messageRoutes);
app.use("/jobTitle", jobTitleRoutes);
app.use("/comments", commentRoutes);
app.use("/notifications", notificationRoutes);
app.use("/reviews", reviewRoutes);
app.use("/payment", paymentRoutes);
app.use("/transactions", transactionsRoutes);
app.use("/tags", tagRoutes);
app.use("/statistics", adminRoutes);
app.use("/uploads", express.static("uploads"));

cron.schedule("0 0 * * *", () => {
  repeatFreeTimeDetails();
});
//for chat realtime
require("./utils/Socket.js")(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
