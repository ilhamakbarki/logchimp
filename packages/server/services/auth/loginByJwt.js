//Service
const { createToken, verifyToken } = require("../token.service");
const { functionCreateUser } = require("../../services/auth/createUser")

// Util
const logger = require("../../utils/logger");
const { hashPassword } = require("../../utils/password");
const { getRandomString } = require("../../utils/general");
const error = require("../../errorResponse.json");
const database = require("../../database");

const loginByJwt = async (auth) => {
  try {
    let decoded;
    try {
      decoded = verifyToken(auth);
      logger.log({
        level: "info",
        message: decoded,
      });
    } catch (err) {
      logger.log({
        level: "warn",
        message: error.api.authentication.unauthorized,
        error: JSON.stringify(err),
      })
      return {
        message: error.api.authentication.unauthorized,
        code: "UNAUTHORIZED",
        errorCode: 401,
      };
    }
    const email = decoded.email.toLocaleLowerCase();
    let user = await database
      .select()
      .from("users")
      .where({
        email,
      })
      .first();

    if (!user) {
      logger.log({
        level: "info",
        message: 'Creating new User',
      });

      const username = email.split("@")[0];
      const hashedPassword = hashPassword(getRandomString());

      user = await functionCreateUser({
        name: decoded.name,
        username,
        email,
        password: hashedPassword,
        avatar: decoded.avatar,
        isVerified: true,
      });
    }

    if (user.isBlocked) {
      logger.log({
        level: "warn",
        message: error.middleware.user.userBlocked,
      })
      return {
        message: error.middleware.user.userBlocked,
        code: "USER_BLOCKED",
        errorCode: 401,
      };
    }
    return {
      status: true,
      response: generateAuthToken(user),
    };
  } catch (err) {
    logger.log({
      level: "error",
      message: error.general.serverError,
      error: JSON.stringify(err),
    })

    return {
      message: error.general.serverError,
      code: "SERVER_ERROR",
      errorCode: 500,
    };
  }
}

function generateAuthToken(user) {
  // generate authToken
  const tokenPayload = {
    userId: user.userId,
    email: user.email,
  };
  const authToken = createToken(tokenPayload, {
    expiresIn: "2d",
  });

  return {
    user: {
      authToken,
      userId: user.userId,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    },
  };
}

module.exports = {
  loginByJwt,
}
