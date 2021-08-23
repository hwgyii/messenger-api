const { get } = require("lodash");

const { HTTP_CODES, ERROR_MESSAGES } = require("../../common/http-codes-and-messages");

const USER = require("../../schemas/user");

const verifyAuthToken = async (req, res, next) => {
  let authToken = req.headers["authorization"];

  if (!authToken) {
    return res.status(HTTP_CODES.NOT_FOUND).json({
      message: "Missing authorization token."
    })
  }

  let user = await USER.findOne({ authToken: authToken });

  if (!user) {
    return res.status(HTTP_CODES.NOT_FOUND).json({
      message: "No matched user with given authorization."
    })
  }

  req.user = user;
  next();
}

module.exports = {
  verifyAuthToken,
}