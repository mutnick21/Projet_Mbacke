// Données mockées pour simuler la base de données

export const users = [
  {
    id: 1,
    email: 'enseignant@test.com',
    password: 'password123',
    role: 'enseignant',
    nom: 'Dupont',
    prenom: 'Jean'
  },
  {
    id: 2,
    email: 'etudiant@test.com',
    password: 'password123',
    role: 'etudiant',
    nom: 'Martin',
    prenom: 'Marie'
  }
];

export const examens = [
  {
    id: 1,
    titre: 'Examen de Mathématiques',
    description: 'Test sur les fonctions dérivées',
    dateDebut: '2024-03-20T10:00:00',
    dateFin: '2024-03-20T12:00:00',
    duree: 120,
    enseignantId: 1,
    questions: [1, 2, 3]
  },
  {
    id: 2,
    titre: 'Examen de Physique',
    description: 'Test sur la mécanique',
    dateDebut: '2024-03-21T14:00:00',
    dateFin: '2024-03-21T16:00:00',
    duree: 120,
    enseignantId: 1,
    questions: [4, 5]
  }
];

export const questions = [
  {
    id: 1,
    type: 'qcm',
    enonce: 'Quelle est la dérivée de x² ?',
    points: 2,
    options: ['2x', 'x', '2', 'x²'],
    reponse: '2x'
  },
  {
    id: 2,
    type: 'texte',
    enonce: 'Expliquez le concept de dérivée.',
    points: 5,
    reponseType: 'paragraphe',
    nombreMotsMin: 50,
    nombreMotsMax: 200,
    pointsCles: ['Définition', 'Applications', 'Exemples']
  },
  {
    id: 3,
    type: 'numerique',
    enonce: 'Calculez la dérivée de f(x) = 3x² + 2x en x = 2',
    points: 3,
    reponse: 14,
    unite: '',
    tolerance: 0.1
  },
  {
    id: 4,
    type: 'code',
    enonce: 'Écrivez une fonction qui calcule la somme des n premiers nombres entiers.',
    points: 5,
    langage: 'python',
    casTest: [
      { entree: 5, sortieAttendue: 15 },
      { entree: 3, sortieAttendue: 6 }
    ]
  },
  {
    id: 5,
    type: 'fichier',
    enonce: 'Créez un programme qui simule le mouvement d\'un projectile.',
    points: 10,
    instructions: 'Soumettez un fichier Python contenant votre code.',
    structureAttendue: 'Un fichier principal et un fichier README',
    typesFichiersAcceptes: ['py', 'txt'],
    tailleMaxFichier: 1024 * 1024, // 1MB
    nombreMaxFichiers: 2
  }
];

export const reponses = [
  {
    id: 1,
    questionId: 1,
    examenId: 1,
    etudiantId: 2,
    reponse: '2x',
    note: 2,
    corrige: true,
    correction: 'Bonne réponse ! La dérivée de x² est bien 2x.',
    dateSoumission: '2024-03-20T10:30:00',
    dateCorrection: '2024-03-20T10:35:00'
  },
  {
    id: 2,
    questionId: 2,
    examenId: 1,
    etudiantId: 2,
    reponse: 'La dérivée est le taux de variation instantané d\'une fonction...',
    note: 4,
    corrige: true,
    correction: 'Bonne explication, mais manque quelques points clés...',
    dateSoumission: '2024-03-20T10:45:00',
    dateCorrection: '2024-03-20T10:50:00'
  }
]; 