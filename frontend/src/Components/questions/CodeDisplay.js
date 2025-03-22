import React, { useState } from 'react';
import Editor from '@monaco-editor/react';

const CodeDisplay = ({ question, response, onChange }) => {
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const handleCodeChange = (value) => {
    onChange({ ...response, reponse: value });
  };

  const handleRunCode = async () => {
    setError('');
    setOutput('');

    try {
      // Ici, nous simulons l'exécution du code
      // Dans une implémentation réelle, cela serait géré par le backend
      const result = await executeCode(response.reponse, question.langage);
      setOutput(result);
    } catch (err) {
      setError(err.message);
    }
  };

  const executeCode = async (code, language) => {
    // Simulation d'exécution du code
    // Dans une implémentation réelle, cela serait géré par le backend
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('Code exécuté avec succès !');
      }, 1000);
    });
  };

  return (
    <div className="code-display">
      <div className="constraints">
        <h4>Contraintes de réponse :</h4>
        <ul>
          <li>Langage de programmation : {question.langage}</li>
          {question.tempsLimite && (
            <li>Temps limite d'exécution : {question.tempsLimite} secondes</li>
          )}
          {question.memoireLimite && (
            <li>Mémoire limite : {question.memoireLimite} MB</li>
          )}
        </ul>
      </div>

      <div className="editor-container">
        <Editor
          height="400px"
          defaultLanguage={question.langage}
          value={response.reponse}
          onChange={handleCodeChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>

      <div className="test-cases">
        <h4>Cas de test :</h4>
        <div className="test-cases-list">
          {question.casTest.map((testCase, index) => (
            <div key={index} className="test-case">
              <div className="test-case-header">
                <span className="test-case-number">Cas de test {index + 1}</span>
                <span className="test-case-status pending">En attente</span>
              </div>
              <div className="test-case-content">
                <div className="test-case-input">
                  <strong>Entrée :</strong>
                  <pre>{testCase.entree}</pre>
                </div>
                <div className="test-case-expected">
                  <strong>Sortie attendue :</strong>
                  <pre>{testCase.sortieAttendue}</pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="code-actions">
        <button
          className="run-button"
          onClick={handleRunCode}
          disabled={!response.reponse.trim()}
        >
          Exécuter le code
        </button>
      </div>

      {(output || error) && (
        <div className="execution-result">
          {output && (
            <div className="output">
              <h4>Sortie :</h4>
              <pre>{output}</pre>
            </div>
          )}
          {error && (
            <div className="error">
              <h4>Erreur :</h4>
              <pre className="error-message">{error}</pre>
            </div>
          )}
        </div>
      )}

      {!response.reponse.trim() && (
        <div className="error-message">
          Veuillez écrire votre code
        </div>
      )}
    </div>
  );
};

export default CodeDisplay; 