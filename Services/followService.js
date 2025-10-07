const Follow = require("../Models/follow");

const followUserId = async (identityUserId) => {
  try {
    // Find users that identityUserId is following
    let following = await Follow.find({ user: identityUserId })
      .select({ followed: 1, _id: 0 })
      .exec();
    
    // Find users that are following identityUserId
    let followers = await Follow.find({ followed: identityUserId })
      .select({ user: 1, _id: 0 })
      .exec();

    let cleanFollowing = [];
    following.forEach((follow) => {
      cleanFollowing.push(follow.followed);
    });

    let cleanFollowers = [];
    followers.forEach((follow) => {
      cleanFollowers.push(follow.user);
    });

    return { following: cleanFollowing, followers: cleanFollowers };
  } catch (error) {
    return { following: [], followers: [] };
  }
};

const followingUser = async (identityUserId, profileUserId) => {
  // Check if identityUser is following profileUser
  let following = await Follow.findOne({
    user: identityUserId,
    followed: profileUserId,
  })
    .select({ followed: 1, _id: 0 })
    .exec();
  
  // Check if profileUser is following identityUser
  let follower = await Follow.findOne({
    user: profileUserId,
    followed: identityUserId,
  })
    .select({ user: 1, _id: 0 })  
    .exec();
  
  return { following: following, follower: follower };
};

module.exports = { followUserId, followingUser };
