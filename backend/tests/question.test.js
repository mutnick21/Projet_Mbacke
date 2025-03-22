const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Examen = require('../models/Examen');
const Question = require('../models/Question');
const jwt = require('jsonwebtoken');

describe('Tests de gestion des questions', () => {
  let enseignantToken;
  let etudiantToken;
  let enseignantId;
  let examenId;

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

  beforeAll(async () => {
    // Créer un enseignant de test
    const enseignant = await User.create(enseignantTest);
    enseignantId = enseignant._id;
    enseignantToken = jwt.sign({ id: enseignant._id }, process.env.JWT_SECRET);

    // Créer un étudiant de test
    const etudiant = await User.create(etudiantTest);
    const etudiantToken = jwt.sign({ id: etudiant._id }, process.env.JWT_SECRET);

    // Créer un examen de test
    const examen = await Examen.create({
      ...examenTest,
      idenseignant: enseignantId
    });
    examenId = examen._id;
  });

  describe('POST /api/questions', () => {
    it('devrait créer une nouvelle question', async () => {
      const res = await request(app)
        .post('/api/questions')
        .set('Authorization', `Bearer ${enseignantToken}`)
        .send({
          ...questionTest,
          idexamen: examenId
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.question).toHaveProperty('enonce', questionTest.enonce);
      expect(res.body.data.question).toHaveProperty('idexamen', examenId.toString());
    });

    it('devrait refuser la création d\'une question par un étudiant', async () => {
      const res = await request(app)
        .post('/api/questions')
        .set('Authorization', `Bearer ${etudiantToken}`)
        .send({
          ...questionTest,
          idexamen: examenId
        });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/questions/examen/:examenId', () => {
    let questionId;

    beforeEach(async () => {
      const question = await Question.create({
        ...questionTest,
        idexamen: examenId,
        idenseignant: enseignantId
      });
      questionId = question._id;
    });

    it('devrait retourner toutes les questions d\'un examen', async () => {
      const res = await request(app)
        .get(`/api/questions/examen/${examenId}`)
        .set('Authorization', `Bearer ${enseignantToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data.questions)).toBeTruthy();
      expect(res.body.data.questions.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/questions/:id', () => {
    let questionId;

    beforeEach(async () => {
      const question = await Question.create({
        ...questionTest,
        idexamen: examenId,
        idenseignant: enseignantId
      });
      questionId = question._id;
    });

    it('devrait retourner une question spécifique', async () => {
      const res = await request(app)
        .get(`/api/questions/${questionId}`)
        .set('Authorization', `Bearer ${enseignantToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.question._id).toBe(questionId.toString());
    });

    it('devrait retourner une erreur pour une question inexistante', async () => {
      const res = await request(app)
        .get('/api/questions/123456789012')
        .set('Authorization', `Bearer ${enseignantToken}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/questions/:id', () => {
    let questionId;

    beforeEach(async () => {
      const question = await Question.create({
        ...questionTest,
        idexamen: examenId,
        idenseignant: enseignantId
      });
      questionId = question._id;
    });

    it('devrait mettre à jour une question', async () => {
      const updateData = {
        enonce: 'Question mise à jour',
        points: 3
      };

      const res = await request(app)
        .patch(`/api/questions/${questionId}`)
        .set('Authorization', `Bearer ${enseignantToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.question.enonce).toBe(updateData.enonce);
      expect(res.body.data.question.points).toBe(updateData.points);
    });

    it('devrait refuser la mise à jour par un étudiant', async () => {
      const res = await request(app)
        .patch(`/api/questions/${questionId}`)
        .set('Authorization', `Bearer ${etudiantToken}`)
        .send({ enonce: 'Tentative de modification' });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('DELETE /api/questions/:id', () => {
    let questionId;

    beforeEach(async () => {
      const question = await Question.create({
        ...questionTest,
        idexamen: examenId,
        idenseignant: enseignantId
      });
      questionId = question._id;
    });

    it('devrait supprimer une question', async () => {
      const res = await request(app)
        .delete(`/api/questions/${questionId}`)
        .set('Authorization', `Bearer ${enseignantToken}`);

      expect(res.statusCode).toBe(204);

      // Vérifier que la question a été supprimée
      const questionSupprimee = await Question.findById(questionId);
      expect(questionSupprimee).toBeNull();
    });

    it('devrait refuser la suppression par un étudiant', async () => {
      const res = await request(app)
        .delete(`/api/questions/${questionId}`)
        .set('Authorization', `Bearer ${etudiantToken}`);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('PATCH /api/questions/:id/noter', () => {
    let questionId;

    beforeEach(async () => {
      const question = await Question.create({
        ...questionTest,
        idexamen: examenId,
        idenseignant: enseignantId
      });
      questionId = question._id;
    });

    it('devrait noter une question', async () => {
      const noteData = {
        note: 2
      };

      const res = await request(app)
        .patch(`/api/questions/${questionId}/noter`)
        .set('Authorization', `Bearer ${enseignantToken}`)
        .send(noteData);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.reponse.note).toBe(noteData.note);
      expect(res.body.data.reponse.estNote).toBe(true);
    });

    it('devrait refuser la notation par un étudiant', async () => {
      const res = await request(app)
        .patch(`/api/questions/${questionId}/noter`)
        .set('Authorization', `Bearer ${etudiantToken}`)
        .send({ note: 2 });

      expect(res.statusCode).toBe(403);
    });
  });
}); 