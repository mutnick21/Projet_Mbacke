import React, { useState, useRef } from 'react';

const FichierDisplay = ({ question, response, onChange }) => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setError('');

    // Vérification du nombre de fichiers
    if (selectedFiles.length > question.nombreFichiersMax) {
      setError(`Vous ne pouvez pas télécharger plus de ${question.nombreFichiersMax} fichiers`);
      return;
    }

    // Vérification de la taille des fichiers
    const oversizedFiles = selectedFiles.filter(
      file => file.size > question.tailleMaxFichier * 1024 * 1024
    );

    if (oversizedFiles.length > 0) {
      setError(`Certains fichiers dépassent la taille maximale de ${question.tailleMaxFichier} MB`);
      return;
    }

    // Vérification des types de fichiers
    const invalidTypes = selectedFiles.filter(
      file => !question.typesFichiersAcceptes.includes(file.type)
    );

    if (invalidTypes.length > 0) {
      setError(`Certains fichiers ne sont pas du type accepté (${question.typesFichiersAcceptes.join(', ')})`);
      return;
    }

    setFiles(selectedFiles);
    onChange({ ...response, fichiers: selectedFiles });
  };

  const handleRemoveFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onChange({ ...response, fichiers: newFiles });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fichier-display">
      <div className="constraints">
        <h4>Contraintes de soumission :</h4>
        <ul>
          <li>Types de fichiers acceptés : {question.typesFichiersAcceptes.join(', ')}</li>
          <li>Taille maximale par fichier : {question.tailleMaxFichier} MB</li>
          <li>Nombre maximum de fichiers : {question.nombreFichiersMax}</li>
        </ul>
      </div>

      <div className="file-upload-container">
        <div
          className="file-drop-zone"
          onClick={() => fileInputRef.current.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const droppedFiles = Array.from(e.dataTransfer.files);
            if (droppedFiles.length > 0) {
              const event = { target: { files: droppedFiles } };
              handleFileChange(event);
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={question.typesFichiersAcceptes.join(',')}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <div className="upload-icon">📁</div>
          <p>Glissez-déposez vos fichiers ici ou cliquez pour sélectionner</p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="files-list">
          <h4>Fichiers sélectionnés :</h4>
          <ul>
            {files.map((file, index) => (
              <li key={index} className="file-item">
                <span className="file-name">{file.name}</span>
                <span className="file-size">{formatFileSize(file.size)}</span>
                <button
                  className="remove-file"
                  onClick={() => handleRemoveFile(index)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {question.instructions && (
        <div className="instructions">
          <h4>Instructions de soumission :</h4>
          <p>{question.instructions}</p>
        </div>
      )}

      {question.structureAttendue && (
        <div className="structure-attendue">
          <h4>Structure attendue :</h4>
          <pre>{question.structureAttendue}</pre>
        </div>
      )}
    </div>
  );
};

export default FichierDisplay; 