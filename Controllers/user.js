const User = require("../Models/user");
const bcrypt = require("bcrypt");
const jwt = require("../Services/jwt");
const monPaginate = require("mongoose-pagination");
const fs = require("fs");
const path = require("path");
const followService = require("../Services/followService");
const Publication = require("../Models/publication");

const pruebaUser = (req, res) => {
  return res.status(200).send({
    message: "User endpoint working",
  });
};

const register = (req, res) => {
  let params = req.body;

  if (
    !params.name ||
    !params.surname ||
    !params.nickname ||
    !params.email ||
    !params.password
  ) {
    return res.status(400).json({
      status: "error",
      message: "All fields are required",
    });
  }

  User.find({
    $or: [
      { email: params.email.toLowerCase() },
      { nickname: params.nickname.toLowerCase() },
    ],
  })
    .then((users) => {
      if (users && users.length >= 1) {
        return res.status(409).json({
          status: "error",
          message: "User already exists",
        });
      }
      // Hash password
      return bcrypt
        .hash(params.password, 10)
        .then((hash) => {
          params.password = hash;
          let user = new User(params);
          return user.save();
        })
        .then((userStored) => {
          if (!userStored) {
            return res.status(500).send({
              status: "error",
              message: "There was an unexpected error",
            });
          }
          return res.status(200).json({
            status: "success",
            message: "User registered successfully",
            user: userStored,
          });
        })
        .catch((error) => {
          return res.status(500).send({
            status: "error",
            message: "There was an unexpected error",
          });
        });
    })
    .catch((error) => {
      return res
        .status(500)
        .json({ status: "error", message: "There was an unexpected error" });
    });
};

const login = async (req, res) => {
  let params = req.body;

  if (!params.email || !params.password) {
    return res.status(400).send({
      status: "error",
      message: "Email and password are required",
    });
  }

  try {
    const user = await User.findOne({ email: params.email });

    if (!user) {
      return res.status(404).send({
        status: "error",
        message: "User not found",
      });
    }

    const pwd = bcrypt.compareSync(params.password, user.password);
    if (!pwd) {
      return res.status(401).send({
        status: "error",
        message: "Invalid email or password",
      });
    }

    const token = jwt.createToken(user);

    return res.status(200).send({
      status: "success",
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        nickname: user.nickname,
      },
      token,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "There was an unexpected error",
    });
  }
};

const profile = async (req, res) => {
  const userId = req.params.id;

  try {
    const userProfile = await User.findById(userId).select({
      password: 0,
      role: 0,
    });

    const followData = followService.followingUser(req.user.id, userId);

    if (!userProfile) {
      return res.status(404).send({
        status: "error",
        message: "User not found",
      });
    }

    return res.status(200).send({
      status: "success",
      user: userProfile,
      following: followData.following,
      follower: followData.follower,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "There was an unexpected error",
    });
  }
};

const counter = async (req, res) => {
  let userId = req.user.id;
  if (req.params.id) userId = req.params.id;

  try {
    const following = await Follow.count({ user: userId });
    const followers = await Follow.count({ followed: userId });
    const publications = await Publication.count({ user: userId });

    return res.status(200).send({
      status: "success",
      following,
      followers,
      publications,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "There was an unexpected error",
    });
  }
};

const list = async (req, res) => {
  let page = parseInt(req.params.page) || 1;
  let itemsPerPage = 5;

  try {
    const skip = (page - 1) * itemsPerPage;
    const users = await User.find()
      .select("-password -role -__v -email")
      .sort("_id")
      .skip(skip)
      .limit(itemsPerPage);

    const total = await User.countDocuments();

    if (!users || users.length === 0) {
      return res.status(404).send({
        status: "error",
        message: "There are no available users",
      });
    }

    let followUserId = await followService.followUserId(req.user.id);

    return res.status(200).send({
      status: "success",
      users,
      total,
      pages: Math.ceil(total / itemsPerPage),
      currentPage: page,
      user_following: followUserId.following,
      user_followers: followUserId.followers,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "There was an unexpected error",
    });
  }
};

const update = async (req, res) => {
  let userId = req.user.id;
  let updateData = req.body;

  // Remove fields that shouldn't be updated
  delete updateData.iat;
  delete updateData.exp;
  delete updateData.role;
  delete updateData.image;

  try {
    // Check if email or nickname already exists (excluding current user)
    if (updateData.email || updateData.nickname) {
      const existingUser = await User.findOne({
        $and: [
          { _id: { $ne: userId } }, // Exclude current user
          {
            $or: [
              { email: updateData.email?.toLowerCase() },
              { nickname: updateData.nickname?.toLowerCase() },
            ],
          },
        ],
      });

      if (existingUser) {
        return res.status(409).json({
          status: "error",
          message: "Email or nickname already exists",
        });
      }
    }

    // Hash password if provided
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select({ password: 0 });

    if (!updatedUser) {
      return res.status(404).send({
        status: "error",
        message: "User not found",
      });
    }

    return res.status(200).send({
      status: "success",
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "There was an unexpected error",
      error: error.message,
    });
  }
};

const uploadAvatar = (req, res) => {
  if (!req.file) {
    return res.status(400).send({
      status: "error",
      message: "No file uploaded",
    });
  }

  let image = req.file.filename;
  let imageSplit = image.split(".");
  let ext = imageSplit[1];

  if (ext !== "png" && ext !== "jpg" && ext !== "jpeg" && ext !== "gif") {
    const file = req.files.path;
    fs.unlink(file, (err) => {
      return res.status(400).send({
        status: "error",
        message: "Invalid file extension",
      });
    });
  }

  User.findByIdAndUpdate(
    { _id: req.user.id },
    { image: req.file.filename },
    { new: true },
    (err, userUpdated) => {
      if (err || !userUpdated) {
        return res.status(500).send({
          status: "error",
          message: "There was an unexpected error",
        });
      }
      return res.status(200).send({
        status: "success",
        user: userUpdated,
        file: req.file,
      });
    }
  );
};

const avatar = (req, res) => {
  const file = req.params.file;
  const filePath = `./uploads/avatars/${file}`;

  fs.stat(filePath, (err, exists) => {
    if (err || !exists) {
      return res.status(404).send({
        status: "error",
        message: "Avatar not found",
      });
    }
    return res.sendFile(path.resolve(filePath));
  });
};

module.exports = {
  pruebaUser,
  register,
  login,
  profile,
  list,
  update,
  uploadAvatar,
  avatar,
  counter,
};
