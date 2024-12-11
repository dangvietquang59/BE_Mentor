const FreeTime = require("../models/Freetime");
const FreeTimeDetail = require("../models/FreetimeDetail");
const moment = require("moment");
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

    // Lấy ngày hôm nay và đặt thời gian về đầu ngày (00:00) để so sánh
    const today = moment().startOf("day").toDate();

    // Tìm kiếm FreeTime cho userId, từ hôm nay trở đi
    const freetime = await FreeTime.find({
      userId,
      freeDate: { $gte: today }, // Lọc các bản ghi có freeDate lớn hơn hoặc bằng hôm nay
    })
      .sort({ freeDate: 1 }) // Sắp xếp theo freeDate tăng dần
      .skip(skip)
      .limit(limit)
      .populate("freeTimeDetail"); // Lấy toàn bộ freeTimeDetail để lọc tiếp theo

    console.log("🚀 ~ getFreeTime ~ freetime:", freetime);

    const totalRecords = await FreeTime.countDocuments({
      userId,
      freeDate: { $gte: today },
    });

    // Chuyển đổi tất cả thời gian sang múi giờ Việt Nam và lọc freeTimeDetail có trạng thái Pending
    const freetimeVietnam = freetime.map((ft) => ({
      ...ft._doc,
      freeDate: convertToVietnamTime(ft.freeDate),
      // Chỉ giữ lại các freeTimeDetail có status là "Pending"
      freeTimeDetail: ft.freeTimeDetail.filter(
        (detail) => detail.status === "Availabe"
      ),
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
    const { freeDate, freeTimeDetail } = req.body;
    const userId = req.user.userId;

    // Validate input data
    if (
      !userId ||
      !freeDate ||
      !Array.isArray(freeTimeDetail) ||
      freeTimeDetail.length === 0
    ) {
      return res.status(400).json({ message: "Dữ liệu đầu vào không hợp lệ" });
    }

    // Normalize the freeDate to 00:00:00.000 UTC
    // const normalizedFreeDate = new Date(freeDate);
    // normalizedFreeDate.setHours(0, 0, 0, 0); // Set time to midnight UTC for comparison

    // Check if there is already a FreeTime entry for this user and date
    const existingFreeTime = await FreeTime.findOne({
      userId,
      freeDate,
    });

    if (existingFreeTime) {
      return res
        .status(409)
        .json({ message: "FreeTime cho ngày này đã tồn tại" });
    }

    // Create a new FreeTime document
    const newFreeTime = new FreeTime({
      userId,
      freeDate: freeDate, // Store original freeDate
      freeTimeDetail: [], // Start with an empty array for the details
    });

    await newFreeTime.save(); // Save FreeTime first to get its ID

    // Process the freeTimeDetail to create FreeTimeDetail documents
    const freeTimeDetailDocs = await Promise.all(
      freeTimeDetail.map(async (detail) => {
        const { name, from, to } = detail;
        const fromDateTime = new Date(freeDate);
        const toDateTime = new Date(freeDate);

        // Set hours and minutes for 'from' and 'to'
        const [fromHours, fromMinutes] = from.split(":").map(Number);
        const [toHours, toMinutes] = to.split(":").map(Number);
        fromDateTime.setHours(fromHours, fromMinutes, 0, 0);
        toDateTime.setHours(toHours, toMinutes, 0, 0);

        // Create a new FreeTimeDetail document
        const freeTimeDetailDoc = new FreeTimeDetail({
          name,
          freeTimeId: newFreeTime._id, // Link to the FreeTime ID
          from: fromDateTime,
          to: toDateTime,
        });

        return await freeTimeDetailDoc.save(); // Save the FreeTimeDetail document
      })
    );

    // Update the FreeTime document to include the FreeTimeDetail references
    newFreeTime.freeTimeDetail = freeTimeDetailDocs.map((doc) => doc._id);
    await newFreeTime.save();

    // Return a success response with the new FreeTime object
    return res
      .status(201)
      .json({ message: "FreeTime đã được tạo thành công", data: newFreeTime });
  } catch (error) {
    console.error("Lỗi khi tạo FreeTime:", error);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
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
