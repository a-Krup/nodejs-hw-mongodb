import path from "path";
import { fileURLToPath } from "url";
import fs from "fs"; 
import express from "express";
import cors from "cors";
import pino from "pino-http";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import swaggerUi from "swagger-ui-express";

import contactsRouter from "./routes/contacts.js";
import authRouter from "./routes/auth.js";
import authenticate from "./middlewares/authenticate.js";

import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { errorHandler } from "./middlewares/errorHandler.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function setupServer() {
  const app = express();

  console.log("Current NODE_ENV:", process.env.NODE_ENV);

  const corsOptions = {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };

  app.use(cors(corsOptions));
  app.use(pino());
  app.use(express.json());
  app.use(cookieParser());

  app.get("/docs", (req, res) => {
    res.sendFile(path.join(__dirname, "docs", "docs.html"));
  });

  app.use("/docs", express.static(path.join(__dirname, "docs")));

  
  const swaggerDocument = JSON.parse(
    fs.readFileSync(path.join(__dirname, "src", "docs", "swagger.json"), "utf8")
  );

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.use("/auth", authRouter);
  app.use("/contacts", authenticate, contactsRouter);

  app.get("/", (req, res) => {
    res.send({ message: "Contacts API is running" });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}