import { users, examens, questions, reponses } from './data';

// Fonction utilitaire pour simuler un délai réseau
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fonction utilitaire pour simuler une erreur
const simulateError = (message) => {
  throw new Error(message);
};

// Auth API
export const authAPI = {
  login: async (email, password) => {
    await delay(500);
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      simulateError('Email ou mot de passe incorrect');
    }
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token: 'mock-token' };
  },

  register: async (userData) => {
    await delay(500);
    if (users.some(u => u.email === userData.email)) {
      simulateError('Cet email est déjà utilisé');
    }
    const newUser = {
      id: users.length + 1,
      ...userData
    };
    users.push(newUser);
    const { password, ...userWithoutPassword } = newUser;
    return { user: userWithoutPassword, token: 'mock-token' };
  }
};

// Exam API
export const examAPI = {
  getAllExams: async () => {
    await delay(500);
    return examens;
  },

  getExamById: async (id) => {
    await delay(500);
    const exam = examens.find(e => e.id === parseInt(id));
    if (!exam) {
      simulateError('Examen non trouvé');
    }
    return exam;
  },

  createExam: async (examData) => {
    await delay(500);
    const newExam = {
      id: examens.length + 1,
      ...examData
    };
    examens.push(newExam);
    return newExam;
  },

  updateExam: async (id, examData) => {
    await delay(500);
    const index = examens.findIndex(e => e.id === parseInt(id));
    if (index === -1) {
      simulateError('Examen non trouvé');
    }
    examens[index] = { ...examens[index], ...examData };
    return examens[index];
  },

  deleteExam: async (id) => {
    await delay(500);
    const index = examens.findIndex(e => e.id === parseInt(id));
    if (index === -1) {
      simulateError('Examen non trouvé');
    }
    examens.splice(index, 1);
  }
};

// Question API
export const questionAPI = {
  getQuestionsByExam: async (examId) => {
    await delay(500);
    const exam = examens.find(e => e.id === parseInt(examId));
    if (!exam) {
      simulateError('Examen non trouvé');
    }
    return exam.questions.map(qId => questions.find(q => q.id === qId));
  },

  getQuestionById: async (id) => {
    await delay(500);
    const question = questions.find(q => q.id === parseInt(id));
    if (!question) {
      simulateError('Question non trouvée');
    }
    return question;
  },

  createQuestion: async (questionData) => {
    await delay(500);
    const newQuestion = {
      id: questions.length + 1,
      ...questionData
    };
    questions.push(newQuestion);
    return newQuestion;
  },

  updateQuestion: async (id, questionData) => {
    await delay(500);
    const index = questions.findIndex(q => q.id === parseInt(id));
    if (index === -1) {
      simulateError('Question non trouvée');
    }
    questions[index] = { ...questions[index], ...questionData };
    return questions[index];
  },

  deleteQuestion: async (id) => {
    await delay(500);
    const index = questions.findIndex(q => q.id === parseInt(id));
    if (index === -1) {
      simulateError('Question non trouvée');
    }
    questions.splice(index, 1);
  }
};

// Response API
export const responseAPI = {
  submitResponse: async (responseData) => {
    await delay(500);
    const newResponse = {
      id: reponses.length + 1,
      dateSoumission: new Date().toISOString(),
      corrige: false,
      ...responseData
    };
    reponses.push(newResponse);
    return newResponse;
  },

  getResponsesByExam: async (examId) => {
    await delay(500);
    return reponses.filter(r => r.examenId === parseInt(examId));
  },

  getResponseById: async (id) => {
    await delay(500);
    const response = reponses.find(r => r.id === parseInt(id));
    if (!response) {
      simulateError('Réponse non trouvée');
    }
    return response;
  },

  gradeResponse: async (id, gradeData) => {
    await delay(500);
    const index = reponses.findIndex(r => r.id === parseInt(id));
    if (index === -1) {
      simulateError('Réponse non trouvée');
    }
    reponses[index] = {
      ...reponses[index],
      ...gradeData,
      corrige: true,
      dateCorrection: new Date().toISOString()
    };
    return reponses[index];
  }
};

// Correction AI API
export const correctionAIAPI = {
  correctResponse: async (reponseId, questionId) => {
    await delay(1000); // Délai plus long pour simuler le traitement AI
    const response = reponses.find(r => r.id === parseInt(reponseId));
    if (!response) {
      simulateError('Réponse non trouvée');
    }

    // Simulation de la correction AI
    const question = questions.find(q => q.id === parseInt(questionId));
    if (!question) {
      simulateError('Question non trouvée');
    }

    let correction = '';
    let note = 0;

    switch (question.type) {
      case 'qcm':
        note = response.reponse === question.reponse ? question.points : 0;
        correction = note === question.points 
          ? 'Bonne réponse !'
          : 'Mauvaise réponse. La réponse correcte était : ' + question.reponse;
        break;

      case 'texte':
        // Simulation d'une correction de texte
        note = Math.floor(Math.random() * question.points) + 1;
        correction = 'Correction simulée de la réponse textuelle...';
        break;

      case 'numerique':
        const reponseNum = parseFloat(response.reponse);
        const reponseAttendue = parseFloat(question.reponse);
        const tolerance = parseFloat(question.tolerance);
        if (Math.abs(reponseNum - reponseAttendue) <= tolerance) {
          note = question.points;
          correction = 'Bonne réponse !';
        } else {
          note = 0;
          correction = `Mauvaise réponse. La réponse correcte était : ${question.reponse} ±${tolerance}`;
        }
        break;

      case 'code':
        // Simulation d'une correction de code
        note = Math.floor(Math.random() * question.points) + 1;
        correction = 'Correction simulée du code...';
        break;

      case 'fichier':
        // Simulation d'une correction de fichiers
        note = Math.floor(Math.random() * question.points) + 1;
        correction = 'Correction simulée des fichiers...';
        break;
    }

    // Mise à jour de la réponse
    response.note = note;
    response.corrige = true;
    response.correction = correction;
    response.dateCorrection = new Date().toISOString();

    return {
      note,
      correction
    };
  }
}; 