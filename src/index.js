import bodyParser from "body-parser";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import healthCheck from "./utils/health_check.js";
import user from "./routes/users.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const port = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(helmet());
app.set("trust-proxy", 1);
// process.setMaxListeners(0);
// parse application/x-www-form-urlencoded
app.use(express.static("public"));
// parse application/json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.disable("etag"); //Disables caching
morgan.token("remote-addr", (req) => {
  return req.header("X-Real-IP") || req.ip;
});
app.use("/api/health-check", healthCheck);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(path.join(__dirname, "..", "uploads")));
app.use("/api/user", user);
app.listen(port, () => {
  console.log(`Server is running on this port ${port}`);
});
