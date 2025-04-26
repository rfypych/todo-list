import { useState, useEffect } from 'react';
import { 
  FaQuestion, 
  FaCog, 
  FaTimes, 
  FaCheck, 
  FaSpinner,
  FaChevronDown,
  FaChevronUp,
  FaPlus,
  FaSave,
  FaRedo
} from 'react-icons/fa';
import aiService from '../services/AIService';

const QuestionGenerator = ({ taskContent, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [questions, setQuestions] = useState([]);
  
  // Generation options
  const [options, setOptions] = useState({
    count: 3,
    difficulty: 'medium',
    types: ['multiple-choice'],
    language: 'en'
  });
  
  // Check if AI service is already initialized
  useEffect(() => {
    const savedApiKey = localStorage.getItem('ai_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      const initialized = aiService.init(savedApiKey);
      setIsInitialized(initialized);
    }
  }, []);
  
  const handleSaveApiKey = () => {
    setError('');
    setSuccess('');
    
    if (!apiKey) {
      setError('API key is required');
      return;
    }
    
    const initialized = aiService.init(apiKey);
    if (initialized) {
      localStorage.setItem('ai_api_key', apiKey);
      setIsInitialized(true);
      setSuccess('API key saved successfully');
      setIsConfiguring(false);
    } else {
      setError('Failed to initialize AI service with the provided API key');
    }
  };
  
  const handleGenerateQuestions = async () => {
    setError('');
    setIsGenerating(true);
    
    try {
      const result = await aiService.generateQuestions(taskContent, options);
      
      if (result.success) {
        setQuestions(result.questions);
      } else {
        setError(result.error || 'Failed to generate questions');
      }
    } catch (error) {
      setError('Error generating questions: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleOptionChange = (key, value) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };
  
  const handleTypeToggle = (type) => {
    setOptions(prev => {
      const types = [...prev.types];
      const index = types.indexOf(type);
      
      if (index >= 0) {
        // Remove if already exists and it's not the last type
        if (types.length > 1) {
          types.splice(index, 1);
        }
      } else {
        // Add if doesn't exist
        types.push(type);
      }
      
      return { ...prev, types };
    });
  };
  
  return (
    <div className="question-generator">
      <div className="question-generator-header">
        <h3><FaQuestion /> AI Question Generator</h3>
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>
      </div>
      
      <div className="question-generator-content">
        {!isInitialized ? (
          <div className="ai-setup">
            <p>
              This feature uses AI to generate questions based on your task content.
              Please provide your Hugging Face API key to continue.
            </p>
            
            <div className="setting-group">
              <label htmlFor="api-key">Hugging Face API Key:</label>
              <input
                type="password"
                id="api-key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="hf_..."
              />
              <small>
                Get your API key from{' '}
                <a 
                  href="https://huggingface.co/settings/tokens" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Hugging Face Settings
                </a>
              </small>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <div className="ai-setup-actions">
              <button className="save-btn" onClick={handleSaveApiKey}>
                <FaCheck /> Save API Key
              </button>
            </div>
          </div>
        ) : (
          <div className="question-generator-main">
            <div className="task-content-preview">
              <h4>Task Content:</h4>
              <p>{taskContent || 'No content available for this task.'}</p>
            </div>
            
            <div className="generation-options">
              <h4>
                <button 
                  className="toggle-btn"
                  onClick={() => setIsConfiguring(!isConfiguring)}
                >
                  <FaCog /> Options {isConfiguring ? <FaChevronUp /> : <FaChevronDown />}
                </button>
              </h4>
              
              {isConfiguring && (
                <div className="options-form">
                  <div className="option-row">
                    <label>Number of Questions:</label>
                    <select 
                      value={options.count} 
                      onChange={(e) => handleOptionChange('count', parseInt(e.target.value))}
                    >
                      {[1, 2, 3, 5, 10].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="option-row">
                    <label>Difficulty:</label>
                    <select 
                      value={options.difficulty} 
                      onChange={(e) => handleOptionChange('difficulty', e.target.value)}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  
                  <div className="option-row">
                    <label>Language:</label>
                    <select 
                      value={options.language} 
                      onChange={(e) => handleOptionChange('language', e.target.value)}
                    >
                      <option value="en">English</option>
                      <option value="id">Indonesian</option>
                    </select>
                  </div>
                  
                  <div className="option-row question-types">
                    <label>Question Types:</label>
                    <div className="type-toggles">
                      {[
                        { id: 'multiple-choice', label: 'Multiple Choice' },
                        { id: 'essay', label: 'Essay' },
                        { id: 'true-false', label: 'True/False' },
                        { id: 'fill-in-blanks', label: 'Fill in Blanks' },
                        { id: 'matching', label: 'Matching' }
                      ].map(type => (
                        <button
                          key={type.id}
                          className={`type-toggle ${options.types.includes(type.id) ? 'active' : ''}`}
                          onClick={() => handleTypeToggle(type.id)}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="generation-actions">
              <button 
                className="generate-btn" 
                onClick={handleGenerateQuestions}
                disabled={isGenerating}
              >
                {isGenerating ? <FaSpinner className="spinner" /> : <FaPlus />} 
                {isGenerating ? 'Generating...' : 'Generate Questions'}
              </button>
              
              <button 
                className="config-btn"
                onClick={() => setIsConfiguring(!isConfiguring)}
              >
                <FaCog /> {isConfiguring ? 'Hide Options' : 'Show Options'}
              </button>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            {questions.length > 0 && (
              <div className="generated-questions">
                <h4>Generated Questions:</h4>
                
                <div className="questions-list">
                  {questions.map((question, index) => (
                    <div key={question.id} className="question-item">
                      <div className="question-header">
                        <span className="question-number">{index + 1}</span>
                        <span className={`question-difficulty ${question.difficulty}`}>
                          {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                        </span>
                        <span className="question-type">
                          {question.type.split('-').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </span>
                      </div>
                      
                      <div className="question-content">
                        <p>{question.question}</p>
                        
                        {question.type === 'multiple-choice' && question.options.length > 0 && (
                          <div className="question-options">
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className="option">
                                {option}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="questions-actions">
                  <button className="save-questions-btn">
                    <FaSave /> Save Questions
                  </button>
                  <button 
                    className="regenerate-btn"
                    onClick={handleGenerateQuestions}
                    disabled={isGenerating}
                  >
                    <FaRedo /> Regenerate
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionGenerator;
