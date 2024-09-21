"use strict";

var express = require("express");
var router = express.Router();
var TechnologiesController = require("../controllers/technologiesController");
router.get("/", TechnologiesController.getAll);
module.exports = router;