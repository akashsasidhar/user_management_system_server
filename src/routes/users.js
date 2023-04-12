import express from "express";
import multer from "multer";
import path from "path";
import { pool } from "../dbConnection/db_init.js";
import { getJWT } from "../utils/get-jwt.js";
import fs from "fs";
import { fileURLToPath } from "url";
import { encrypt } from "../utils/helpers.js";
const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    // Retrieve the company data from the request body
    const { name, email, password } = req.body;

    //   const record = req.body;
    const query = `
  INSERT INTO user_details (name,  email, password)
  VALUES (?, ?, ?)`;
    const result = await pool.query(query, [name, email, password]);
    if (result) {
      console.log("Record inserted successfully.");
      res.status(200).send({
        message: "Record Inserted Successfully",
        status: 200,
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      status: 500,
    });
    console.log(`Error at at api/user/create ${error} `);
  }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const query = `
  select * from user_details where email=? and password=?`;
    const [rows] = await pool.query(query, [email, password]);
    console.log(rows[0]);
    let payload = rows[0];
    if (rows.length) {
      const token = getJWT(payload);
      console.log("Record inserted successfully.");
      res.status(200).send({
        message: "Logged in Successfully",
        status: 200,
        data: { token },
      });
    } else {
      res.status(200).send({
        message: "No Record Matched",
        status: 404,
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      status: 500,
    });
    console.log(`Error at at api/user/login ${error} `);
  }
});

const storage = multer.memoryStorage();
const upload = multer({ storage });
router.post("/photoUpload", upload.single("image"), async (req, res) => {
  const { originalname, buffer } = req.file;
  const encryptedPhoto = encrypt(buffer);

  const query = `INSERT INTO user_profile_photo (name, photo,user_id) VALUES (?, ?,?)`;
  await pool.query(query, [originalname, encryptedPhoto, "1"], (err) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    } else {
      res.sendStatus(200);
    }
  });
  res.status(200).send({
    message: "uploaded successfully",
    status: 200,
  });
});
router.get("/photo/:id", (req, res) => {
  const id = req.params.id;
  const query = `SELECT * FROM photos WHERE id = ?`;
  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    } else {
      const { name, photo } = results[0];
      const decryptedPhoto = decrypt(photo);
      fs.writeFile(`uploads/${name}`, decryptedPhoto, (err) => {
        if (err) {
          console.error(err);
          res.sendStatus(500);
        } else {
          res.sendFile(`${__dirname}/uploads/${name}`);
        }
      });
    }
  });
});
export default router;
