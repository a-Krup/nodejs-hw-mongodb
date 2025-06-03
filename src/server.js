import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import dotenv from 'dotenv';

dotenv.config();

export function setupServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(pino());

  // Обробка неіснуючих маршрутів
  app.all('*', (req, res) => {
    res.status(404).json({ message: 'Not found' });
  });

  // Запуск сервера
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
