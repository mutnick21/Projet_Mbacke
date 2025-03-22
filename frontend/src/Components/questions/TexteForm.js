import React from 'react';

const TexteForm = ({ data, onChange }) => {
  const handleReponseTypeChange = (e) => {
    onChange({ ...data, reponseType: e.target.value });
  };

  return (
    <div className="texte-form">
      <div className="form-group">
        <label className="required">Format de réponse attendu</label>
        <select
          value={data.reponseType}
          onChange={handleReponseTypeChange}
          required
        >
          <option value="texte">Texte libre</option>
          <option value="paragraphe">Paragraphe structuré</option>
          <option value="liste">Liste à puces</option>
          <option value="tableau">Tableau</option>
        </select>
      </div>

      <div className="form-group">
        <label>Instructions supplémentaires</label>
        <textarea
          value={data.instructions || ''}
          onChange={(e) => onChange({ ...data, instructions: e.target.value })}
          placeholder="Ex: Répondez en 3 paragraphes distincts..."
        />
      </div>

      <div className="form-group">
        <label>Nombre de mots minimum</label>
        <input
          type="number"
          min="0"
          value={data.nombreMotsMin || ''}
          onChange={(e) => onChange({ ...data, nombreMotsMin: parseInt(e.target.value) })}
        />
      </div>

      <div className="form-group">
        <label>Nombre de mots maximum</label>
        <input
          type="number"
          min="0"
          value={data.nombreMotsMax || ''}
          onChange={(e) => onChange({ ...data, nombreMotsMax: parseInt(e.target.value) })}
        />
      </div>

      <div className="form-group">
        <label>Points clés à aborder</label>
        <textarea
          value={data.pointsCles || ''}
          onChange={(e) => onChange({ ...data, pointsCles: e.target.value })}
          placeholder="Listez les points clés que la réponse doit aborder..."
        />
      </div>
    </div>
  );
};

export default TexteForm; 