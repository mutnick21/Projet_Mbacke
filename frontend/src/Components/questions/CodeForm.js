import React from 'react';

const CodeForm = ({ data, onChange }) => {
  const handleFormatChange = (e) => {
    onChange({ ...data, formatAttendu: e.target.value });
  };

  const handleTestCasesChange = (e) => {
    const testCases = e.target.value.split('\n').filter(line => line.trim());
    onChange({ ...data, testCases });
  };

  return (
    <div className="code-form">
      <div className="form-group">
        <label className="required">Langage de programmation</label>
        <select
          value={data.formatAttendu || ''}
          onChange={handleFormatChange}
          required
        >
          <option value="">Sélectionnez un langage</option>
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="csharp">C#</option>
          <option value="php">PHP</option>
          <option value="ruby">Ruby</option>
          <option value="go">Go</option>
          <option value="rust">Rust</option>
          <option value="swift">Swift</option>
          <option value="kotlin">Kotlin</option>
        </select>
      </div>

      <div className="form-group">
        <label>Structure de code attendue</label>
        <select
          value={data.structure || 'fonction'}
          onChange={(e) => onChange({ ...data, structure: e.target.value })}
        >
          <option value="fonction">Fonction unique</option>
          <option value="classe">Classe</option>
          <option value="script">Script complet</option>
          <option value="module">Module</option>
        </select>
      </div>

      <div className="form-group">
        <label>Cas de test</label>
        <textarea
          value={data.testCases?.join('\n') || ''}
          onChange={handleTestCasesChange}
          placeholder="Entrez les cas de test, un par ligne..."
          className="code-editor"
        />
      </div>

      <div className="form-group">
        <label>Contraintes de performance</label>
        <input
          type="text"
          value={data.contraintes || ''}
          onChange={(e) => onChange({ ...data, contraintes: e.target.value })}
          placeholder="Ex: Complexité O(n), temps d'exécution < 1s..."
        />
      </div>

      <div className="form-group">
        <label>Bibliothèques autorisées</label>
        <input
          type="text"
          value={data.bibliotheques || ''}
          onChange={(e) => onChange({ ...data, bibliotheques: e.target.value })}
          placeholder="Ex: numpy, pandas..."
        />
      </div>

      <div className="form-group">
        <label>Instructions supplémentaires</label>
        <textarea
          value={data.instructions || ''}
          onChange={(e) => onChange({ ...data, instructions: e.target.value })}
          placeholder="Ex: Utilisez des commentaires, suivez les conventions PEP8..."
        />
      </div>

      <div className="form-group">
        <label>Solution de référence</label>
        <textarea
          value={data.solutionReference || ''}
          onChange={(e) => onChange({ ...data, solutionReference: e.target.value })}
          className="code-editor"
          placeholder="Entrez la solution de référence..."
        />
      </div>

      {!data.formatAttendu && (
        <div className="error-message">
          Veuillez sélectionner un langage de programmation
        </div>
      )}
    </div>
  );
};

export default CodeForm; 