const express = require("express");

const freetimeDetailRoutes = require("../controllers/freetimeDetailController");

const router = express.Router();

router.get("/", freetimeDetailRoutes.getFreeTimeDetails);

router.get("/:id", freetimeDetailRoutes.getFreeTimeDetailById);

router.post("/", freetimeDetailRoutes.createFreeTimeDetail);

router.put("/:id", freetimeDetailRoutes.updateFreeTimeDetail);

router.delete("/:id", freetimeDetailRoutes.deleteFreeTimeDetail);

module.exports = router;
