const express = require("express");
const router = express.Router();
const freetimeController = require("../controllers/freetimeController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post(
  "/create-free-time",
  authMiddleware.authenticateToken,
  freetimeController.createFreeTime
);
router.get(
  "/get-free-time/:userId",
  authMiddleware.authenticateToken,
  freetimeController.getFreeTime
);
router.put(
  "/update-free-time/:freetimeId",
  authMiddleware.authenticateToken,
  freetimeController.updateFreeTime
);

router.delete(
  "/delete-free-time/:freetimeId",
  authMiddleware.authenticateToken,
  freetimeController.deleteFreeTime
);
module.exports = router;
