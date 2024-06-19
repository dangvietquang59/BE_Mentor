const FreeTime = require("../models/Freetime");

async function getFreeTime(req, res) {
  try {
    const { userId } = req.params;
    const freetime = await FreeTime.find({ userId });
    return res.status(200).json(freetime);
  } catch (error) {
    console.log("Error when fetching freetime", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching free time" });
  }
}

async function createFreeTime(req, res) {
  try {
    const { startDate, endDate, startTime, endTime } = req.body;
    const userId = req.user.userId;

    const newStartDate = new Date(startDate);
    const newEndDate = new Date(endDate);

    const existingFreeTimes = await FreeTime.find({
      userId,
      $or: [
        {
          $and: [
            { startDate: { $lte: newEndDate } },
            { endDate: { $gte: newStartDate } },
          ],
        },
        {
          $and: [{ startDate: newStartDate }, { endDate: newEndDate }],
        },
      ],
    });

    const isTimeOverlap = (
      newStartTime,
      newEndTime,
      existingStartTime,
      existingEndTime
    ) => {
      return newStartTime < existingEndTime && newEndTime > existingStartTime;
    };

    for (const time of existingFreeTimes) {
      if (isTimeOverlap(startTime, endTime, time.startTime, time.endTime)) {
        return res
          .status(400)
          .json({ message: "Thời gian rảnh trùng lặp với lịch đã có." });
      }
    }

    const newFreeTime = new FreeTime({
      userId,
      startDate: newStartDate,
      endDate: newEndDate,
      startTime,
      endTime,
    });

    const savedFreeTime = await newFreeTime.save();
    res.status(201).json(savedFreeTime);
  } catch (error) {
    console.error("Error creating free time:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating free time" });
  }
}
async function updateFreeTime(req, res) {
  try {
    const { freetimeId } = req.params;
    const { startDate, endDate, startTime, endTime } = req.body;
    const userId = req.user.userId;

    const newStartDate = new Date(startDate);
    const newEndDate = new Date(endDate);

    const existingFreeTimes = await FreeTime.find({
      userId,
      _id: { $ne: freetimeId },
      $or: [
        {
          $and: [
            { startDate: { $lte: newEndDate } },
            { endDate: { $gte: newStartDate } },
          ],
        },
        {
          $and: [{ startDate: newStartDate }, { endDate: newEndDate }],
        },
      ],
    });

    const isTimeOverlap = (
      newStartTime,
      newEndTime,
      existingStartTime,
      existingEndTime
    ) => {
      return newStartTime < existingEndTime && newEndTime > existingStartTime;
    };

    for (const time of existingFreeTimes) {
      if (isTimeOverlap(startTime, endTime, time.startTime, time.endTime)) {
        return res
          .status(400)
          .json({ message: "Thời gian rảnh trùng lặp với lịch đã có." });
      }
    }

    const updatedFreeTime = await FreeTime.findByIdAndUpdate(
      freetimeId,
      { startDate: newStartDate, endDate: newEndDate, startTime, endTime },
      { new: true }
    );

    if (!updatedFreeTime) {
      return res.status(404).json({ message: "Thời gian rảnh không tồn tại." });
    }

    res.status(200).json(updatedFreeTime);
  } catch (error) {
    console.error("Error updating free time:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating free time" });
  }
}
async function deleteFreeTime(req, res) {
  try {
    const { freetimeId } = req.params;
    const userId = req.user.userId;

    const deletedFreeTime = await FreeTime.findOneAndDelete({
      _id: freetimeId,
      userId,
    });

    if (!deletedFreeTime) {
      return res.status(404).json({ message: "Thời gian rảnh không tồn tại." });
    }

    res.status(200).json({ message: "Thời gian rảnh đã được xóa." });
  } catch (error) {
    console.error("Error deleting free time:", error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting free time" });
  }
}

module.exports = {
  createFreeTime,
  getFreeTime,
  deleteFreeTime,
  updateFreeTime,
};
