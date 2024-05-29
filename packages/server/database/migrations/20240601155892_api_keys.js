// utils
const logger = require("../../utils/logger");


exports.up = (knex) => {
  return knex
    .raw(
      `
      CREATE TABLE api_keys (
          key VARCHAR(255) NOT NULL PRIMARY KEY,
          name VARCHAR(50) NOT NULL,
          allowed_ip JSONB NULL,
          status SMALLINT NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
    )
    .then(() => {
      logger.info({
        code: "DATABASE_MIGRATIONS",
        message: "Creating table : api_keys",
      });
    })
    .catch((err) => {
      logger.error(err);
    });
};

exports.down = (knex) => {
  return knex
    .raw("DROP TABLE IF EXISTS api_keys CASCADE;")
    .then(() => {
      logger.info({
        message: "Dropping table: api_keys",
      });
    })
    .catch((err) => {
      logger.error(err);
    });
};
