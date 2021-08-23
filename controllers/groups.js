const express = require('express');
const router = express.Router();
const { isEmpty, get } = require('lodash');
const { isValidObjectId } = require("mongoose");

const { HTTP_CODES, ERROR_MESSAGES } = require("../common/http-codes-and-messages");

const { hashPassword, comparePassword } = require("../utilities/services/user-service");

const { verifyAuthToken } = require("../utilities/middlewares/users");

const GROUP = require("../schemas/group");

router.post("/group/create", verifyAuthToken, async (req, res) => {
  const user = req.user;
  const body = req.body;

  let validatedBody;
  //ADD VALIDATION OF INPUTS
  //ASSUME AT THIS MOMENT THAT THE INPUTS ARE CORRECT
  validatedBody = body;

  try {
    const existingGroup = GROUP.findOne({ name: validatedBody.name });
    
    if (!isEmpty(existingGroup)) {
      return res.status(HTTP_CODES.UNPROCESSABLE_ENTITY).json({
        message: ERROR_MESSAGES.GROUP.GROUP_NAME_ALREADY_TAKEN
      });
    }

    let hashedPassword = validatedBody.password;
    
    if (!isEmpty(hashedPassword)) {
      hashedPassword = await hashPassword(validatedBody.password);
    }

    const newGroup = await new GROUP({
      adminId: user._id,
      name: validatedBody.name,
      password: hashedPassword,
      currentUsers: [user._id],
      messages: [],
      displayPicture: "",
    }).save();

    user.groupsJoined.push(newGroup._id);
    await user.save();
    
    res.json(newGroup);
  } catch (error) {
    res.status(HTTP_CODES.SERVER_ERROR).json({
      message: ERROR_MESSAGES.SERVER.DEFAULT_SERVER_ERROR
    });
  }
});

router.get("/group/:groupId", verifyAuthToken, async (req, res) => {
  const groupId = req.params.groupId;
  
  if (!isValidObjectId(groupId)) {
    return res.status(HTTP_CODES.UNPROCESSABLE_ENTITY).json({
      message: ERROR_MESSAGES.GROUP.INVALID_GROUP_ID
    })
  }
  
  try {
    const group = await GROUP.findOne({ _id: groupId });

    if (isEmpty(group)) {
      return res.status(HTTP_CODES.NOT_FOUND).json({
        message: ERROR_MESSAGES.GROUP.NO_GROUP_FOUND
      });
    }
    return res.json(group);
  } catch (err) {
    return res.status(HTTP_CODES.SERVER_ERROR).json({
      message: ERROR_MESSAGES.SERVER.DEFAULT_SERVER_ERROR
    });
  };
});

router.get("/groups", verifyAuthToken, async (req, res) => {
  try {
    const groups = await GROUP.find();

    return res.json(groups);
  } catch (err) {
    return res.status(HTTP_CODES.SERVER_ERROR).json({
      message: ERROR_MESSAGES.SERVER.DEFAULT_SERVER_ERROR
    });
  };
});

router.get("/groups/me", verifyAuthToken, async (req, res) => {
  const user = req.user;

  try {
    if (isEmpty(user.groupsJoined)) {
      return res.json([]);
    }

    const findOptions = {
      $or: []
    };

    await user.groupsJoined.forEach(groupId => {
      findOptions.$or.push({ _id: groupId });
    });

    const groups = await GROUP.find(findOptions);

    return res.json(groups);
  } catch (err) {
    return res.status(HTTP_CODES.SERVER_ERROR).json({
      message: ERROR_MESSAGES.SERVER.DEFAULT_SERVER_ERROR
    });
  };
});

router.post("/group/:groupId/join", verifyAuthToken, async (req, res) => {
  const body = req.body;
  const user = req.user;
  const groupId = req.params.groupId;

  let validatedBody;
  //ADD VALIDATION OF INPUTS
  //ASSUME AT THIS MOMENT THAT THE INPUTS ARE CORRECT
  validatedBody = body;

  if (!isValidObjectId(groupId)) {
    return res.status(HTTP_CODES.UNPROCESSABLE_ENTITY).json({
      message: ERROR_MESSAGES.GROUP.INVALID_GROUP_ID
    })
  }

  try {
    const group = await GROUP.findOne({ _id: groupId });

    if (isEmpty(group)) {
      return res.status(HTTP_CODES.NOT_FOUND).json({
        message: ERROR_MESSAGES.GROUP.NO_GROUP_FOUND
      });
    }

    if (!isEmpty(group.password)) {
      let isCorrectPassword = await comparePassword(validatedBody.password, group.password);

      if (!isCorrectPassword) {
        return res.status(HTTP_CODES.UNAUTHORIZED).json({
          message: ERROR_MESSAGES.USER.INCORRECT_PASSWORD
        });
      }
    }

    if (!group.currentUsers.includes(user._id)) {
      user.groupsJoined.push(group._id);
      await user.save();

      group.currentUsers.push(user._id);
      await group.save();
    }

    return res.json({
      message: `${user.fullName} joined the group.`
    });
    
  } catch (error) {
    return res.status(HTTP_CODES.SERVER_ERROR).json({
      message: ERROR_MESSAGES.SERVER.DEFAULT_SERVER_ERROR
    });
  }
});

router.post("/group/:groupId/leave", verifyAuthToken, async (req, res) => {
  const body = req.body;
  const user = req.user;
  const groupId = req.params.groupId;

  let validatedBody;
  //ADD VALIDATION OF INPUTS
  //ASSUME AT THIS MOMENT THAT THE INPUTS ARE CORRECT
  validatedBody = body;

  if (!isValidObjectId(groupId)) {
    return res.status(HTTP_CODES.UNPROCESSABLE_ENTITY).json({
      message: ERROR_MESSAGES.GROUP.INVALID_GROUP_ID
    })
  }

  try {
    const group = await GROUP.findOne({ _id: groupId });

    if (isEmpty(group)) {
      return res.status(HTTP_CODES.NOT_FOUND).json({
        message: ERROR_MESSAGES.GROUP.NO_GROUP_FOUND
      });
    }

    group.currentUsers = group.currentUsers.filter(userId => userId,toString() != user._id.toString());
    await group.save();

    user.groupsJoined = user.groupsJoined.filter(groupId => groupId.toString() != group._id.toString());
    await user.save();

    return res.json({
      message: `${user.fullName} left the group.`
    });
  } catch (error) {
    return res.status(HTTP_CODES.SERVER_ERROR).json({
      message: ERROR_MESSAGES.SERVER.DEFAULT_SERVER_ERROR
    });
  }
});

module.exports = router;