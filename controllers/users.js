const express = require('express');
const router = express.Router();
const uniqid = require('uniqid');
const jwt = require('jsonwebtoken');
const { isEmpty, get } = require('lodash');
const { isValidObjectId } = require("mongoose");

const { HTTP_CODES, ERROR_MESSAGES } = require("../common/http-codes-and-messages");

const { hashPassword, comparePassword } = require("../utilities/services/user-service");

const { verifyAuthToken } = require("../utilities/middlewares/users");

const USER = require("../schemas/user");

router.post("/user/create", async (req, res) => {
  const body = req.body;

  let validatedBody;
  //ADD VALIDATION OF INPUTS
  //ASSUME AT THIS MOMENT THAT THE INPUTS ARE CORRECT
  validatedBody = body;

  try {
    const existingUser = USER.findOne({ email: validatedBody.email });
    
    if (!isEmpty(existingUser)) {
      return res.status(HTTP_CODES.UNPROCESSABLE_ENTITY).json({
        message: ERROR_MESSAGES.USER.EMAIL_ALREADY_TAKEN
      });
    }

    const hashedPassword = await hashPassword(validatedBody.password);
    const authToken = uniqid();

    const newUser = await new USER({
      firstName: validatedBody.firstName,
      lastName: validatedBody.lastName,
      fullName: validatedBody.firstName.concat(` ${validatedBody.lastName}`),
      email: validatedBody.email,
      password: hashedPassword,
      authToken: authToken,
      groupsJoined: [],
      displayPicture: "",
    }).save();

    const userDetails = {
      userId: newUser._id,
      authToken: newUser.authToken
    }

    const sessionToken = jwt.sign(userDetails, TOKEN_SECRET);

    res.json({
      sessionToken: sessionToken
    });
  } catch (error) {
    res.status(HTTP_CODES.SERVER_ERROR).json({
      message: ERROR_MESSAGES.SERVER.DEFAULT_SERVER_ERROR
    });
  }
});

router.post("/user/login", async (req, res) => {
  const body = req.body;

  let validatedBody;
  //ADD VALIDATION OF INPUTS
  //ASSUME AT THIS MOMENT THAT THE INPUTS ARE CORRECT
  validatedBody = body;

  try {
    const existingUser = USER.findOne({ email: validatedBody.email}).select("password authToken");

    if (isEmpty(existingUser)) {
      return res.status(HTTP_CODES.NOT_FOUND).json({
        message: ERROR_MESSAGES.USER.NO_USER_FOUND
      });
    }

    let isPasswordCorrect = await comparePassword(validatedBody.password, existingUser.password);

    if (!isPasswordCorrect) {
      return res.status(HTTP_CODES.UNAUTHORIZED).json({
        message: ERROR_MESSAGES.USER.INCORRECT_PASSWORD
      });
    }

    if (isEmpty(existingUser.authToken)) {
      existingUser.authToken = uniqid();
      await existingUser.save();
    }

    const userDetails = {
      userId: existingUser._id,
      authToken: existingUser.authToken
    }

    const sessionToken = jwt.sign(userDetails, TOKEN_SECRET);

    res.json({
      sessionToken: sessionToken
    });
  } catch (error) {
    res.status(HTTP_CODES.SERVER_ERROR).json({
      message: ERROR_MESSAGES.SERVER.DEFAULT_SERVER_ERROR
    });
  }
});

router.post("/user/logout", verifyAuthToken, async (req, res) => {
  try {
    req.user.authToken = "";
    await req.user.save();
    return res.json({
      message: "User logged out."
    });
  } catch (error) {
    return res.status(HTTP_CODES.SERVER_ERROR).json({
      message: ERROR_MESSAGES.DEFAULT_SERVER_ERROR
    });
  }
});

router.get("/user/me", verifyAuthToken, (req, res) => {
  return res.json({
    user: req.user
  })
});

router.get("/user/:userId", verifyAuthToken, async (req, res) => {
  const userId = req.params.userId;
  
  if (!isValidObjectId(userId)) {
    return res.status(HTTP_CODES.UNPROCESSABLE_ENTITY).json({
      message: ERROR_MESSAGES.USER.INVALID_USER_ID
    })
  }
  
  try {
    const user = await USER.findOne({ _id: userId });

    if (isEmpty(user)) {
      return res.status(HTTP_CODES.NOT_FOUND).json({
        message: ERROR_MESSAGES.USER.NO_USER_FOUND
      });
    }
    return res.json(user);
  } catch (err) {
    return res.status(HTTP_CODES.SERVER_ERROR).json({
      message: ERROR_MESSAGES.SERVER.DEFAULT_SERVER_ERROR
    });
  };
});

module.exports = router;