const Follow = require("../Models/follow");
const User = require("../Models/user");
const followService = require("../Services/followService");

const pruebaFollow = (req, res) => {
  return res.status(200).send({
    message: "Follow endpoint working",
  });
};

const save = async (req, res) => {
  try {
    const params = req.body;
    const identity = req.user;
    const followedUserId = params.followed || req.params.id;

    // Validate that user is not trying to follow themselves
    if (identity.id === followedUserId) {
      return res.status(400).send({
        status: "error",
        message: "You cannot follow yourself",
      });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      user: identity.id,
      followed: followedUserId,
    });

    if (existingFollow) {
      // Return success if already following instead of error
      return res.status(200).send({
        status: "success",
        message: "Already following this user",
        identity: req.user,
        follow: existingFollow,
        alreadyFollowing: true,
      });
    }

    // Check if followed user exists
    const followedUser = await User.findById(followedUserId);
    if (!followedUser) {
      return res.status(404).send({
        status: "error",
        message: "User to follow not found",
      });
    }

    let userToFollow = new Follow({
      user: identity.id,
      followed: followedUserId,
    });

    const followStored = await userToFollow.save();
    
    if (!followStored) {
      return res.status(500).send({
        status: "error",
        message: "Error saving follow",
      });
    }

    return res.status(200).send({
      status: "success",
      message: "Successfully followed user",
      identity: req.user,
      follow: followStored,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error saving follow",
      error: error.message,
    });
  }
};

const unfollow = async (req, res) => {
  try {
    const userId = req.user.id;
    const followedId = req.params.id;

    const followDeleted = await Follow.findOneAndDelete({
      user: userId,
      followed: followedId,
    });

    if (!followDeleted) {
      return res.status(404).send({
        status: "error",
        message: "Follow relationship not found",
      });
    }

    return res.status(200).send({
      status: "success",
      message: "Unfollowed successfully",
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error unfollowing user",
      error: error.message,
    });
  }
};

const following = async (req, res) => {
  try {
    let userId = req.user.id;
    if (req.params.id) userId = req.params.id;
    let page = parseInt(req.params.page);
    const itemsPerPage = 5;

    console.log(`Following request - userId: ${userId}, page: ${page}`);

    // Get total count
    const total = await Follow.countDocuments({ user: userId });

    // If no page specified, return all follows (for checking follow status)
    if (!page || isNaN(page)) {
      const follows = await Follow.find({ user: userId })
        .populate("user followed", "-password -role -__v -email")
        .sort({ created_at: -1 });

      console.log(`Returning all follows - count: ${follows.length}`);

      return res.status(200).send({
        status: "success",
        message: "Following fetched successfully",
        follows,
        total,
      });
    }

    // If page is specified, return paginated results
    const skip = (page - 1) * itemsPerPage;
    const follows = await Follow.find({ user: userId })
      .populate("user followed", "-password -role -__v -email")
      .limit(itemsPerPage)
      .skip(skip)
      .sort({ created_at: -1 });

    // Get user follow stats for paginated requests
    let followUserId = await followService.followUserId(req.user.id);

    console.log(`Returning paginated follows - page: ${page}, count: ${follows.length}`);

    return res.status(200).send({
      status: "success",
      message: "Following fetched successfully",
      follows,
      total,
      user_following: followUserId.following,
      user_followers: followUserId.followers,
      pages: Math.ceil(total / itemsPerPage),
      page: page,
    });
  } catch (error) {
    console.error("Error in following:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).send({
      status: "error",
      message: "Error fetching following",
      error: error.message,
    });
  }
};

const followers = async (req, res) => {
  try {
    let userId = req.user.id;
    if (req.params.id) userId = req.params.id;
    let page = parseInt(req.params.page);
    const itemsPerPage = 5;

    console.log(`Followers request - userId: ${userId}, page: ${page}`);

    // Get total count
    const total = await Follow.countDocuments({ followed: userId });

    // If no page specified, return all followers
    if (!page || isNaN(page)) {
      const follows = await Follow.find({ followed: userId })
        .populate("user followed", "-password -role -__v -email")
        .sort({ created_at: -1 });

      console.log(`Returning all followers - count: ${follows.length}`);

      return res.status(200).send({
        status: "success",
        message: "Followers fetched successfully",
        follows,
        total,
      });
    }

    // If page is specified, return paginated results
    const skip = (page - 1) * itemsPerPage;
    const follows = await Follow.find({ followed: userId })
      .populate("user followed", "-password -role -__v -email")
      .limit(itemsPerPage)
      .skip(skip)
      .sort({ created_at: -1 });

    // Get user follow stats for paginated requests
    let followUserId = await followService.followUserId(req.user.id);

    console.log(`Returning paginated followers - page: ${page}, count: ${follows.length}`);

    return res.status(200).send({
      status: "success",
      message: "Followers fetched successfully",
      total,
      pages: Math.ceil(total / itemsPerPage),
      page: page,
      follows,
      user_following: followUserId.following,
      user_followers: followUserId.followers,
    });
  } catch (error) {
    console.error("Error in followers:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).send({
      status: "error",
      message: "Error fetching followers",
      error: error.message,
    });
  }
};

module.exports = {
  pruebaFollow,
  save,
  unfollow,
  following,
  followers,
};
