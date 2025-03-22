// utils/email.js
import nodemailer from 'nodemailer';

// Configuration du transporteur SMTP
const transporter = nodemailer.createTransport({
  service: 'Gmail', // Vous pouvez utiliser un autre service comme 'Outlook', 'Yahoo', etc.
  auth: {
    user: process.env.EMAIL_USERNAME, // Votre adresse email
    pass: process.env.EMAIL_PASSWORD, // Votre mot de passe email
  },
});

// Fonction pour envoyer un email
const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM, // Adresse email de l'expéditeur
      to: options.email, // Adresse email du destinataire
      subject: options.subject, // Sujet de l'email
      text: options.message, // Corps de l'email (texte brut)
    };

    await transporter.sendMail(mailOptions);
    console.log('Email envoyé avec succès.');
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw new Error('Erreur lors de l\'envoi de l\'email');
  }
};

export default sendEmail;