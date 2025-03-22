const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Examen = require('../models/Examen');
const Question = require('../models/Question');
const Reponse = require('../models/Reponse');
const ResultatExamen = require('../models/ResultatExamen');
const jwt = require('jsonwebtoken');

describe('Tests de gestion des résultats d\'examens', () => {
  let enseignantToken;
  let etudiantToken;
  let enseignantId;
  let etudiantId;
  let examenId;
  let questionId;

  const enseignantTest = {
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@test.com',
    password: 'password123',
    role: 'enseignant'
  };

  const etudiantTest = {
    nom: 'Martin',
    prenom: 'Marie',
    email: 'marie.martin@test.com',
    password: 'password123',
    role: 'etudiant'
  };

  const examenTest = {
    titre: 'Test d\'examen',
    description: 'Description de l\'examen de test',
    duree: 120,
    datelimite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    questions: []
  };

  const questionTest = {
    enonce: 'Question de test',
    type: 'qcm',
    points: 2,
    options: ['Option 1', 'Option 2', 'Option 3'],
    reponseCorrecte: 0
  };

  const reponseTest = {
    reponse: 0,
    commentaire: 'Commentaire de test'
  };

  beforeAll(async () => {
    // Créer un enseignant de test
    const enseignant = await User.create(enseignantTest);
    enseignantId = enseignant._id;
    enseignantToken = jwt.sign({ id: enseignant._id }, process.env.JWT_SECRET);

    // Créer un étudiant de test
    const etudiant = await User.create(etudiantTest);
    etudiantId = etudiant._id;
    etudiantToken = jwt.sign({ id: etudiant._id }, process.env.JWT_SECRET);

    // Créer un examen de test
    const examen = await Examen.create({
      ...examenTest,
      idenseignant: enseignantId
    });
    examenId = examen._id;

    // Créer une question de test
    const question = await Question.create({
      ...questionTest,
      idexamen: examenId,
      idenseignant: enseignantId
    });
    questionId = question._id;
  });

  describe('POST /api/resultats/calculer', () => {
    let reponseId;

    beforeEach(async () => {
      const reponse = await Reponse.create({
        ...reponseTest,
        idquestion: questionId,
        idetudiant: etudiantId
      });
      reponseId = reponse._id;
    });

    it('devrait calculer le résultat d\'un examen pour un étudiant', async () => {
      const res = await request(app)
        .post(`/api/resultats/calculer`)
        .set('Authorization', `Bearer ${etudiantToken}`)
        .send({
          idexamen: examenId
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.resultat).toHaveProperty('idetudiant', etudiantId.toString());
      expect(res.body.data.resultat).toHaveProperty('idexamen', examenId.toString());
      expect(res.body.data.resultat).toHaveProperty('note');
      expect(res.body.data.resultat).toHaveProperty('noteMax');
    });

    it('devrait refuser le calcul de résultat par un enseignant', async () => {
      const res = await request(app)
        .post(`/api/resultats/calculer`)
        .set('Authorization', `Bearer ${enseignantToken}`)
        .send({
          idexamen: examenId
        });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/resultats/examen/:examenId', () => {
    let resultatId;

    beforeEach(async () => {
      const resultat = await ResultatExamen.create({
        idexamen: examenId,
        idetudiant: etudiantId,
        note: 2,
        noteMax: 2
      });
      resultatId = resultat._id;
    });

    it('devrait retourner tous les résultats d\'un examen (enseignant)', async () => {
      const res = await request(app)
        .get(`/api/resultats/examen/${examenId}`)
        .set('Authorization', `Bearer ${enseignantToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data.resultats)).toBeTruthy();
      expect(res.body.data.resultats.length).toBeGreaterThan(0);
    });

    it('devrait refuser l\'accès aux résultats d\'un examen par un étudiant', async () => {
      const res = await request(app)
        .get(`/api/resultats/examen/${examenId}`)
        .set('Authorization', `Bearer ${etudiantToken}`);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/resultats/etudiant', () => {
    let resultatId;

    beforeEach(async () => {
      const resultat = await ResultatExamen.create({
        idexamen: examenId,
        idetudiant: etudiantId,
        note: 2,
        noteMax: 2
      });
      resultatId = resultat._id;
    });

    it('devrait retourner tous les résultats d\'un étudiant', async () => {
      const res = await request(app)
        .get('/api/resultats/etudiant')
        .set('Authorization', `Bearer ${etudiantToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data.resultats)).toBeTruthy();
      expect(res.body.data.resultats.length).toBeGreaterThan(0);
    });

    it('devrait refuser l\'accès aux résultats d\'un étudiant par un enseignant', async () => {
      const res = await request(app)
        .get('/api/resultats/etudiant')
        .set('Authorization', `Bearer ${enseignantToken}`);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/resultats/:id', () => {
    let resultatId;

    beforeEach(async () => {
      const resultat = await ResultatExamen.create({
        idexamen: examenId,
        idetudiant: etudiantId,
        note: 2,
        noteMax: 2
      });
      resultatId = resultat._id;
    });

    it('devrait retourner un résultat spécifique (étudiant)', async () => {
      const res = await request(app)
        .get(`/api/resultats/${resultatId}`)
        .set('Authorization', `Bearer ${etudiantToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.resultat._id).toBe(resultatId.toString());
    });

    it('devrait retourner un résultat spécifique (enseignant)', async () => {
      const res = await request(app)
        .get(`/api/resultats/${resultatId}`)
        .set('Authorization', `Bearer ${enseignantToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.resultat._id).toBe(resultatId.toString());
    });

    it('devrait retourner une erreur pour un résultat inexistant', async () => {
      const res = await request(app)
        .get('/api/resultats/123456789012')
        .set('Authorization', `Bearer ${etudiantToken}`);

      expect(res.statusCode).toBe(404);
    });
  });
}); 