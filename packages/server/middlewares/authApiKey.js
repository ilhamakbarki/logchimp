const error = require("../errorResponse.json");
const logger = require("../utils/logger");
const database = require("../database");

const authApiKey = async (req, res, next, apiKey) => {
  try {
    const api = await database
      .select()
      .from("api_keys")
      .where({
        key: apiKey,
        status: 1,
      })
      .first();
    if (!api) {
      throw new Error('API key not exist');
    }
    if (api.allowed_ip) {
      const clientIp = req.ip;;
      if (!api.allowed_ip.includes(clientIp)) {
        throw new Error(`IP Address ${clientIp} not allowed`);
      }
    }
    req.client = api
    next();
  } catch (err) {
    logger.log({
      level: "warn",
      message: err,
    })
    return res.status(401).send({
      message: error.middleware.auth.invalidAuthHeader,
      code: "INVALID_AUTH_HEADER",
    });
  }
};

module.exports = authApiKey;
