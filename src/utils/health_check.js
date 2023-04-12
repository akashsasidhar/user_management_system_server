import express from "express";
import { pool } from "../dbConnection/db_init.js";

// Creating a router instance using express
const router = express.Router();

/**
 * @route /api/health-check/
 * @description
 *  - sends status 200 and a message 'Success' in response
 *
 */
router.get("/", async (req, res, next) => {
  try {
    const connection = await pool.getConnection();
    await connection.close();
    res.status(200).send({
      message: "Success",
      status: 200,
    });
  } catch (err) {
    console.error(
      `at: "routes/health-check" => ${JSON.stringify(err)}\n${err}`
    );
    next(err);
  }
});

export default router;
