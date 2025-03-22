const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const axios = require('axios');
const Reponse = require('../models/Reponse');
const Question = require('../models/Question');
const Examen = require('../models/Examen');

// Configuration d'Ollama
const OLLAMA_API_URL = 'http://localhost:11434/api/generate';
const MODEL_NAME = 'mistral';

exports.corrigerReponse = catchAsync(async (req, res, next) => {
  const { reponseId } = req.params;
  const { questionId } = req.body;

  // Vérifier que l'utilisateur est un enseignant
  if (req.user.role !== 'enseignant') {
    return next(new AppError('Accès non autorisé. Seuls les enseignants peuvent corriger les réponses.', 403));
  }

  // Récupérer la réponse et la question
  const reponse = await Reponse.findById(reponseId).populate('idquestion');
  if (!reponse) {
    return next(new AppError('Réponse non trouvée', 404));
  }

  const question = await Question.findById(questionId);
  if (!question) {
    return next(new AppError('Question non trouvée', 404));
  }

  // Vérifier que l'enseignant est bien celui qui a créé la question
  if (question.idenseignant.toString() !== req.user._id.toString()) {
    return next(new AppError('Vous n\'êtes pas autorisé à corriger cette réponse', 403));
  }

  // Préparer le prompt pour Ollama en fonction du type de question
  let prompt = '';
  let context = '';

  switch (question.type) {
    case 'qcm':
      prompt = `En tant qu'enseignant, corrige cette question à choix multiples.
Question: ${question.enonce}
Réponse attendue: ${question.reponse}
Réponse de l'étudiant: ${reponse.reponse}
Points possibles: ${question.points}
Fournis une correction détaillée et une note sur ${question.points} points.`;
      break;

    case 'texte':
      context = `Points clés à évaluer: ${question.pointsCles}
Format attendu: ${question.reponseType}
Nombre de mots attendu: ${question.nombreMotsMin} - ${question.nombreMotsMax}`;
      prompt = `En tant qu'enseignant, corrige cette réponse textuelle.
Question: ${question.enonce}
${context}
Réponse de l'étudiant: ${reponse.reponse}
Points possibles: ${question.points}
Fournis une correction détaillée en évaluant:
1. La pertinence de la réponse par rapport à la question
2. La structure et la clarté du texte
3. La qualité du contenu
4. Le respect des contraintes (format, nombre de mots)
Attribue une note sur ${question.points} points.`;
      break;

    case 'numerique':
      prompt = `En tant qu'enseignant, corrige cette réponse numérique.
Question: ${question.enonce}
Réponse attendue: ${question.reponse} ${question.unite}
Réponse de l'étudiant: ${reponse.reponse} ${reponse.unite}
Tolérance acceptée: ±${question.tolerance}
Points possibles: ${question.points}
Fournis une correction détaillée en évaluant:
1. La valeur numérique
2. L'unité utilisée
3. Le respect de la tolérance
Attribue une note sur ${question.points} points.`;
      break;

    case 'code':
      context = `Langage: ${question.langage}
Cas de test:
${question.casTest.map((test, index) => `
Test ${index + 1}:
Entrée: ${test.entree}
Sortie attendue: ${test.sortieAttendue}
`).join('\n')}`;
      prompt = `En tant qu'enseignant, corrige ce code.
Question: ${question.enonce}
${context}
Code de l'étudiant: ${reponse.reponse}
Points possibles: ${question.points}
Fournis une correction détaillée en évaluant:
1. La fonctionnalité du code
2. La qualité du code (lisibilité, structure, bonnes pratiques)
3. La gestion des cas de test
4. L'optimisation et la performance
Attribue une note sur ${question.points} points.`;
      break;

    case 'fichier':
      prompt = `En tant qu'enseignant, corrige ce travail rendu sous forme de fichiers.
Question: ${question.enonce}
Instructions: ${question.instructions}
Structure attendue: ${question.structureAttendue}
Fichiers rendus: ${reponse.fichiers.map(f => f.name).join(', ')}
Points possibles: ${question.points}
Fournis une correction détaillée en évaluant:
1. Le respect des instructions
2. La structure et l'organisation des fichiers
3. La qualité du contenu
4. Le respect des contraintes techniques
Attribue une note sur ${question.points} points.`;
      break;

    default:
      return next(new AppError('Type de question non supporté', 400));
  }

  try {
    // Appeler l'API Ollama
    const response = await axios.post(OLLAMA_API_URL, {
      model: MODEL_NAME,
      prompt: prompt,
      stream: false
    });

    // Analyser la réponse d'Ollama
    const correctionText = response.data.response;
    const noteMatch = correctionText.match(/note:?\s*(\d+)\s*\/\s*(\d+)/i);
    const note = noteMatch ? {
      note: parseInt(noteMatch[1]),
      total: parseInt(noteMatch[2])
    } : null;

    // Mettre à jour la réponse avec la correction
    reponse.note = note ? note.note : null;
    reponse.corrige = true;
    reponse.correction = correctionText;
    reponse.dateCorrection = new Date();
    await reponse.save();

    res.status(200).json({
      status: 'success',
      data: {
        note: reponse.note,
        correction: reponse.correction
      }
    });
  } catch (error) {
    console.error('Erreur lors de la correction:', error);
    return next(new AppError('Erreur lors de la correction', 500));
  }
});

