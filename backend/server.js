import express from 'express';
import cors from 'cors'; // Utilisation de import pour cors
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import dotenv from "dotenv";
dotenv.config({path: '.env'})

const app = express();

// Connexion à MongoDB
connectDB();

// Configuration de CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// Middleware pour parser le JSON
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Gestion des erreurs 404 (route non trouvée)
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: 'Route non trouvée',
  });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Une erreur est survenue sur le serveur',
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 4500;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});