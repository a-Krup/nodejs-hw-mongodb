import express from "express";
import cors from "cors";
import pino from "pino-http";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import contactsRouter from "./routes/contacts.js";
import authRouter from "./routes/auth.js";

import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import authenticate from "./middlewares/authenticate.js";

dotenv.config();

export function setupServer() {
  const app = express();

  const corsOptions = {
    origin: "http://localhost:3000",
    credentials: true,
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
