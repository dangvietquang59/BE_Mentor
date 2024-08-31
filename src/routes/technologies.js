const express = require("express");
const router = express.Router();
const TechnologiesController = require("../controllers/technologiesController");

router.get("/", TechnologiesController.getAll);
module.exports = router;
