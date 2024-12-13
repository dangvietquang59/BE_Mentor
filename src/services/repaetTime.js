const moment = require("moment");
const FreeTimeDetail = require("../models/FreetimeDetail");

async function repeatFreeTimeDetails() {
  const today = new Date();
  const dayOfWeek = today.getDay();

  const detailsToRepeat = await FreeTimeDetail.find({
    repeatDays: dayOfWeek,
  });

  for (const detail of detailsToRepeat) {
    const nextWeekFrom = moment(detail.from).add(1, "week").toDate();
    const nextWeekTo = moment(detail.to).add(1, "week").toDate();

    const newDetail = new FreeTimeDetail({
      freeTimeId: detail.freeTimeId,
      name: detail.name,
      from: nextWeekFrom,
      to: nextWeekTo,
      status: "Availabe",
      repeatDays: detail.repeatDays,
    });

    await newDetail.save();
  }

  console.log("Lịch đã được lặp lại thành công.");
}

repeatFreeTimeDetails();
