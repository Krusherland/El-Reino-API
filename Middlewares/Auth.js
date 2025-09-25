const jwt = require("jwt-simple");
const moment = require("moment");
const libjwt = require("../Services/jwt");
const secret = libjwt.secret;

exports.auth = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(403).send({
      status: "error",
      message: "Authorization header is missing",
    });
  }

  // Get the token directly from the authorization header
  const token = req.headers.authorization;
  if (!token) {
    return res.status(403).send({
      status: "error",
      message: "Token is missing from authorization header",
    });
  }

  try {
    const payload = jwt.decode(token, secret);

    // Check if token has expired
    if (payload.exp <= moment().unix()) {
      return res.status(401).send({
        status: "error",
        message: "Token has expired",
      });
    }

    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).send({
      status: "error",
      message: "Invalid token",
      debug: error.message,
    });
  }
};
