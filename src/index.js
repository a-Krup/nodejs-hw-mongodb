import { setupServer } from './server.js';
import { initMongoConnection } from './db/initMongoConnection.js';

async function bootstrap() {
  await initMongoConnection(); // Підʼєднання до MongoDB
  setupServer();               // Запуск HTTP-сервера
}

bootstrap();