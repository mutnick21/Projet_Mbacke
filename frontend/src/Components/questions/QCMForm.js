import React from 'react';

const QCMForm = ({ data, onChange }) => {
  const handleOptionChange = (index, value) => {
    const newOptions = [...data.options];
    newOptions[index] = value;
    onChange({ ...data, options: newOptions });
  };

  const handleCorrectAnswerChange = (value) => {
    onChange({ ...data, reponseCorrecte: value });
  };

  const addOption = () => {
    onChange({ ...data, options: [...data.options, ''] });
  };

  const removeOption = (index) => {
    const newOptions = data.options.filter((_, i) => i !== index);
    onChange({ ...data, options: newOptions });
  };

  return (
    <div className="qcm-form">
      <div className="form-group">
        <label className="required">Options de réponse</label>
        <div className="qcm-options">
          {data.options.map((option, index) => (
            <div key={index} className="qcm-option">
              <input
                type="radio"
                name="correctAnswer"
                checked={data.reponseCorrecte === option}
                onChange={() => handleCorrectAnswerChange(option)}
                required
              />
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                required
              />
              <button
                type="button"
                onClick={() => removeOption(index)}
                className="remove-option"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addOption}
          className="add-option-button"
        >
          Ajouter une option
        </button>
      </div>

      {data.options.length < 2 && (
        <div className="error-message">
          Une question QCM doit avoir au moins 2 options
        </div>
      )}

      {!data.reponseCorrecte && (
        <div className="error-message">
          Veuillez sélectionner la réponse correcte
        </div>
      )}
    </div>
  );
};

export default QCMForm; 