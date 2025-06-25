import express from "express";
import cors from "cors";
import pino from "pino-http";
import dotenv from "dotenv";

import contactsRouter from "./routes/contacts.js";
import authRouter from "./routes/auth.js"; // ✅ Додано

import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { errorHandler } from "./middlewares/errorHandler.js";

dotenv.config();

export function setupServer() {
  const app = express();

  app.use(cors());
  app.use(pino());
  app.use(express.json());

  // ✅ Додано роут для авторизації
  app.use("/auth", authRouter);

  app.use("/contacts", contactsRouter);

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