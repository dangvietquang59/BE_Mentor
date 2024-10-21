const User = require("../models/User");
const slugify = require("slugify");
const Technologies = require("../models/Technologies");
const mongoose = require("mongoose");

// Lấy tất cả người dùng với phân trang và lọc theo vai trò
async function getAllUsers(req, res) {
  try {
    const {
      role,
      page = 1,
      experiencesYear,
      jobtitle,
      technology,
      search,
      rating,
    } = req.query;
    const limit = 12;
    const skip = (page - 1) * limit;

    // Initialize filters
    const filter = {};

    // Role filter
    if (role) {
      filter.role = role;
    }

    // Filter by experience years
    if (experiencesYear) {
      filter.technologies = {
        ...filter.technologies,
        $elemMatch: {
          experienceYears: { $gte: parseInt(experiencesYear, 10) },
        },
      };
    }

    // Filter by job title
    if (jobtitle) {
      const jobTitlesArray = Array.isArray(jobtitle)
        ? jobtitle
        : jobtitle.split(",").map((id) => id.trim());
      filter.bio = {
        $in: jobTitlesArray.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }

    // Filter by technology
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

    // Search by user name
    if (search) {
      filter.fullName = { $regex: search, $options: "i" };
    }

    // Sorting logic
    const sort = {};
    if (rating) {
      sort.rating = rating === "ASC" ? 1 : -1;
    }

    // Sort by name (ASC/DESC)
    if (req.query.sortByName) {
      sort.name = req.query.sortByName === "ASC" ? 1 : -1;
    }

    // Query users with filters
    const allUsers = await User.find(filter)
      .select("-password")
      .populate("bio")
      .populate({
        path: "technologies.technology",
        model: "Technologies",
      })
      .sort(sort) // Apply sorting
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
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Error fetching users." });
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
