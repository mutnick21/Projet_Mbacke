const mongoose = require('mongoose');


// Charger tous les modèles
const User = require('./User');
// const Enseignant = require('./Enseignant');
// const Etudiant = require('./Etudiant');
const Matiere = require('./Matiere');
const Groupe = require('./Groupe');
const Examen = require('./Examen');
const Question = require('./Question');
const Reponse = require('./Reponse');
const Copie = require('./Copie');
const ResultatExamen = require('./ResultatExamen');
const ProgressionEtudiant = require('./ProgressionEtudiant');

// Créer les modèles discriminés
// const EnseignantModel = User.discriminator('Enseignant', Enseignant.schema);
// const EtudiantModel = User.discriminator('Etudiant', Etudiant.schema);

// // Exportation des modèles
// module.exports = {
//   User,
//   Enseignant: EnseignantModel,
//   Etudiant: EtudiantModel,
//   Matiere,
//   Groupe,
//   Examen,
//   Question,
//   Reponse,
//   Copie,
//   ResultatExamen,
//   ProgressionEtudiant
// };