const User = require("../models/User");
const slugify = require("slugify");
const Technologies = require("../models/Technologies");

// Lấy tất cả người dùng với phân trang và lọc theo vai trò
async function getAllUsers(req, res) {
  try {
    const { role, page = 1 } = req.query;
    const limit = 12;
    const skip = (page - 1) * limit;

    // Xác định filter dựa trên vai trò
    const filter = role ? { role } : {};

    const allUsers = await User.find(filter).skip(skip).limit(limit).lean();
    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);

    // Lấy danh sách công nghệ từ người dùng
    const technologyIds = allUsers.flatMap((user) =>
      user.technologies.map((tech) => tech.technology)
    );
    const technologies = await Technologies.find({
      _id: { $in: technologyIds },
    }).lean();

    // Tạo bản đồ công nghệ để ánh xạ ID sang tên
    const techMap = technologies.reduce((acc, tech) => {
      acc[tech._id.toString()] = tech.name;
      return acc;
    }, {});

    // Ánh xạ công nghệ trong dữ liệu người dùng
    const enrichedUsers = allUsers.map((user) => ({
      ...user,
      technologies: user.technologies.map((tech) => ({
        ...tech,
        technology: {
          _id: tech.technology,
          name: techMap[tech.technology.toString()] || "Unknown",
        },
      })),
    }));

    return res.status(200).json({
      users: enrichedUsers,
      currentPage: parseInt(page, 10),
      totalPages,
      totalUsers,
    });
  } catch (error) {
    console.error("Error fetching users", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching users." });
  }
}

// Lấy thông tin chi tiết của người dùng
async function getProfile(req, res) {
  try {
    const { userId } = req.params;

    const profile = await User.findById(userId).populate({
      path: "technologies.technology",
      select: "name",
    });

    if (!profile) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(profile);
  } catch (error) {
    console.error("Error fetching user", error);
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
          const tech = await Technologies.findById(exp.technology);
          if (tech) {
            return {
              technology: tech._id,
              experienceYears: exp.experienceYears,
            };
          } else {
            console.warn(`Technology with id ${exp.technology} not found.`);
            return null;
          }
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
      .json({ error: "An error occurred while updating the profile" });
  }
}

// Cập nhật URL hình ảnh của người dùng
async function updateProfileImageUrl(req, res) {
  try {
    const { userId } = req.params;
    const { imageUrl } = req.body;

    if (!userId || !imageUrl) {
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
    return res
      .status(500)
      .json({ error: "An error occurred while updating the profile imageUrl" });
  }
}

module.exports = {
  getAllUsers,
  getProfile,
  updateProfile,
  updateProfileImageUrl,
};
