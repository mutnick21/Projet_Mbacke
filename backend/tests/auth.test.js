const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

describe('Tests d\'authentification', () => {
  let enseignantToken;
  let etudiantToken;

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

  beforeAll(async () => {
    // Créer un enseignant de test
    const enseignant = await User.create(enseignantTest);
    enseignantToken = jwt.sign({ id: enseignant._id }, process.env.JWT_SECRET);

    // Créer un étudiant de test
    const etudiant = await User.create(etudiantTest);
    etudiantToken = jwt.sign({ id: etudiant._id }, process.env.JWT_SECRET);
  });

  describe('POST /api/auth/register', () => {
    it('devrait créer un nouvel utilisateur', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nom: 'Test',
          prenom: 'User',
          email: 'test.user@test.com',
          password: 'password123',
          role: 'etudiant'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user).toHaveProperty('email', 'test.user@test.com');
      expect(res.body.data.user).toHaveProperty('role', 'etudiant');
    });

    it('devrait retourner une erreur si l\'email existe déjà', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(enseignantTest);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('devrait connecter un utilisateur avec des identifiants valides', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: enseignantTest.email,
          password: enseignantTest.password
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body).toHaveProperty('token');
    });

    it('devrait retourner une erreur avec des identifiants invalides', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: enseignantTest.email,
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('devrait retourner les informations de l\'utilisateur connecté', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${enseignantToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user).toHaveProperty('email', enseignantTest.email);
    });

    it('devrait retourner une erreur sans token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/auth/logout', () => {
    it('devrait déconnecter l\'utilisateur', async () => {
      const res = await request(app)
        .get('/api/auth/logout')
        .set('Authorization', `Bearer ${enseignantToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
    });
  });

  describe('Routes protégées par rôle', () => {
    it('devrait permettre l\'accès à la route enseignant pour un enseignant', async () => {
      const res = await request(app)
        .get('/api/auth/enseignant')
        .set('Authorization', `Bearer ${enseignantToken}`);

      expect(res.statusCode).toBe(200);
    });

    it('devrait refuser l\'accès à la route enseignant pour un étudiant', async () => {
      const res = await request(app)
        .get('/api/auth/enseignant')
        .set('Authorization', `Bearer ${etudiantToken}`);

      expect(res.statusCode).toBe(403);
    });

    it('devrait permettre l\'accès à la route étudiant pour un étudiant', async () => {
      const res = await request(app)
        .get('/api/auth/etudiant')
        .set('Authorization', `Bearer ${etudiantToken}`);

      expect(res.statusCode).toBe(200);
    });

    it('devrait refuser l\'accès à la route étudiant pour un enseignant', async () => {
      const res = await request(app)
        .get('/api/auth/etudiant')
        .set('Authorization', `Bearer ${enseignantToken}`);

      expect(res.statusCode).toBe(403);
    });
  });
}); 