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
    origin: process.env.CLIENT_URL || "http://localhost:3000",  // Точний домен для вашого клієнта
    credentials: true,  // Дозволяє працювати з куками
    allowedHeaders: ["Content-Type", "Authorization"],  // Дозволяє використовувати певні заголовки
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],  // Дозволяє певні HTTP методи
    preflightContinue: false,
    optionsSuccessStatus: 204  // Браузери можуть не підтримувати стандартний код 200 для preflight запитів
  };

  app.use(cors(corsOptions)); // Використовуємо CORS middleware

  app.use(pino());  // Логування запитів

  app.use(express.json());  // Парсинг JSON тіла запитів
  app.use(cookieParser());  // Парсинг cookies

  // Маршрути
  app.use("/auth", authRouter);
  app.use("/contacts", authenticate, contactsRouter);

  // Головна сторінка
  app.get("/", (req, res) => {
    res.send({ message: "Contacts API is running" });
  });

  // Обробка 404
  app.use(notFoundHandler);

  // Обробка помилок
  app.use(errorHandler);

  // Слухаємо на порту
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}