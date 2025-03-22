import React, { useState } from 'react';
import FileUpload from '../common/FileUpload';
import Button from '../common/Button';
import './ExamCreation.css';

const ExamCreation = () => {
  const [examData, setExamData] = useState({
    titre: '',
    description: '',
    duree: '',
    dateDebut: '',
    dateFin: ''
  });
  const [sujetPDF, setSujetPDF] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExamData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Ici, vous ajouterez l'appel à votre API
      console.log('Données de l\'examen:', examData);
      console.log('Fichier PDF:', sujetPDF);
      
      // Simuler un délai d'envoi
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Réinitialiser le formulaire
      setExamData({
        titre: '',
        description: '',
        duree: '',
        dateDebut: '',
        dateFin: ''
      });
      setSujetPDF(null);
      
    } catch (error) {
      console.error('Erreur lors de la création de l\'examen:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="exam-creation">
      <h2>Créer un nouvel examen</h2>
      
      <form onSubmit={handleSubmit} className="exam-form">
        <div className="form-group">
          <label htmlFor="titre">Titre de l'examen</label>
          <input
            type="text"
            id="titre"
            name="titre"
            value={examData.titre}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={examData.description}
            onChange={handleInputChange}
            rows="4"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="duree">Durée (minutes)</label>
            <input
              type="number"
              id="duree"
              name="duree"
              value={examData.duree}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dateDebut">Date de début</label>
            <input
              type="datetime-local"
              id="dateDebut"
              name="dateDebut"
              value={examData.dateDebut}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dateFin">Date de fin</label>
            <input
              type="datetime-local"
              id="dateFin"
              name="dateFin"
              value={examData.dateFin}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Sujet de l'examen (PDF)</label>
          <FileUpload
            onFileSelect={(file) => setSujetPDF(file)}
            acceptedTypes=".pdf"
          />
        </div>

        <Button
          type="submit"
          disabled={!examData.titre || !sujetPDF || isLoading}
          isLoading={isLoading}
        >
          Créer l'examen
        </Button>
      </form>
    </div>
  );
};

export default ExamCreation; 