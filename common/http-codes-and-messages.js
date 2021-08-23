module.exports = {
  HTTP_CODES: {
    SUCCESS: 200,
    UNPROCESSABLE_ENTITY: 422,
    SERVER_ERROR: 500,
    NOT_FOUND: 404,
    UNAUTHORIZED: 401,
    NOT_ALLOWED: 405,
  },
  ERROR_MESSAGES: {
    USER: {
      EMAIL_ALREADY_TAKEN: "Email already taken.",
      NO_USER_FOUND: "No user found.",
      INCORRECT_PASSWORD: "Password incorrect.",
      ALREADY_JOINED: "User already joined the room.",
      INVALID_USER_ID: "Inserted userId is not a valid ObjectId",
    },
    SERVER: {
      DEFAULT_SERVER_ERROR: "Ooops! Something went wrong on our side. Please contact your administrator.",
    },
    GROUP: {
      GROUP_NAME_ALREADY_TAKEN: "Group name already taken.",
      INVALID_GROUP_ID: "Inserted groupId is not a valid ObjectId",
      NO_GROUP_FOUND: "No group found.",
    }
  }
}