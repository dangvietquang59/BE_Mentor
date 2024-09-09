const FreeTime = require("../models/Freetime");

async function getFreeTime(req, res) {
  try {
    const { userId } = req.params;
    const { page = 1 } = req.query;
    const limit = 12;

    const skip = (page - 1) * limit;

    const freetime = await FreeTime.find({ userId }).skip(skip).limit(limit);

    const totalRecords = await FreeTime.countDocuments({ userId });

    return res.status(200).json({
      page: parseInt(page, 10),
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
      freetime,
    });
  } catch (error) {
    console.log("Error when fetching freetime", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching free time" });
  }
}

async function createFreeTime(req, res) {
  try {
    const { freeDate, startTime, endTime } = req.body;
    const userId = req.user.userId;

    const newStartDate = new Date(`${freeDate}T${startTime}:00.000Z`);
    const newEndDate = new Date(`${freeDate}T${endTime}:00.000Z`);

    const existingFreeTimes = await FreeTime.find({
      userId,
      freeDate,
    });

    for (const time of existingFreeTimes) {
      const existingStartDate = new Date(
        `${time.freeDate}T${time.startTime}:00.000Z`
      );
      const existingEndDate = new Date(
        `${time.freeDate}T${time.endTime}:00.000Z`
      );

      if (
        (newStartDate < existingEndDate && newEndDate > existingStartDate) ||
        (newStartDate >= existingStartDate && newStartDate < existingEndDate)
      ) {
        return res
          .status(400)
          .json({ message: "Thời gian rảnh trùng lặp với lịch đã có." });
      }
    }

    const newFreeTime = new FreeTime({
      userId,
      freeDate,
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
    const { freeDate, startTime, endTime } = req.body;
    const userId = req.user.userId;

    const newStartDate = new Date(`${freeDate}T${startTime}:00.000Z`);
    const newEndDate = new Date(`${freeDate}T${endTime}:00.000Z`);

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
      ],
    });

    for (const time of existingFreeTimes) {
      if (newStartDate < time.endDate && newEndDate > time.startDate) {
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
