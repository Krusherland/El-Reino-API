const Follow = require("../Models/follow");
const User = require("../Models/user");
const monPaginate = require("mongoose-pagination");
const followService = require("../Services/followService");
const user = require("../Models/user");
const follow = require("../Models/follow");

const pruebaFollow = (req, res) => {
  return res.status(200).send({
    message: "Follow endpoint working",
  });
};

const save = (req, res) => {
  const params = req.body;
  const identity = req.user;
  let userToFollow = new Follow({
    user: identity.id,
    followers: params.followed,
  });

  userToFollow.save((error, followStored) => {
    if (error || !followStored) {
      return res.status(500).send({
        status: "error",
        message: "Error saving follow",
      });
    }
    return res.status(200).send({
      status: "success",
      message: "Save follow",
      identity: req.user,
      follow: followStored,
    });
  });
};

const unfollow = (req, res) => {
  const userId = req.user.id;
  const followedId = req.params.id;

  Follow.findOneAndDelete({
    user: userId,
    followedBy: followedId,
  }).remove((error, followDeleted) => {
    if (error || !followDeleted) {
      return res.status(500).send({
        status: "error",
        message: "Error unfollowing user",
      });
    }
    return res.status(200).send({
      status: "success",
      message: "Unfollowed successfully",
    });
  });
};

const following = (req, res) => {
  let userId = req.user.id;
  if (req.params.id) userId = req.params.id;
  let page = 1;
  if (req.params.page) page = req.params.page;
  const itemsPerPage = 5;

  Follow.find({ user: userId })
    .populate("user followers", "-password -role -__v -email")
    .paginate(page, itemsPerPage, (error, follows) => {
      let followUserId = followService.followUserId(req.user.id);

      return res.status(200).send({
        status: "success",
        message: "Following fetched successfully",
        follows,
        total,
        user_following: followUserId.following,
        user_followers: followUserId.followers,
        pages: Math.ceil(total / itemsPerPage),
      });
    });
};

const followers = (req, res) => {
  let userId = req.user.id;
  if (req.params.id) userId = req.params.id;
  let page = 1;
  if (req.params.page) page = req.params.page;
  const itemsPerPage = 5;

  Follow.find({ followers: userId })
    .populate("user followers", "-password -role -__v -email")
    .paginate(page, itemsPerPage, (error, follows, total) => {
      if (error) {
        return res.status(500).send({
          status: "error",
          message: "Error fetching followers",
        });
      }
      return res.status(200).send({
        status: "success",
        message: "Followers fetched successfully",
        total,
        pages: Math.ceil(total / itemsPerPage),
        follows,
        user_following: followUserId.following,
        user_followers: followUserId.followers,
      });
    });
};

module.exports = {
  pruebaFollow,
  save,
  unfollow,
  following,
  followers,
};
