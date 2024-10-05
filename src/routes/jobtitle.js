const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobTitleController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", jobController.getJobs);

router.post("/", authMiddleware.authenticateToken, jobController.createJob);

router.get("/:id", jobController.getJobById);

router.put("/:id", authMiddleware.authenticateToken, jobController.updateJob);

router.delete(
  "/:id",
  authMiddleware.authenticateToken,
  jobController.deleteJob
);

module.exports = router;
