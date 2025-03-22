import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
       try {
        setLoading(true);
        const [examsResponse, submissionsResponse] = await Promise.all([
           axios.get('/api/examens/disponibles'),
           axios.get('/api/soumissions/etudiant')
         ]);

         setExams(examsResponse.data);
         setSubmissions(submissionsResponse.data);
       } catch (err) {
         setError('Erreur lors du chargement des données');
         console.error('Erreur:', err);
       } finally {
         setLoading(false);
       }
    };

    fetchData();
  }, []);

  const handleDownloadExam = async (examId, fileName) => {
    try {
      const response = await axios.get(`/api/examens/${examId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Erreur lors du téléchargement:', err);
    }
  };

  const handleSubmitExam = (examId) => {
    navigate(`/student/submit-exam/${examId}`);
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      'en_cours': { color: 'primary', label: 'En cours' },
      'soumis': { color: 'info', label: 'Soumis' },
      'note': { color: 'success', label: 'Noté' }
    };
    
    const config = statusConfig[status] || { color: 'default', label: status };
    return <Chip label={config.label} color={config.color} />;
  };

  const examColumns = [
    { field: 'titre', headerName: 'Titre', flex: 1 },
    { field: 'matiere', headerName: 'Matière', flex: 1, valueGetter: (params) => params.row.matiere?.nom },
    { field: 'date_limite', headerName: 'Date limite', flex: 1, 
      valueGetter: (params) => new Date(params.row.date_limite).toLocaleDateString() },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Button
            startIcon={<DownloadIcon />}
            onClick={() => handleDownloadExam(params.row.id, params.row.fichier)}
            size="small"
          >
            Télécharger
          </Button>
          <Button
            startIcon={<UploadFileIcon />}
            onClick={() => handleSubmitExam(params.row.id)}
            size="small"
            color="primary"
            sx={{ ml: 1 }}
          >
            Soumettre
          </Button>
        </Box>
      ),
    },
  ];

  const submissionColumns = [
    { field: 'examen', headerName: 'Examen', flex: 1, valueGetter: (params) => params.row.examen?.titre },
    { field: 'date_soumission', headerName: 'Date de soumission', flex: 1,
      valueGetter: (params) => new Date(params.row.date_soumission).toLocaleDateString() },
    { field: 'note', headerName: 'Note', width: 100,
      valueGetter: (params) => params.row.note ? `${params.row.note}/20` : '-' },
    { field: 'status', headerName: 'Statut', width: 130,
      renderCell: (params) => getStatusChip(params.row.status) },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" className="dashboard-container">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper className="welcome-paper">
            <Typography variant="h4" component="h1" gutterBottom>
              Bienvenue, {user?.prenom} !
            </Typography>
          </Paper>
        </Grid>

        {error && (
          <Grid item xs={12}>
            <Alert severity="error">{error}</Alert>
          </Grid>
        )}

        <Grid item xs={12}>
          <Paper className="section-paper">
            <Typography variant="h5" gutterBottom>
              Examens disponibles
            </Typography>
            <DataGrid
              rows={exams}
              columns={examColumns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              autoHeight
              disableSelectionOnClick
              className="data-grid"
            />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper className="section-paper">
            <Typography variant="h5" gutterBottom>
              Mes soumissions
            </Typography>
            <DataGrid
              rows={submissions}
              columns={submissionColumns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              autoHeight
              disableSelectionOnClick
              className="data-grid"
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default StudentDashboard;