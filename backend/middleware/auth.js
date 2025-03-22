import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Groupe from '../models/Groupe.js';

// Middleware de protection des routes
export const protect = async (req, res, next) => {
  try {
    let token;

    // Vérifier si le token est présent dans les headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
      console.log('le token :',token);
    }

    // Vérifier si le token existe
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé à accéder à cette route'
      });
    }

    try {
      // Vérifier le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Ajouter l'utilisateur à la requête
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Token invalide ou expiré'
        });
      }

      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Token invalide ou expiré'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'authentification',
      error: error.message
    });
  }
};

// Middleware pour vérifier les rôles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Le rôle ${req.user.role} n'est pas autorisé à accéder à cette route`
      });
    }
    next();
  };
};

// Middleware pour vérifier l'appartenance à un groupe
export const checkGroupMembership = async (req, res, next) => {
  try {
    const groupe = await Groupe.findById(req.params.groupeId);

    if (!groupe) {
      return res.status(404).json({
        success: false,
        message: 'Groupe non trouvé'
      });
    }

    // Vérifier si l'utilisateur est l'enseignant du groupe ou un étudiant du groupe
    const isMember = 
      (req.user.role === 'enseignant' && groupe.idenseignant.equals(req.user._id)) ||
      (req.user.role === 'etudiant' && groupe.etudiants.includes(req.user._id));

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé - Vous n\'êtes pas membre de ce groupe'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification de l\'appartenance au groupe',
      error: error.message
    });
  }
};