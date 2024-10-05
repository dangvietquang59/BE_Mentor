const express = require("express");
const router = express.Router();
const TechnologiesController = require("../controllers/technologiesController");
const authMiddleware = require("../middlewares/authMiddleware");
router.get("/", TechnologiesController.getAll);

router.post(
  "/",
  authMiddleware.authenticateToken,
  TechnologiesController.create
);

router.put("/:id", TechnologiesController.update);

router.delete(
  "/:id",
  authMiddleware.authenticateToken,
  TechnologiesController.remove
);

module.exports = router;
