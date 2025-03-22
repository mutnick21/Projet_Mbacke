import React from 'react';

const FichierForm = ({ data, onChange }) => {
  const handleTypesFichiersChange = (e) => {
    const types = e.target.value.split(',').map(type => type.trim()).filter(type => type);
    onChange({ ...data, typesFichiersAcceptes: types });
  };

  const handleTailleMaxChange = (e) => {
    const taille = parseInt(e.target.value);
    onChange({ ...data, tailleMaxFichier: taille });
  };

  return (
    <div className="fichier-form">
      <div className="form-group">
        <label className="required">Types de fichiers acceptés</label>
        <input
          type="text"
          value={data.typesFichiersAcceptes?.join(', ') || ''}
          onChange={handleTypesFichiersChange}
          placeholder="Ex: pdf, doc, docx, jpg, png..."
          required
        />
        <small className="help-text">
          Séparez les extensions par des virgules (sans le point)
        </small>
      </div>

      <div className="form-group">
        <label className="required">Taille maximale (MB)</label>
        <input
          type="number"
          min="1"
          value={data.tailleMaxFichier || 5}
          onChange={handleTailleMaxChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Nombre de fichiers maximum</label>
        <input
          type="number"
          min="1"
          value={data.nombreFichiersMax || 1}
          onChange={(e) => onChange({ ...data, nombreFichiersMax: parseInt(e.target.value) })}
        />
      </div>

      <div className="form-group">
        <label>Format de soumission attendu</label>
        <select
          value={data.formatSoumission || 'unique'}
          onChange={(e) => onChange({ ...data, formatSoumission: e.target.value })}
        >
          <option value="unique">Fichier unique</option>
          <option value="archive">Archive ZIP</option>
          <option value="multiple">Fichiers séparés</option>
        </select>
      </div>

      <div className="form-group">
        <label>Instructions pour la soumission</label>
        <textarea
          value={data.instructions || ''}
          onChange={(e) => onChange({ ...data, instructions: e.target.value })}
          placeholder="Ex: Nommez votre fichier selon le format suivant..."
        />
      </div>

      <div className="form-group">
        <label>Structure de fichiers attendue</label>
        <textarea
          value={data.structureFichiers || ''}
          onChange={(e) => onChange({ ...data, structureFichiers: e.target.value })}
          placeholder="Ex: Le fichier doit contenir les sections suivantes..."
        />
      </div>

      {(!data.typesFichiersAcceptes || data.typesFichiersAcceptes.length === 0) && (
        <div className="error-message">
          Veuillez spécifier au moins un type de fichier accepté
        </div>
      )}

      {(!data.tailleMaxFichier || data.tailleMaxFichier < 1) && (
        <div className="error-message">
          La taille maximale doit être supérieure à 0 MB
        </div>
      )}
    </div>
  );
};

export default FichierForm; 