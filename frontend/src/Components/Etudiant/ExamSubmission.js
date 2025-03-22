import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondary,
  Divider,
} from '@mui/material';
import { format } from 'date-fns';
import fr from 'date-fns/locale/fr';

const ExamSubmission = () => {
  const [examens, setExamens] = useState([]);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [selectedExam, setSelectedExam] = useState(null);

  useEffect(() => {
    fetchExamens();
  }, []);

  const fetchExamens = async () => {
    try {
      const response = await axios.get('/api/examens/disponibles');
      setExamens(response.data);
    } catch (error) {
      setMessage({ type: 'error', content: 'Erreur lors du chargement des examens' });
    }
  };

  const handleFileChange = (event, examen) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setSelectedExam(examen);
      setMessage({ type: '', content: '' });
    } else {
      setMessage({ type: 'error', content: 'Veuillez sélectionner un fichier PDF' });
    }
  };

  const handleSubmit = async (examen) => {
    if (!file) {
      setMessage({ type: 'error', content: 'Veuillez sélectionner un fichier' });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('examenId', examen.id);

    try {
      await axios.post('/api/soumissions/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage({ type: 'success', content: 'Examen soumis avec succès' });
      setFile(null);
      setSelectedExam(null);
      // Rafraîchir la liste des examens
      fetchExamens();
    } catch (error) {
      setMessage({ type: 'error', content: 'Erreur lors de la soumission de l\'examen' });
    }
  };

  const isExamExpired = (dateLimit) => {
    return new Date(dateLimit) < new Date();
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Soumission des examens
        </Typography>

        {message.content && (
          <Alert severity={message.type} sx={{ mb: 2 }}>
            {message.content}
          </Alert>
        )}

        <List>
          {examens.map((examen) => (
            <React.Fragment key={examen.id}>
              <ListItem>
                <ListItemText
                  primary={examen.matiere.nom}
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {examen.description}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Date limite: {format(new Date(examen.dateLimit), 'PPP à HH:mm', { locale: fr })}
                      </Typography>
                    </>
                  }
                />
                <Box>
                  {!isExamExpired(examen.dateLimit) ? (
                    <>
                      <input
                        accept="application/pdf"
                        style={{ display: 'none' }}
                        id={`exam-submission-${examen.id}`}
                        type="file"
                        onChange={(e) => handleFileChange(e, examen)}
                      />
                      <label htmlFor={`exam-submission-${examen.id}`}>
                        <Button
                          variant="outlined"
                          component="span"
                          sx={{ mr: 1 }}
                        >
                          Sélectionner PDF
                        </Button>
                      </label>
                      {selectedExam?.id === examen.id && file && (
            <Button
                          variant="contained"
                          onClick={() => handleSubmit(examen)}
            >
                          Soumettre
            </Button>
                      )}
                    </>
                  ) : (
                    <Typography variant="body2" color="error">
                      Délai expiré
                    </Typography>
                  )}
                </Box>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>

        {examens.length === 0 && (
          <Typography variant="body1" sx={{ textAlign: 'center', mt: 2 }}>
            Aucun examen disponible pour le moment
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default ExamSubmission; 