exports.corrigerExamen = catchAsync(async (req, res, next) => {
  const { examenId } = req.params;

  // Vérifier que l'utilisateur est un enseignant
  if (req.user.role !== 'enseignant') {
    return next(new AppError('Accès non autorisé. Seuls les enseignants peuvent corriger les examens.', 403));
  }

  // Récupérer l'examen et toutes ses réponses
  const examen = await Examen.findById(examenId).populate('questions');
  if (!examen) {
    return next(new AppError('Examen non trouvé', 404));
  }

  // Vérifier que l'enseignant est bien celui qui a créé l'examen
  if (examen.idenseignant.toString() !== req.user._id.toString()) {
    return next(new AppError('Vous n\'êtes pas autorisé à corriger cet examen', 403));
  }

  const reponses = await Reponse.find({ idexamen: examenId });

  // Corriger chaque réponse
  const corrections = await Promise.all(
    reponses.map(async (reponse) => {
      const question = examen.questions.find(q => q._id.toString() === reponse.idquestion.toString());
      
      let prompt = '';
      let context = '';

      switch (question.type) {
        case 'qcm':
          prompt = `En tant qu'enseignant, corrige cette question à choix multiples.
Question: ${question.enonce}
Réponse attendue: ${question.reponse}
Réponse de l'étudiant: ${reponse.reponse}
Points possibles: ${question.points}
Fournis une correction détaillée et une note sur ${question.points} points.`;
          break;

        case 'texte':
          context = `Points clés à évaluer: ${question.pointsCles}
Format attendu: ${question.reponseType}
Nombre de mots attendu: ${question.nombreMotsMin} - ${question.nombreMotsMax}`;
          prompt = `En tant qu'enseignant, corrige cette réponse textuelle.
Question: ${question.enonce}
${context}
Réponse de l'étudiant: ${reponse.reponse}
Points possibles: ${question.points}
Fournis une correction détaillée en évaluant:
1. La pertinence de la réponse par rapport à la question
2. La structure et la clarté du texte
3. La qualité du contenu
4. Le respect des contraintes (format, nombre de mots)
Attribue une note sur ${question.points} points.`;
          break;

        case 'numerique':
          prompt = `En tant qu'enseignant, corrige cette réponse numérique.
Question: ${question.enonce}
Réponse attendue: ${question.reponse} ${question.unite}
Réponse de l'étudiant: ${reponse.reponse} ${reponse.unite}
Tolérance acceptée: ±${question.tolerance}
Points possibles: ${question.points}
Fournis une correction détaillée en évaluant:
1. La valeur numérique
2. L'unité utilisée
3. Le respect de la tolérance
Attribue une note sur ${question.points} points.`;
          break;

        case 'code':
          context = `Langage: ${question.langage}
Cas de test:
${question.casTest.map((test, index) => `
Test ${index + 1}:
Entrée: ${test.entree}
Sortie attendue: ${test.sortieAttendue}
`).join('\n')}`;
          prompt = `En tant qu'enseignant, corrige ce code.
Question: ${question.enonce}
${context}
Code de l'étudiant: ${reponse.reponse}
Points possibles: ${question.points}
Fournis une correction détaillée en évaluant:
1. La fonctionnalité du code
2. La qualité du code (lisibilité, structure, bonnes pratiques)
3. La gestion des cas de test
4. L'optimisation et la performance
Attribue une note sur ${question.points} points.`;
          break;

        case 'fichier':
          prompt = `En tant qu'enseignant, corrige ce travail rendu sous forme de fichiers.
Question: ${question.enonce}
Instructions: ${question.instructions}
Structure attendue: ${question.structureAttendue}
Fichiers rendus: ${reponse.fichiers.map(f => f.name).join(', ')}
Points possibles: ${question.points}
Fournis une correction détaillée en évaluant:
1. Le respect des instructions
2. La structure et l'organisation des fichiers
3. La qualité du contenu
4. Le respect des contraintes techniques
Attribue une note sur ${question.points} points.`;
          break;

        default:
          return {
            reponseId: reponse._id,
            error: 'Type de question non supporté'
          };
      }

      try {
        const response = await axios.post(OLLAMA_API_URL, {
          model: MODEL_NAME,
          prompt: prompt,
          stream: false
        });

        reponse.correction = response.data.response;
        reponse.note = extractNote(response.data.response);
        reponse.corrige = true;
        await reponse.save();

        return {
          reponseId: reponse._id,
          note: reponse.note,
          correction: reponse.correction
        };
      } catch (error) {
        console.error(`Erreur lors de la correction de la réponse ${reponse._id}:`, error);
        return {
          reponseId: reponse._id,
          error: 'Erreur lors de la correction'
        };
      }
    })
  );

  res.status(200).json({
    status: 'success',
    data: {
      corrections
    }
  });
});

// Fonction utilitaire pour extraire la note de la correction
function extractNote(correction) {
  // Recherche d'un nombre dans le texte de correction
  const noteMatch = correction.match(/note[:\s]+(\d+)/i);
  if (noteMatch) {
    return parseInt(noteMatch[1]);
  }
  return null;
} 