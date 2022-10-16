const Pool = require("pg").Pool;
require("dotenv").config();

const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: "localhost",
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASS,
});

module.exports = pool;
