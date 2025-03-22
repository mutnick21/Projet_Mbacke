import React, { useState, useEffect } from 'react';
import './ExamUpload.css';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
} from '@mui/material';

const ExamUpload = () => {
  const [file, setFile] = useState(null);
  const [matiere, setMatiere] = useState('');
  const [description, setDescription] = useState('');
  const [dateLimit, setDateLimit] = useState('');
  const [matieres, setMatieres] = useState([]);
  const [message, setMessage] = useState({ type: '', content: '' });

  useEffect(() => {
    // Charger la liste des matières depuis l'API
    const fetchMatieres = async () => {
      try {
        const response = await axios.get('/api/matieres');
        setMatieres(response.data);
      } catch (error) {
        setMessage({ type: 'error', content: 'Erreur lors du chargement des matières' });
      }
    };
    fetchMatieres();
  }, []);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setMessage({ type: '', content: '' });
    } else {
      setMessage({ type: 'error', content: 'Veuillez sélectionner un fichier PDF' });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!file || !matiere || !dateLimit) {
      setMessage({ type: 'error', content: 'Veuillez remplir tous les champs obligatoires' });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('matiere', matiere);
    formData.append('description', description);
    formData.append('dateLimit', dateLimit);

    try {
      await axios.post('/api/examens/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage({ type: 'success', content: 'Examen déposé avec succès' });
      // Réinitialiser le formulaire
      setFile(null);
      setMatiere('');
      setDescription('');
      setDateLimit('');
    } catch (error) {
      setMessage({ type: 'error', content: 'Erreur lors du dépôt de l\'examen' });
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Dépôt d'un nouvel examen
        </Typography>

        {message.content && (
          <Alert severity={message.type} sx={{ mb: 2 }}>
            {message.content}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Matière</InputLabel>
            <Select
              value={matiere}
              label="Matière"
              onChange={(e) => setMatiere(e.target.value)}
              required
            >
              {matieres.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  {m.nom}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            type="datetime-local"
            label="Date limite de soumission"
            value={dateLimit}
            onChange={(e) => setDateLimit(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
            required
          />

          <Box sx={{ mb: 2 }}>
            <input
              accept="application/pdf"
              style={{ display: 'none' }}
              id="exam-file"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="exam-file">
              <Button variant="contained" component="span">
                Sélectionner le PDF
              </Button>
            </label>
            {file && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Fichier sélectionné: {file.name}
              </Typography>
            )}
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
          >
            Déposer l'examen
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default ExamUpload; 