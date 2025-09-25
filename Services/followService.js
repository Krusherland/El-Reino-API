const Follow = require("../Models/follow");

const followUserId = async (identityUserId) => {
  try {
    let following = await Follow.find({ user: identityUserId })
      .select({ follower: 1, _id: 0 })
      .exec();
    let followers = await Follow.find({ follower: identityUserId })
      .select({ user: 1, _id: 0 })
      .exec();

    let cleanFollowing = [];

    following.forEach((follow) => {
      cleanFollowing.push(follow.follower);
    });

    let cleanFollowers = [];

    followers.forEach((follow) => {
      cleanFollowers.push(follow.user);
    });

    return { following: cleanFollowing, followers: cleanFollowers };
  } catch (error) {
    return {};
  }
};

const followingUser = async (identityUserId, profileUserId) => {
  let following = await Follow.findOne({
    user: identityUserId,
    followers: profileUserId,
  })
    .select({ follower: 1, _id: 0 })
    .exec();
  let follower = await Follow.findOne({
    user: profileUserId,
    followers: identityUserId,
  })
    .select({ user: 1, _id: 0 })  
    .exec();
    return { following: following, follower: follower };
};

module.exports = { followUserId, followingUser };
