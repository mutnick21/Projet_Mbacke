require('dotenv').config();

// Configuration des variables d'environnement pour les tests
process.env.JWT_SECRET = 'test-secret-key';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test-db';
process.env.PORT = '3001';
process.env.NODE_ENV = 'test'; 