"use strict";

var express = require("express");
var db = require("./config/db");
var authRoutes = require("./routes/auth");
var userRoutes = require("./routes/users");
var postRoutes = require("./routes/posts");
var freetimeRoutes = require("./routes/freetime");
var bookingRoutes = require("./routes/booking");
var app = express();
var cors = require("cors");
db();
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cors({
  origin: "http://localhost:8080",
  methods: ["GET", "POST", "PUT", "DELETE"]
}));
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/freetime", freetimeRoutes);
app.use("/booking", bookingRoutes);
var PORT = process.env.PORT || 5000;
app.listen(PORT, function () {
  console.log("Server is running on port ".concat(PORT));
});