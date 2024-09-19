const FreeTime = require("../models/Freetime");
const FreeTimeDetail = require("../models/FreetimeDetail");
const freeTimeDetail = require("../models/FreetimeDetail");

// Hàm hỗ trợ chuyển đổi múi giờ sang giờ Việt Nam
function convertToVietnamTime(date) {
  const utcDate = new Date(date);
  // Chuyển đổi giờ UTC sang giờ Việt Nam (UTC+7)
  utcDate.setHours(utcDate.getHours() + 7);
  return utcDate;
}

// Lấy danh sách FreeTime
async function getFreeTime(req, res) {
  try {
    const { userId } = req.params;
    const { page = 1 } = req.query;
    const limit = 12;
    const skip = (page - 1) * limit;

    const freetime = await FreeTime.find({ userId })
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit)
      .populate("freeTimeDeail");

    const totalRecords = await FreeTime.countDocuments({ userId });

    // Chuyển đổi tất cả thời gian sang múi giờ Việt Nam
    const freetimeVietnam = freetime.map((ft) => ({
      ...ft._doc,
      freeDate: convertToVietnamTime(ft.freeDate),
    }));

    return res.status(200).json({
      page: parseInt(page, 10),
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
      freetime: freetimeVietnam,
    });
  } catch (error) {
    console.log("Error when fetching freetime", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching free time" });
  }
}

// Tạo mới FreeTime
async function createFreeTime(req, res) {
  try {
    const { userId, freeDate, freeTimeDetail } = req.body;

    if (!freeTimeDetail || !freeTimeDetail.length) {
      return res.status(400).json({ error: "FreeTimeDetail is required." });
    }

    const { from, to, name } = freeTimeDetail[0];

    if (new Date(from) >= new Date(to)) {
      return res
        .status(400)
        .json({ error: "'from' time must be earlier than 'to' time." });
    }

    let existingFreeTime = await FreeTime.findOne({
      userId: userId,
      freeDate: freeDate,
    }).populate("freeTimeDeail");

    if (existingFreeTime) {
      const overlappingTime = existingFreeTime.freeTimeDeail.some((detail) => {
        const detailFrom = new Date(detail.from);
        const detailTo = new Date(detail.to);

        return (
          (new Date(from) < detailTo && new Date(from) >= detailFrom) ||
          (new Date(to) <= detailTo && new Date(to) > detailFrom) ||
          (new Date(from) <= detailFrom && new Date(to) >= detailTo)
        );
      });

      if (overlappingTime) {
        return res
          .status(400)
          .json({ error: "Time slot overlaps with existing free time." });
      }
    } else {
      // Nếu không tồn tại FreeTime, tạo FreeTime mới
      existingFreeTime = new FreeTime({
        userId: userId,
        freeDate: freeDate,
      });
      await existingFreeTime.save(); // Lưu FreeTime trước để có _id
    }

    // Tạo FreeTimeDetail với freeTimeId là _id của FreeTime mới hoặc đã tồn tại
    const newFreeTimeDetail = await FreeTimeDetail.create({
      freeTimeId: existingFreeTime._id,
      name,
      from,
      to,
      status: "Pending",
    });

    // Thêm FreeTimeDetail vào FreeTime và lưu lại
    existingFreeTime.freeTimeDeail.push(newFreeTimeDetail._id);
    await existingFreeTime.save();

    res.status(201).json({ message: "Free time created successfully" });
  } catch (error) {
    console.error("Error creating free time:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating free time" });
  }
}

// Cập nhật FreeTime
async function updateFreeTime(req, res) {
  try {
    const { freetimeId } = req.params;
    const { freeDate, startTime, endTime } = req.body;
    const userId = req.user.userId;

    // Chuyển đổi thời gian sang múi giờ Việt Nam
    const newStartDate = convertToVietnamTime(
      `${freeDate}T${startTime}:00.000Z`
    );
    const newEndDate = convertToVietnamTime(`${freeDate}T${endTime}:00.000Z`);

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

// Xóa FreeTime
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
