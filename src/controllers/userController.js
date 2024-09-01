const User = require("../models/User");
const slugify = require("slugify");
const Technologies = require("../models/Technologies");

async function getAllUsers(req, res) {
  try {
    const { role, page = 1 } = req.query;

    let filter = {};
    if (role === "Mentor") {
      filter.role = "Mentor";
    } else if (role === "Mentee") {
      filter.role = "Mentee";
    }

    const limit = 12;
    const skip = (page - 1) * limit;

    const allUsers = await User.find(filter).skip(skip).limit(limit).lean();

    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);

    const technologyIds = allUsers.flatMap((user) =>
      user.technologies.map((tech) => tech.technology)
    );

    const technologies = await Technologies.find({
      _id: { $in: technologyIds },
    }).lean();

    const techMap = technologies.reduce((acc, tech) => {
      acc[tech._id.toString()] = tech.name;
      return acc;
    }, {});

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
      currentPage: page,
      totalPages: totalPages,
      totalUsers: totalUsers,
    });
  } catch (error) {
    console.log("Error fetching users", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching the users." });
  }
}

async function getProfile(req, res) {
  try {
    const { userId } = req.params;

    const profile = await User.findOne({ _id: userId }).populate({
      path: "technologies.technology",
      select: "name",
    });

    if (!profile) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(profile);
  } catch (error) {
    console.log("Error fetching user", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the user." });
  }
}

async function updateProfile(req, res) {
  try {
    const { userId } = req.params;
    const { fullName, role, bio, experience, rating } = req.body;

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    let slug = existingUser.slug;
    if (fullName) {
      slug = slugify(fullName, { lower: true });
    }

    let formattedExperience = [];
    if (experience && Array.isArray(experience)) {
      if (experience.length > 0) {
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
        );
        formattedExperience = formattedExperience.filter((exp) => exp !== null);
      }
    }

    const updatedData = {
      ...existingUser.toObject(),
      ...(fullName && { fullName }),
      ...(role && { role }),
      ...(bio && { bio }),
      ...(rating && { rating }),
      ...(formattedExperience.length > 0
        ? { technologies: formattedExperience }
        : { technologies: [] }),
      slug,
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

async function updateProfileImageUrl(req, res) {
  try {
    const { userId } = req.params;
    const { imageUrl } = req.body;

    if (!userId || !imageUrl) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const updatedProfile = await User.findOneAndUpdate(
      { _id: userId },
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
