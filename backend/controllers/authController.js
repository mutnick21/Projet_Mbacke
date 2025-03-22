import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sendEmail from '../utils/email.js';

// Générer le token JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  }, false);
};


// Créer et envoyer le token
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Supprimer le mot de passe de la sortie
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

// Inscription
export const register = async (req, res, next) => {
  try {
    const newUser = await User.create({
      nom: req.body.nom,
      prenom: req.body.prenom,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role,
    });

    console.log(req.body.nom, req.body.prenom, req.body.email, req.body.password, req.body.role);

    createSendToken(newUser, 201, res);
  } catch (error) {
    next(error);
  }
};

// Connexion
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Veuillez fournir un email et un mot de passe',
      });
    }

    const user = await User.login(email, password);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Email ou mot de passe incorrect',
      });
    }

    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Oublier le mot de passe
export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Aucun utilisateur trouvé avec cet email.',
      });
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;

    const message = `Vous avez oublié votre mot de passe ? Soumettez une requête PATCH avec votre nouveau mot de passe et la confirmation à : ${resetURL}.\nSi vous n'avez pas demandé cette réinitialisation, ignorez cet email.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Votre token de réinitialisation de mot de passe (valable 10 minutes)',
        message,
      });

      res.status(200).json({
        status: 'success',
        message: 'Token envoyé par email !',
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        status: 'error',
        message: 'Une erreur est survenue lors de l\'envoi de l\'email. Veuillez réessayer plus tard.',
      });
    }
  } catch (error) {
    next(error);
  }
};

// Réinitialiser le mot de passe
export const resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Le token est invalide ou a expiré.',
      });
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Mettre à jour le mot de passe
export const updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.comparePassword(req.body.passwordCurrent))) {
      return res.status(401).json({
        status: 'error',
        message: 'Votre mot de passe actuel est incorrect.',
      });
    }

    user.password = req.body.password;
    await user.save();

    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Export par défaut (si nécessaire)
export default {
  register,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
};