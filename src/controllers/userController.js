const User = require("../models/User");
const slugify = require("slugify");
const Technologies = require("../models/Technologies");
const mongoose = require("mongoose");

// Lấy tất cả người dùng với phân trang và lọc theo vai trò
async function getAllUsers(req, res) {
  try {
    const { role, page = 1, experiencesYear, jobtitle, technology } = req.query;
    const limit = 12;
    const skip = (page - 1) * limit;

    // Khởi tạo bộ lọc
    const filter = {};

    // Kiểm tra và thêm điều kiện cho role
    if (role) {
      filter.role = role;
    }

    // Kiểm tra và thêm điều kiện cho năm kinh nghiệm
    if (experiencesYear) {
      filter.technologies = {
        ...filter.technologies,
        $elemMatch: {
          experienceYears: { $gte: parseInt(experiencesYear, 10) },
        },
      };
    }

    // Kiểm tra và thêm điều kiện cho jobtitle
    if (jobtitle) {
      const jobTitlesArray = Array.isArray(jobtitle)
        ? jobtitle
        : jobtitle.split(",").map((id) => id.trim());
      filter.bio = {
        $in: jobTitlesArray.map((id) => new mongoose.Types.ObjectId(id)),
      }; // Sử dụng $in để tìm nhiều jobtitle
    }

    // Kiểm tra và thêm điều kiện cho technology
    if (technology) {
      const technologiesArray = Array.isArray(technology)
        ? technology
        : technology.split(",").map((id) => id.trim());
      filter.technologies = {
        ...filter.technologies,
        $elemMatch: {
          technology: {
            $in: technologiesArray.map((id) => new mongoose.Types.ObjectId(id)),
          },
        },
      };
    }

    // Truy vấn người dùng với bộ lọc đã thiết lập
    const allUsers = await User.find(filter)
      .select("-password") // Loại bỏ trường password
      .populate("bio") // Duyệt sinh trường bio
      .populate({
        path: "technologies.technology", // Duyệt sinh công nghệ
        model: "Technologies", // Chỉ định mô hình để duyệt sinh
      })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);

    return res.status(200).json({
      users: allUsers,
      currentPage: parseInt(page, 10),
      totalPages,
      totalUsers,
    });
  } catch (error) {
    console.error("Lỗi khi lấy người dùng:", error);
    return res.status(500).json({ error: "Đã xảy ra lỗi khi lấy người dùng." });
  }
}

// Lấy thông tin chi tiết của người dùng
async function getProfile(req, res) {
  try {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const profile = await User.findById(userId)
      .populate({
        path: "technologies.technology",
        select: "name",
      })
      .populate("bio");

    if (!profile) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(profile);
  } catch (error) {
    console.error("Error fetching user:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching user." });
  }
}

// Cập nhật thông tin người dùng
async function updateProfile(req, res) {
  try {
    const { userId } = req.params;
    const { fullName, role, bio, experience, rating } = req.body;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    let slug = existingUser.slug || "";
    if (fullName) {
      slug = slugify(fullName, { lower: true });
    }

    let formattedExperience = [];
    if (experience && Array.isArray(experience)) {
      formattedExperience = await Promise.all(
        experience.map(async (exp) => {
          if (!mongoose.isValidObjectId(exp.technology)) {
            console.warn(
              `Technology with id ${exp.technology} is not a valid ObjectId.`
            );
            return null;
          }

          const tech = await Technologies.findById(exp.technology);
          return tech
            ? { technology: tech._id, experienceYears: exp.experienceYears }
            : null;
        })
      ).then((results) => results.filter((exp) => exp !== null));
    }

    const updatedData = {
      fullName: fullName || existingUser.fullName,
      role: role || existingUser.role,
      bio: bio || existingUser.bio,
      rating: rating || existingUser.rating,
      technologies: formattedExperience.length
        ? formattedExperience
        : existingUser.technologies,
      slug: slug || existingUser.slug,
    };

    const updatedProfile = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    });
    return res.status(200).json(updatedProfile);
  } catch (error) {
    console.error("Error updating profile:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while updating the profile." });
  }
}

// Cập nhật URL hình ảnh của người dùng
async function updateProfileImageUrl(req, res) {
  try {
    const { userId } = req.params;
    const { imageUrl } = req.body;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (!imageUrl) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const updatedProfile = await User.findByIdAndUpdate(
      userId,
      { imageUrl },
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(updatedProfile);
  } catch (error) {
    console.error("Error updating profile imageUrl:", error);
    return res.status(500).json({
      error: "An error occurred while updating the profile imageUrl.",
    });
  }
}

module.exports = {
  getAllUsers,
  getProfile,
  updateProfile,
  updateProfileImageUrl,
};
