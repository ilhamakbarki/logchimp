// services
const createUser = require("../../services/auth/createUser");

const database = require("../../database");

// utils
const { validEmail } = require("../../helpers");
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

exports.signup = async (req, res, next) => {
  res.status(201).send({ client: req.client });
};
