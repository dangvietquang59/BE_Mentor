"use strict";

var express = require("express");
var freetimeDetailRoutes = require("../controllers/freetimeDetailController");
var router = express.Router();
router.get("/", freetimeDetailRoutes.getFreeTimeDetails);
router.get("/:id", freetimeDetailRoutes.getFreeTimeDetailById);
router.post("/", freetimeDetailRoutes.createFreeTimeDetail);
router.put("/:id", freetimeDetailRoutes.updateFreeTimeDetail);
router["delete"]("/:id", freetimeDetailRoutes.deleteFreeTimeDetail);
module.exports = router;