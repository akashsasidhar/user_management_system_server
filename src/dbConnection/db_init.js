import { createPool } from "mysql2";
import dotenv from "dotenv";
// let nodeGeocoder = require("node-geocoder");
dotenv.config();

// console.log(process.env.MYSQL_HOST);
export const pool = createPool({
  host: process.env.MYSQL_HOST,
  database: process.env.MYSQL_DATABASE,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
}).promise();
