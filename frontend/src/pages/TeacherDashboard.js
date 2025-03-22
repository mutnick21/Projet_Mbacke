import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Teacherdashboard = () => {
  const [exams, setExams] = useState([
    { id : 1, matiere: "Test", description: "Test", dateLimit: "12/03/2025", status: ""}
  ]);
  const [submissions, setSubmissions] = useState([
    { id : 1, etudiant: "Test", status: "Test", note: "12/03/2025", fichierUrl: ""}

  ]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [openSubmissions, setOpenSubmissions] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await axios.get('/api/examens/enseignant', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setExams(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des examens:', error);
    }
  };

  const fetchSubmissions = async (examId) => {
    // try {
    //   const response = await axios.get(`/api/soumissions/examen/${examId}`, {
    //     headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    //   });
    //   setSubmissions(response.data);
    //   setSelectedExam(exams.find(exam => exam.id === examId));
    //   setOpenSubmissions(true);
    // } catch (error) {
    //   console.error('Erreur lors de la récupération des soumissions:', error);
    // }
      setOpenSubmissions(true);

  };

  const handleCreateExam = () => {
    navigate('/enseignant/upload-exam');
  };

  const examColumns = [
    { field: 'id', headerName: 'ID', width: 70 },
    // { field: 'matiere', headerName: 'Matière', width: 130, valueGetter: (params) => params.matiere?.nom },
    { field: 'matiere', headerName: 'Matière', width: 130 },
    { field: 'description', headerName: 'Description', width: 200 },
    { field: 'dateLimit', headerName: 'Date Limite', width: 130, valueFormatter: (params) => new Date(params.value).toLocaleDateString() },
    { field: 'status', headerName: 'Statut', width: 100 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Button
            variant="contained"
            size="small"
            onClick={() => fetchSubmissions(params.row.id)}
            sx={{ mr: 1 }}
          >
            Voir soumissions
          </Button>
        </Box>
      ),
    },
    {
      field: 'examen',
      headerName: 'pdf',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Button
            variant="contained"
            size="small"
            onClick={() => fetchSubmissions(params.row.id)}
            sx={{ mr: 1 }}
          >
            Voir pdf
          </Button>
        </Box>
      ),
    }
  ];

  const submissionColumns = [
    { field: 'id', headerName: 'ID', width: 70 },
    // { field: 'etudiant', headerName: 'Étudiant', width: 200, valueGetter: (params) => `${params.row.etudiant?.prenom} ${params.row.etudiant?.nom}` },
    { field: 'etudiant', headerName: 'Étudiant', width: 200 },
    { field: 'status', headerName: 'Statut', width: 100 },
    { field: 'note', headerName: 'Note', width: 100 },
    {
      field: 'fichierUrl',
      headerName: 'Fichier',
      width: 130,
      renderCell: (params) => (
        <Button
          variant="text"
          size="small"
          onClick={() => window.open(params.value, '_blank')}
        >
          Télécharger
        </Button>
      ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Tableau de bord Enseignant
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateExam}
        >
          Créer un examen
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Mes Examens
              </Typography>
              <Box sx={{ height: 400, width: '100%' }}>
                <DataGrid
                  rows={exams}
                  columns={examColumns}
                  pageSize={5}
                  rowsPerPageOptions={[5]}
                  disableSelectionOnClick
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog
        open={openSubmissions}
        onClose={() => setOpenSubmissions(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Soumissions pour {selectedExam?.matiere?.nom} - {selectedExam?.description}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ height: 400, width: '100%', mt: 2 }}>
            <DataGrid
              rows={submissions}
              columns={submissionColumns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              disableSelectionOnClick
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSubmissions(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Teacherdashboard;