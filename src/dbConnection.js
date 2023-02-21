const Pool = require("pg").Pool;

const pool = new Pool({
  user: "postgres",
  password: "8ZxpCfuEEvwV3TDJirhg",
  host: "containers-us-west-145.railway.app",
  port: 7022,
  database: "railway",
});

module.exports = pool;
