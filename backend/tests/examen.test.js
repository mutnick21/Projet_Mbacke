const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Examen = require('../models/Examen');
const jwt = require('jsonwebtoken');

describe('Tests de gestion des examens', () => {
  let enseignantToken;
  let etudiantToken;
  let enseignantId;
  let etudiantId;

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
    datelimite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
    questions: []
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
  });

  describe('POST /api/examens', () => {
    it('devrait créer un nouvel examen', async () => {
      const res = await request(app)
        .post('/api/examens')
        .set('Authorization', `Bearer ${enseignantToken}`)
        .send(examenTest);

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.examen).toHaveProperty('titre', examenTest.titre);
      expect(res.body.data.examen).toHaveProperty('idenseignant', enseignantId.toString());
    });

    it('devrait refuser la création d\'un examen par un étudiant', async () => {
      const res = await request(app)
        .post('/api/examens')
        .set('Authorization', `Bearer ${etudiantToken}`)
        .send(examenTest);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/examens', () => {
    it('devrait retourner tous les examens', async () => {
      const res = await request(app)
        .get('/api/examens')
        .set('Authorization', `Bearer ${enseignantToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data.examens)).toBeTruthy();
    });
  });

  describe('GET /api/examens/:id', () => {
    let examenId;

    beforeEach(async () => {
      const examen = await Examen.create({
        ...examenTest,
        idenseignant: enseignantId
      });
      examenId = examen._id;
    });

    it('devrait retourner un examen spécifique', async () => {
      const res = await request(app)
        .get(`/api/examens/${examenId}`)
        .set('Authorization', `Bearer ${enseignantToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.examen._id).toBe(examenId.toString());
    });

    it('devrait retourner une erreur pour un examen inexistant', async () => {
      const res = await request(app)
        .get('/api/examens/123456789012')
        .set('Authorization', `Bearer ${enseignantToken}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/examens/:id', () => {
    let examenId;

    beforeEach(async () => {
      const examen = await Examen.create({
        ...examenTest,
        idenseignant: enseignantId
      });
      examenId = examen._id;
    });

    it('devrait mettre à jour un examen', async () => {
      const updateData = {
        titre: 'Examen mis à jour',
        description: 'Nouvelle description'
      };

      const res = await request(app)
        .patch(`/api/examens/${examenId}`)
        .set('Authorization', `Bearer ${enseignantToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.examen.titre).toBe(updateData.titre);
      expect(res.body.data.examen.description).toBe(updateData.description);
    });

    it('devrait refuser la mise à jour par un étudiant', async () => {
      const res = await request(app)
        .patch(`/api/examens/${examenId}`)
        .set('Authorization', `Bearer ${etudiantToken}`)
        .send({ titre: 'Tentative de modification' });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('DELETE /api/examens/:id', () => {
    let examenId;

    beforeEach(async () => {
      const examen = await Examen.create({
        ...examenTest,
        idenseignant: enseignantId
      });
      examenId = examen._id;
    });

    it('devrait supprimer un examen', async () => {
      const res = await request(app)
        .delete(`/api/examens/${examenId}`)
        .set('Authorization', `Bearer ${enseignantToken}`);

      expect(res.statusCode).toBe(204);

      // Vérifier que l'examen a été supprimé
      const examenSupprime = await Examen.findById(examenId);
      expect(examenSupprime).toBeNull();
    });

    it('devrait refuser la suppression par un étudiant', async () => {
      const res = await request(app)
        .delete(`/api/examens/${examenId}`)
        .set('Authorization', `Bearer ${etudiantToken}`);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/examens/enseignant/mes-examens', () => {
    it('devrait retourner les examens de l\'enseignant connecté', async () => {
      const res = await request(app)
        .get('/api/examens/enseignant/mes-examens')
        .set('Authorization', `Bearer ${enseignantToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data.examens)).toBeTruthy();
      res.body.data.examens.forEach(examen => {
        expect(examen.idenseignant).toBe(enseignantId.toString());
      });
    });
  });
}); 