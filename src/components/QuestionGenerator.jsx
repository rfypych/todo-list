import { useState, useEffect } from 'react';
import { FaRobot, FaSpinner, FaCog, FaSave, FaTimes, FaCheck, FaQuestion } from 'react-icons/fa';
import aiService from '../services/AIService';
import '../css/QuestionGenerator.css';

const QuestionGenerator = ({ todo }) => {
  const [showGenerator, setShowGenerator] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [questions, setQuestions] = useState([]);
  const [settings, setSettings] = useState({
    difficulty: 'medium',
    questionType: 'multiple_choice',
    numQuestions: 3,
    bloomLevel: 'understanding'
  });

  // Load saved API key on component mount
  useEffect(() => {
    // Use the provided API key or check for saved one
    const defaultApiKey = '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';
    const savedApiKey = localStorage.getItem('ai_api_key') || defaultApiKey;

    if (savedApiKey) {
      setApiKey(savedApiKey);
      aiService.init(savedApiKey);
    }
  }, []);

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: name === 'numQuestions' ? parseInt(value, 10) : value
    }));
  };

  const handleSaveApiKey = () => {
    if (!apiKey) {
      setError('API key is required');
      return;
    }

    localStorage.setItem('ai_api_key', apiKey);
    aiService.init(apiKey);
    setSuccess('API key saved successfully');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleGenerateQuestions = async () => {
    if (!todo) {
      setError('Please select a task first');
      return;
    }

    if (!aiService.isInitialized()) {
      setError('Please set your API key first');
      return;
    }

    setError('');
    setIsGenerating(true);

    try {
      const generatedQuestions = await aiService.generateQuestions(
        todo.title,
        todo.description,
        settings
      );
      setQuestions(generatedQuestions);
      setSuccess('Questions generated successfully');
      setTimeout(() => setSuccess(''), 2000);
    } catch (error) {
      setError(`Error generating questions: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderQuestions = () => {
    if (questions.length === 0) {
      return null;
    }

    return (
      <div className="generated-questions">
        <h3>Generated Questions</h3>
        {questions.map((question, index) => (
          <div key={index} className="question-item">
            <div className="question-number">Question {index + 1}</div>
            {settings.questionType === 'multiple_choice' ? (
              <>
                <div className="question-text">{question.questionText}</div>
                <div className="question-options">
                  {question.options && question.options.map(option => (
                    <div
                      key={option.label}
                      className={`option ${option.label === question.correctAnswer ? 'correct' : ''}`}
                    >
                      <span className="option-label">{option.label}.</span> {option.text}
                      {option.label === question.correctAnswer && (
                        <span className="correct-indicator"><FaCheck /></span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="question-content" dangerouslySetInnerHTML={{ __html: question.content.replace(/\\n/g, '<br>') }} />
            )}
          </div>
        ))}
      </div>
    );
  };

  if (!todo) {
    return null;
  }

  return (
    <div className="question-generator-container">
      <button
        className="question-generator-btn"
        onClick={() => setShowGenerator(!showGenerator)}
        title="Generate Questions"
      >
        <FaQuestion />
      </button>

      {showGenerator && (
        <>
          <div className="modal-overlay" onClick={() => setShowGenerator(false)}></div>
          <div className="question-generator-modal">
            <div className="question-generator-header">
              <h3><FaRobot /> AI Question Generator</h3>
              <button
                className="close-btn"
                onClick={() => setShowGenerator(false)}
              >
                <FaTimes />
              </button>
            </div>

          <div className="question-generator-content">
            <div className="task-info">
              <h4>Generating questions for:</h4>
              <div className="task-title">{todo.title}</div>
              {todo.description && (
                <div className="task-description">{todo.description}</div>
              )}
            </div>

            <div className="api-key-section">
              <label htmlFor="api-key">OpenRouter API Key:</label>
              <div className="api-key-input-group">
                <input
                  type="password"
                  id="api-key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your OpenRouter API key"
                />
                <button
                  className="save-api-key-btn"
                  onClick={handleSaveApiKey}
                >
                  <FaSave />
                </button>
              </div>
              <small>
                Using model: deepseek/deepseek-chat-v3-0324:free
              </small>
            </div>

            <div className="generator-settings">
              <h4><FaCog /> Question Settings</h4>

              <div className="settings-grid">
                <div className="setting-group">
                  <label htmlFor="difficulty">Difficulty:</label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    value={settings.difficulty}
                    onChange={handleSettingsChange}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="setting-group">
                  <label htmlFor="questionType">Question Type:</label>
                  <select
                    id="questionType"
                    name="questionType"
                    value={settings.questionType}
                    onChange={handleSettingsChange}
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="true_false">True/False</option>
                    <option value="fill_in_blank">Fill in the Blank</option>
                    <option value="short_answer">Short Answer</option>
                    <option value="essay">Essay</option>
                  </select>
                </div>

                <div className="setting-group">
                  <label htmlFor="numQuestions">Number of Questions:</label>
                  <select
                    id="numQuestions"
                    name="numQuestions"
                    value={settings.numQuestions}
                    onChange={handleSettingsChange}
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="5">5</option>
                    <option value="10">10</option>
                  </select>
                </div>

                <div className="setting-group">
                  <label htmlFor="bloomLevel">Bloom's Taxonomy Level:</label>
                  <select
                    id="bloomLevel"
                    name="bloomLevel"
                    value={settings.bloomLevel}
                    onChange={handleSettingsChange}
                  >
                    <option value="knowledge">Knowledge (Remembering)</option>
                    <option value="understanding">Understanding (Comprehension)</option>
                    <option value="application">Application</option>
                    <option value="analysis">Analysis</option>
                    <option value="evaluation">Evaluation</option>
                    <option value="creation">Creation (Synthesis)</option>
                  </select>
                </div>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="generator-actions">
              <button
                className="generate-btn"
                onClick={handleGenerateQuestions}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <FaSpinner className="spinner" /> Generating...
                  </>
                ) : (
                  <>
                    <FaRobot /> Generate Questions
                  </>
                )}
              </button>
            </div>

            {renderQuestions()}
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default QuestionGenerator;
