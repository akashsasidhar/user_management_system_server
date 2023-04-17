import express from "express";
import multer from "multer";
import path, { dirname } from "path";
import { pool } from "../dbConnection/db_init.js";
import { getJWT } from "../utils/get-jwt.js";
import * as csv from "fast-csv";
import { decrypt, encrypt } from "../utils/helpers.js";
const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    // Retrieve the company data from the request body
    const { name, email, password } = req.body;

    //   const record = req.body;
    const query = `
  INSERT INTO user_details (username,  email, password)
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
  select id,email as emailId,username,record_status as status,password as code from user_details where email=? and password=?`;
    const [rows] = await pool.query(query, [email, password]);
    console.log(rows[0]);
    let payload = rows[0];
    if (rows.length) {
      const token = getJWT(payload);
      console.log("Logged in Successfully.");
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
  var result;
  const { originalname, buffer, mimetype } = req.file;
  const encryptedPhoto = encrypt(buffer);
  const [rows] = await pool.query(
    `select * from user_profile_photo where user_id=?`,
    [req.body.id]
  );
  if (rows.length > 0) {
    const query = `update user_profile_photo set  photo= ? , photo_name =? ,mimetype=? where user_id=?`;
    result = await pool.query(query, [
      encryptedPhoto,
      originalname,
      mimetype,
      req.body.id,
    ]);
  } else {
    const query = `INSERT INTO user_profile_photo (photo_name, photo, mimetype,user_id) VALUES (?,?,?,?)`;

    await pool.query(
      query,
      [originalname, encryptedPhoto, mimetype, req.body.id],
      (err) => {
        if (err) {
          console.error(err);
          res.sendStatus(500);
        } else {
          res.sendStatus(200);
        }
      }
    );
  }

  console.log("Photo uploaded successfully.");
  res.status(200).send({
    message: "uploaded successfully",
    status: 200,
  });
});
router.get("/photo/:id", async (req, res) => {
  const id = req.params.id;

  const query = `SELECT * FROM user_profile_photo WHERE user_id = ?`;
  const [rows] = await pool.query(query, [id]);
  console.log(rows);
  if (rows.length > 0) {
    const { photo_name, photo, mimetype } = rows[0];
    const decryptedPhoto = decrypt(photo);
    res.send({ data: decryptedPhoto });
    /*  const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    fs.writeFile(`./uploads/${photo_name}`, decryptedPhoto, (err) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
      } else {
        const dirname = path.resolve();
        let indexPath = path.join(__dirname, "..", "..", "uploads", photo_name);
        // let indexPath = path.join(dirname, `/uploads/${photo_name}`);
        // res.type(mimetype).sendFile(indexPath);
        res.status(200).sendFile(indexPath);
      }
    }); */
  }
});
router.post("/update", async (req, res) => {
  const { name, email, id } = req.body;

  const query = `update user_details set  username= ? , email =?  where id=?`;
  const result = await pool.query(query, [name, email, id]);
  if (result) {
    console.log("User updated successfully.");
    res.status(200).send({
      message: "user updated successfully",
      status: 200,
    });
  }
});
router.get("/userDetails/:id", async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const query = `select * from user_details   where id=?`;
  const [rows] = await pool.query(query, [id]);
  console.log(rows[0]);
  if (rows) {
    console.log("User fetched successfully.");
    res.status(200).send({
      message: "user fetched successfully",
      data: rows[0],
      status: 200,
    });
  }
});
router.post("/changePassword", async (req, res) => {
  const { password, id } = req.body;

  const query = `update user_details set  password= ?  where id=?`;
  const result = await pool.query(query, [password, id]);
  if (result) {
    console.log("User updated successfully.");
    res.status(200).send({
      message: "user updated successfully",
      status: 200,
    });
  }
});
router.post("/getLeads", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM user_leads where user_id=?",
      [req.body.id]
    );
    console.log(result);
    res.send({
      message: "user leads fetched successfully",
      status: 200,
      data: result[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
const storage1 = multer.memoryStorage();
const upload1 = multer({ storage: storage1 });
router.post("/updateLeads", upload1.single("excelFile"), async (req, res) => {
  try {
    // console.log(req);
    if (!req.file) {
      console.log("No file uploaded");
      return res.status(400).json({ message: "No file uploaded" });
    }
    const { buffer } = req.file;
    const query =
      "INSERT INTO user_leads (lead_name, lead_email, lead_mobileno,user_id) VALUES ?";
    const values = [];
    const stream = csv
      .parse({ headers: true })
      .on("data", async (row) => {
        const { name, email, phone } = row;
        values.push([name, email, phone, req.body.id]);
      })
      .on("end", async () => {
        await pool.query(query, [values]);
      });
    stream.write(buffer);
    stream.end();
    res.send({ message: "Leads uploaded successfully", status: 200 });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
export default router;
