import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/exam_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(`MongoDB connecté: ${conn.connection.host}`);
    
    // Logging supplémentaire en développement
    if (process.env.NODE_ENV === 'development') {
      mongoose.set('debug', true);
      console.log(`Base de données: ${conn.connection.name}`);
      console.log(`Port: ${conn.connection.port}`);
    }

  } catch (error) {
    console.error(`Erreur: ${error.message}`);
    // Logging plus détaillé en développement
    if (process.env.NODE_ENV === 'development') {
      console.error('Stack trace complète:', error);
    }
    // Sortie avec code d'erreur en production
    process.exit(1);
  }
};

// Gestion des événements de connexion
mongoose.connection.on('connected', () => {
  console.log('Mongoose connecté à la base de données');
});

mongoose.connection.on('error', (err) => {
  console.error('Erreur de connexion Mongoose:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose déconnecté de la base de données');
});

// Gestion propre de la déconnexion
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('Connexion Mongoose fermée suite à l\'arrêt de l\'application');
    process.exit(0);
  } catch (err) {
    console.error('Erreur lors de la fermeture de la connexion:', err);
    process.exit(1);
  }
});

export default connectDB;