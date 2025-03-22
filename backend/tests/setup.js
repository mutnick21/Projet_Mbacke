const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Connexion à la base de données en mémoire avant tous les tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// Nettoyage de la base de données après chaque test
afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

// Déconnexion et arrêt du serveur en mémoire après tous les tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
}); 