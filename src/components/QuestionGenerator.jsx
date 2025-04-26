import { useState } from 'react';
import { 
  FaRobot, 
  FaSpinner, 
  FaCheck, 
  FaTimes, 
  FaCog, 
  FaChevronDown, 
  FaChevronUp,
  FaQuestion,
  FaLightbulb
} from 'react-icons/fa';
import aiService from '../services/AIService';

const QuestionGenerator = ({ task }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showQuestions, setShowQuestions] = useState(true);
  
  // Settings for question generation
  const [settings, setSettings] = useState({
    difficulty: 'medium',
    questionType: 'multiple_choice',
    numQuestions: 3,
    bloomLevel: 'understanding'
  });
  
  // Handle settings change
  const handleSettingChange = (setting, value) => {
    setSettings({
      ...settings,
      [setting]: value
    });
  };
  
  // Generate questions
  const generateQuestions = async () => {
    if (!task || !task.title) {
      setError('No task selected. Please select a task first.');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await aiService.generateQuestions(
        task.title,
        task.description || '',
        settings
      );
      
      setQuestions(result.questions);
      setShowQuestions(true);
    } catch (error) {
      console.error('Error generating questions:', error);
      setError(error.message || 'Failed to generate questions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Render a multiple choice question
  const renderMultipleChoiceQuestion = (question, index) => {
    return (
      <div className="question multiple-choice" key={index}>
        <div className="question-header">
          <span className="question-number">{index + 1}</span>
          <div className="question-text">{question.question}</div>
        </div>
        <div className="question-options">
          {Object.entries(question.options || {}).map(([key, value]) => (
            <div 
              className={`option ${question.correctAnswer === key ? 'correct' : ''}`} 
              key={key}
            >
              <span className="option-letter">{key}</span>
              <span className="option-text">{value}</span>
              {question.correctAnswer === key && (
                <span className="correct-indicator"><FaCheck /></span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Render an essay question
  const renderEssayQuestion = (question, index) => {
    return (
      <div className="question essay" key={index}>
        <div className="question-header">
          <span className="question-number">{index + 1}</span>
          <div className="question-text">{question.question}</div>
        </div>
        {question.suggestedAnswer && (
          <div className="suggested-answer">
            <div className="suggested-answer-header">
              <FaLightbulb /> Suggested Answer Elements:
            </div>
            <div className="suggested-answer-content">
              {question.suggestedAnswer}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Render a true/false question
  const renderTrueFalseQuestion = (question, index) => {
    return (
      <div className="question true-false" key={index}>
        <div className="question-header">
          <span className="question-number">{index + 1}</span>
          <div className="question-text">{question.question}</div>
        </div>
        <div className="true-false-options">
          <div className={`option ${question.correctAnswer === 'True' ? 'correct' : ''}`}>
            <span className="option-text">True</span>
            {question.correctAnswer === 'True' && (
              <span className="correct-indicator"><FaCheck /></span>
            )}
          </div>
          <div className={`option ${question.correctAnswer === 'False' ? 'correct' : ''}`}>
            <span className="option-text">False</span>
            {question.correctAnswer === 'False' && (
              <span className="correct-indicator"><FaCheck /></span>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // Render a fill-in-the-blanks question
  const renderFillInBlanksQuestion = (question, index) => {
    return (
      <div className="question fill-in-blanks" key={index}>
        <div className="question-header">
          <span className="question-number">{index + 1}</span>
          <div className="question-text">{question.question}</div>
        </div>
        <div className="answer">
          <div className="answer-header">Answer:</div>
          <div className="answer-content">{question.correctAnswer}</div>
        </div>
      </div>
    );
  };
  
  // Render a matching question
  const renderMatchingQuestion = (question, index) => {
    return (
      <div className="question matching" key={index}>
        <div className="question-header">
          <span className="question-number">{index + 1}</span>
          <div className="question-text">Match the items in Column A with Column B:</div>
        </div>
        <div className="matching-columns">
          <div className="column column-a">
            <div className="column-header">Column A</div>
            {question.columnA && question.columnA.map(item => (
              <div className="matching-item" key={item.id}>
                <span className="item-id">{item.id}.</span>
                <span className="item-text">{item.text}</span>
              </div>
            ))}
          </div>
          <div className="column column-b">
            <div className="column-header">Column B</div>
            {question.columnB && question.columnB.map(item => (
              <div className="matching-item" key={item.id}>
                <span className="item-id">{item.id}.</span>
                <span className="item-text">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="matching-answers">
          <div className="matching-answers-header">Correct Matches:</div>
          <div className="matching-answers-content">
            {question.correctMatches && Object.entries(question.correctMatches).map(([key, value]) => (
              <div className="match" key={key}>
                <span>{key} → {value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  // Render a question based on its type
  const renderQuestion = (question, index) => {
    switch (question.type) {
      case 'multiple_choice':
        return renderMultipleChoiceQuestion(question, index);
      case 'essay':
        return renderEssayQuestion(question, index);
      case 'true_false':
        return renderTrueFalseQuestion(question, index);
      case 'fill_in_blanks':
        return renderFillInBlanksQuestion(question, index);
      case 'matching':
        return renderMatchingQuestion(question, index);
      default:
        return (
          <div className="question unknown" key={index}>
            <div className="question-header">
              <span className="question-number">{index + 1}</span>
              <div className="question-text">Unknown question type</div>
            </div>
            <pre>{JSON.stringify(question, null, 2)}</pre>
          </div>
        );
    }
  };
  
  return (
    <div className="question-generator">
      <div className="question-generator-header">
        <h3>
          <FaRobot /> AI Question Generator
          {task && <span className="for-task">for: {task.title}</span>}
        </h3>
        <div className="question-generator-actions">
          <button 
            className="settings-toggle"
            onClick={() => setShowSettings(!showSettings)}
            title="Settings"
          >
            <FaCog /> {showSettings ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </div>
      </div>
      
      {showSettings && (
        <div className="question-generator-settings">
          <div className="settings-grid">
            <div className="setting">
              <label htmlFor="difficulty">Difficulty:</label>
              <select 
                id="difficulty"
                value={settings.difficulty}
                onChange={(e) => handleSettingChange('difficulty', e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            
            <div className="setting">
              <label htmlFor="questionType">Question Type:</label>
              <select 
                id="questionType"
                value={settings.questionType}
                onChange={(e) => handleSettingChange('questionType', e.target.value)}
              >
                <option value="multiple_choice">Multiple Choice</option>
                <option value="essay">Essay</option>
                <option value="true_false">True/False</option>
                <option value="fill_in_blanks">Fill in the Blanks</option>
                <option value="matching">Matching</option>
              </select>
            </div>
            
            <div className="setting">
              <label htmlFor="numQuestions">Number of Questions:</label>
              <select 
                id="numQuestions"
                value={settings.numQuestions}
                onChange={(e) => handleSettingChange('numQuestions', parseInt(e.target.value))}
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="5">5</option>
                <option value="10">10</option>
              </select>
            </div>
            
            <div className="setting">
              <label htmlFor="bloomLevel">Bloom's Taxonomy Level:</label>
              <select 
                id="bloomLevel"
                value={settings.bloomLevel}
                onChange={(e) => handleSettingChange('bloomLevel', e.target.value)}
              >
                <option value="knowledge">Knowledge (Remembering)</option>
                <option value="understanding">Understanding (Comprehending)</option>
                <option value="application">Application (Applying)</option>
                <option value="analysis">Analysis (Analyzing)</option>
                <option value="synthesis">Synthesis (Creating)</option>
                <option value="evaluation">Evaluation (Evaluating)</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      <div className="question-generator-content">
        {!task ? (
          <div className="no-task-selected">
            <FaQuestion />
            <p>Select a task to generate questions about its content.</p>
          </div>
        ) : (
          <>
            <div className="generate-button-container">
              <button 
                className="generate-button"
                onClick={generateQuestions}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <FaSpinner className="spinner" /> Generating Questions...
                  </>
                ) : (
                  <>
                    <FaRobot /> Generate Questions
                  </>
                )}
              </button>
            </div>
            
            {error && (
              <div className="error-message">
                <FaTimes /> {error}
              </div>
            )}
            
            {questions.length > 0 && (
              <div className="questions-container">
                <div className="questions-header">
                  <h4>Generated Questions</h4>
                  <button 
                    className="toggle-questions"
                    onClick={() => setShowQuestions(!showQuestions)}
                  >
                    {showQuestions ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </div>
                
                {showQuestions && (
                  <div className="questions-list">
                    {questions.map((question, index) => renderQuestion(question, index))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QuestionGenerator;
