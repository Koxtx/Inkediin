import { beforeAll, afterAll, afterEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

process.env.SECRET_KEY = 'test-secret-key-for-jwt-testing-12345';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.NODE_ENV = 'test';

let mongoServer;

beforeAll(async () => {
  try {
    // ✅ Vérifier si déjà connecté
    if (mongoose.connection.readyState === 0) {
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
    }
    
    console.log('✅ MongoDB Memory Server démarré');
  } catch (error) {
    console.error('❌ Erreur setup MongoDB:', error);
    throw error;
  }
});

afterEach(async () => {
  // Nettoyer les collections après chaque test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  // Fermer les connexions
  await mongoose.disconnect();
  await mongoServer.stop();
});