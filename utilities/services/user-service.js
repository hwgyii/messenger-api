const bcrypt = require('bcrypt');

const { HASH_ROUNDS } = require("../../common/constants");

const hashPassword = (password) => {
  return bcrypt.hash(password, HASH_ROUNDS);
}

const comparePassword = async (password, inputPassword) => {
  try {
    let result = await bcrypt.compare(password, inputPassword);
    return result;
  } catch (error) {
    console.log("Error in comparePassword:: ", error);
    return false;
  }
}

module.exports = {
  hashPassword,
  comparePassword
};
