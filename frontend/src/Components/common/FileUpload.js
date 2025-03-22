import React, { useState, useRef } from 'react';
import Button from './Button';
import './FileUpload.css';

const FileUpload = ({ onFileSelect, acceptedTypes = '.pdf' }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setError('');

    if (file) {
      // Vérification du type de fichier
      if (!file.type.includes('pdf')) {
        setError('Seuls les fichiers PDF sont acceptés');
        setSelectedFile(null);
        return;
      }

      // Vérification de la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Le fichier ne doit pas dépasser 10MB');
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
    
    const file = event.dataTransfer.files[0];
    if (file) {
      fileInputRef.current.files = event.dataTransfer.files;
      handleFileSelect({ target: { files: [file] } });
    }
  };

  return (
    <div className="file-upload-container">
      <div
        className="file-upload-area"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        {selectedFile ? (
          <div className="selected-file">
            <span className="file-name">{selectedFile.name}</span>
            <Button 
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
                onFileSelect(null);
              }}
            >
              Supprimer
            </Button>
          </div>
        ) : (
          <div className="upload-message">
            <i className="fas fa-cloud-upload-alt"></i>
            <p>Glissez votre fichier PDF ici ou cliquez pour sélectionner</p>
            <span className="upload-hint">Format accepté: PDF (max 10MB)</span>
          </div>
        )}
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default FileUpload;