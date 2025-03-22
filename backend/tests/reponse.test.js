const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Examen = require('../models/Examen');
const Question = require('../models/Question');
const Reponse = require('../models/Reponse');
const jwt = require('jsonwebtoken');

describe('Tests de gestion des réponses', () => {
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

  describe('POST /api/reponses', () => {
    it('devrait créer une nouvelle réponse', async () => {
      const res = await request(app)
        .post('/api/reponses')
        .set('Authorization', `Bearer ${etudiantToken}`)
        .send({
          ...reponseTest,
          idquestion: questionId
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.reponse).toHaveProperty('reponse', reponseTest.reponse);
      expect(res.body.data.reponse).toHaveProperty('idetudiant', etudiantId.toString());
    });

    it('devrait refuser la création d\'une réponse par un enseignant', async () => {
      const res = await request(app)
        .post('/api/reponses')
        .set('Authorization', `Bearer ${enseignantToken}`)
        .send({
          ...reponseTest,
          idquestion: questionId
        });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/reponses/examen/:examenId', () => {
    let reponseId;

    beforeEach(async () => {
      const reponse = await Reponse.create({
        ...reponseTest,
        idquestion: questionId,
        idetudiant: etudiantId
      });
      reponseId = reponse._id;
    });

    it('devrait retourner toutes les réponses d\'un étudiant pour un examen', async () => {
      const res = await request(app)
        .get(`/api/reponses/examen/${examenId}`)
        .set('Authorization', `Bearer ${etudiantToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data.reponses)).toBeTruthy();
      expect(res.body.data.reponses.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/reponses/question/:questionId', () => {
    let reponseId;

    beforeEach(async () => {
      const reponse = await Reponse.create({
        ...reponseTest,
        idquestion: questionId,
        idetudiant: etudiantId
      });
      reponseId = reponse._id;
    });

    it('devrait retourner toutes les réponses d\'une question (enseignant)', async () => {
      const res = await request(app)
        .get(`/api/reponses/question/${questionId}`)
        .set('Authorization', `Bearer ${enseignantToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data.reponses)).toBeTruthy();
      expect(res.body.data.reponses.length).toBeGreaterThan(0);
    });

    it('devrait refuser l\'accès aux réponses d\'une question par un étudiant', async () => {
      const res = await request(app)
        .get(`/api/reponses/question/${questionId}`)
        .set('Authorization', `Bearer ${etudiantToken}`);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/reponses/:id', () => {
    let reponseId;

    beforeEach(async () => {
      const reponse = await Reponse.create({
        ...reponseTest,
        idquestion: questionId,
        idetudiant: etudiantId
      });
      reponseId = reponse._id;
    });

    it('devrait retourner une réponse spécifique (étudiant)', async () => {
      const res = await request(app)
        .get(`/api/reponses/${reponseId}`)
        .set('Authorization', `Bearer ${etudiantToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.reponse._id).toBe(reponseId.toString());
    });

    it('devrait retourner une réponse spécifique (enseignant)', async () => {
      const res = await request(app)
        .get(`/api/reponses/${reponseId}`)
        .set('Authorization', `Bearer ${enseignantToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.reponse._id).toBe(reponseId.toString());
    });

    it('devrait retourner une erreur pour une réponse inexistante', async () => {
      const res = await request(app)
        .get('/api/reponses/123456789012')
        .set('Authorization', `Bearer ${etudiantToken}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/reponses/:id', () => {
    let reponseId;

    beforeEach(async () => {
      const reponse = await Reponse.create({
        ...reponseTest,
        idquestion: questionId,
        idetudiant: etudiantId
      });
      reponseId = reponse._id;
    });

    it('devrait mettre à jour une réponse', async () => {
      const updateData = {
        reponse: 1,
        commentaire: 'Commentaire mis à jour'
      };

      const res = await request(app)
        .patch(`/api/reponses/${reponseId}`)
        .set('Authorization', `Bearer ${etudiantToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.reponse.reponse).toBe(updateData.reponse);
      expect(res.body.data.reponse.commentaire).toBe(updateData.commentaire);
    });

    it('devrait refuser la mise à jour par un enseignant', async () => {
      const res = await request(app)
        .patch(`/api/reponses/${reponseId}`)
        .set('Authorization', `Bearer ${enseignantToken}`)
        .send({ reponse: 2 });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('DELETE /api/reponses/:id', () => {
    let reponseId;

    beforeEach(async () => {
      const reponse = await Reponse.create({
        ...reponseTest,
        idquestion: questionId,
        idetudiant: etudiantId
      });
      reponseId = reponse._id;
    });

    it('devrait supprimer une réponse', async () => {
      const res = await request(app)
        .delete(`/api/reponses/${reponseId}`)
        .set('Authorization', `Bearer ${etudiantToken}`);

      expect(res.statusCode).toBe(204);

      // Vérifier que la réponse a été supprimée
      const reponseSupprimee = await Reponse.findById(reponseId);
      expect(reponseSupprimee).toBeNull();
    });

    it('devrait refuser la suppression par un enseignant', async () => {
      const res = await request(app)
        .delete(`/api/reponses/${reponseId}`)
        .set('Authorization', `Bearer ${enseignantToken}`);

      expect(res.statusCode).toBe(403);
    });
  });
}); 