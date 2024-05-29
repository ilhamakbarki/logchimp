// service
const { createToken } = require("../../services/token.service");
const { loginByJwt } = require("../../services/auth/loginByJwt")

// utils
const { validatePassword } = require("../../utils/password");
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

exports.login = async (req, res) => {
  const user = req.user;
  const password = req.body.password;

  if (user.isBlocked) {
    return res.status(403).send({
      message: error.middleware.user.userBlocked,
      code: "USER_BLOCKED",
    });
  }

  if (!password) {
    return res.status(400).send({
      message: error.api.authentication.noPasswordProvided,
      code: "PASSWORD_MISSING",
    });
  }

  try {
    const validateUserPassword = await validatePassword(
      password,
      user.password,
    );
    if (!validateUserPassword) {
      return res.status(403).send({
        message: error.middleware.user.incorrectPassword,
        code: "INCORRECT_PASSWORD",
      });
    }

    const response = generateAuthToken(user);
    res.status(200).send(response);
  } catch (err) {
    logger.log({
      level: "error",
      message: err,
    })

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    })
  }
};

exports.loginByJwt = async (req, res) => {
  try {
    const auth = req.body.token;
    if (!auth) {
      logger.log({
        level: "warn",
        message: error.api.authentication.noToken,
      })
      return res.status(400).send({
        message: error.api.authentication.noToken,
        code: "MISSING_TOKEN",
      });
    }
    const result = await loginByJwt(auth);
    if (result.status === true) {
      res.status(200).send(result.response);
    } else {
      res.status(result.errorCode).send({
        message: result.message,
        code: result.code,
      });
    }
  } catch (err) {
    logger.log({
      level: "error",
      message: error.general.serverError,
      error: JSON.stringify(err),
    })

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    })
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
