import React from 'react';

const NumeriqueForm = ({ data, onChange }) => {
  const handleReponseCorrecteChange = (e) => {
    const value = e.target.value;
    onChange({ ...data, reponseCorrecte: value });
  };

  const handleToleranceChange = (e) => {
    const value = parseFloat(e.target.value);
    onChange({ ...data, tolerance: value });
  };

  const handleUniteChange = (e) => {
    onChange({ ...data, unite: e.target.value });
  };

  return (
    <div className="numerique-form">
      <div className="form-group">
        <label className="required">Réponse correcte</label>
        <input
          type="number"
          step="any"
          value={data.reponseCorrecte || ''}
          onChange={handleReponseCorrecteChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Tolerance acceptée (±)</label>
        <input
          type="number"
          step="any"
          min="0"
          value={data.tolerance || 0}
          onChange={handleToleranceChange}
        />
      </div>

      <div className="form-group">
        <label>Unité de mesure</label>
        <input
          type="text"
          value={data.unite || ''}
          onChange={handleUniteChange}
          placeholder="Ex: m, kg, °C..."
        />
      </div>

      <div className="form-group">
        <label>Format de réponse attendu</label>
        <select
          value={data.formatReponse || 'decimal'}
          onChange={(e) => onChange({ ...data, formatReponse: e.target.value })}
        >
          <option value="decimal">Nombre décimal</option>
          <option value="entier">Nombre entier</option>
          <option value="fraction">Fraction</option>
          <option value="pourcentage">Pourcentage</option>
        </select>
      </div>

      <div className="form-group">
        <label>Nombre de décimales attendues</label>
        <input
          type="number"
          min="0"
          value={data.decimales || 2}
          onChange={(e) => onChange({ ...data, decimales: parseInt(e.target.value) })}
        />
      </div>

      <div className="form-group">
        <label>Instructions supplémentaires</label>
        <textarea
          value={data.instructions || ''}
          onChange={(e) => onChange({ ...data, instructions: e.target.value })}
          placeholder="Ex: Arrondissez à 2 décimales..."
        />
      </div>

      {!data.reponseCorrecte && (
        <div className="error-message">
          Veuillez spécifier la réponse correcte
        </div>
      )}
    </div>
  );
};

export default NumeriqueForm; 