import express from "express";
import cors from "cors";
import pino from "pino-http";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import contactsRouter from "./routes/contacts.js";
import authRouter from "./routes/auth.js";
import authenticate from "./middlewares/authenticate.js";

import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { errorHandler } from "./middlewares/errorHandler.js";

dotenv.config();

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
