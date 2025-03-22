const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'gradegenius';

async function initDatabase() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connecté à MongoDB');
    const db = client.db(dbName);

    // Création des collections
    await db.createCollection('users');
    await db.createCollection('groupes');
    await db.createCollection('examens');
    await db.createCollection('questions');
    await db.createCollection('reponses');
    await db.createCollection('copies');
    await db.createCollection('resultatexamens');
    await db.createCollection('soumissions');
    await db.createCollection('matieres');
    await db.createCollection('notifications');
    await db.createCollection('progressionetudiants');

    // Insertion des données de test
    const enseignant = await db.collection('users').insertOne({
      nom: "Dupont",
      prenom: "Jean",
      email: "jean.dupont@esp.sn",
      password: "$2a$10$...", // Hash bcrypt
      role: "enseignant",
      groupes: []
    });

    const etudiant = await db.collection('users').insertOne({
      nom: "Diop",
      prenom: "Marie",
      email: "marie.diop@esp.sn",
      password: "$2a$10$...", // Hash bcrypt
      role: "etudiant",
      groupes: []
    });

    const matiere = await db.collection('matieres').insertOne({
      nom: "Programmation",
      description: "Introduction à la programmation",
      idenseignant: enseignant.insertedId
    });

    const groupe = await db.collection('groupes').insertOne({
      nomgroupe: "L1 Informatique 2024",
      description: "Première année de licence en informatique",
      niveau: "L1",
      annee: 2024,
      idenseignant: enseignant.insertedId,
      etudiants: [etudiant.insertedId],
      matieres: [matiere.insertedId]
    });

    const examen = await db.collection('examens').insertOne({
      idexman: "EXAM001",
      nomexamen: "Examen de Programmation",
      dateexamen: new Date("2024-03-20T09:00:00Z"),
      datelimite: new Date("2024-03-20T11:00:00Z"),
      idenseignant: enseignant.insertedId,
      questions: [],
      groupes: [groupe.insertedId]
    });

    const question = await db.collection('questions').insertOne({
      nombre: 1,
      commentaire: "Question sur les boucles",
      idetudiant: etudiant.insertedId,
      idexamen: examen.insertedId,
      idenseignant: enseignant.insertedId
    });

    await db.collection('reponses').insertOne({
      idetudiant: etudiant.insertedId,
      idquestion: question.insertedId,
      reponse: "Ma réponse à la question",
      note: 0,
      estNote: false
    });

    await db.collection('copies').insertOne({
      idetudiant: etudiant.insertedId,
      idexamen: examen.insertedId,
      note: 0,
      estNote: false,
      datedepot: new Date()
    });

    await db.collection('resultatexamens').insertOne({
      idetudiant: etudiant.insertedId,
      idexamen: examen.insertedId,
      noteFinale: 0,
      estReussi: false,
      dateFin: new Date()
    });

    await db.collection('soumissions').insertOne({
      idetudiant: etudiant.insertedId,
      idexamen: examen.insertedId,
      dateSoumission: new Date(),
      fichier: "chemin/vers/le/fichier.pdf"
    });

    await db.collection('notifications').insertOne({
      idetudiant: etudiant.insertedId,
      message: "Nouvel examen disponible",
      type: "examen",
      estLu: false,
      dateCreation: new Date()
    });

    await db.collection('progressionetudiants').insertOne({
      idetudiant: etudiant.insertedId,
      niveau: 1,
      points: 0
    });

    console.log('Base de données initialisée avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
  } finally {
    await client.close();
  }
}

initDatabase(); 