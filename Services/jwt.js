const jwt = require("jwt-simple");
const moment = require("moment");

const secret = "clave_secreta_net";

const createToken = (user) => {
  const payload = {
    id: user._id,
    name: user.name,
    email: user.email,
    nickname: user.nickname,
    role: user.role,
    image: user.image,
    iat: moment().unix(),
    exp: moment().add(30, "days").unix(),
  };

  return jwt.encode(payload, secret);
};

module.exports = {
  secret,
  createToken,
};  