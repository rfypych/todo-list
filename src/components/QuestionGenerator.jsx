import { useState } from 'react';
import { FaQuestion, FaTimes, FaCog, FaChevronDown, FaChevronUp, FaCheck } from 'react-icons/fa';
import questionGeneratorService from '../services/QuestionGeneratorService';
import './QuestionGenerator.css';

const QuestionGenerator = ({ todo, onClose }) => {
  const [settings, setSettings] = useState({
    difficulty: 'medium',
    questionTypes: ['multiple-choice', 'essay', 'true-false'],
    count: 3,
    bloomLevels: ['knowledge', 'comprehension', 'application', 'analysis']
  });

  const [questions, setQuestions] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Generate questions based on todo content
  const generateQuestions = () => {
    setGenerating(true);
    setError(null);

    try {
      const result = questionGeneratorService.generateQuestions(
        todo.title,
        todo.description,
        settings
      );

      if (result.success) {
        setQuestions(result.questions);
      } else {
        setError(result.error || 'Failed to generate questions');
      }
    } catch (err) {
      setError('An error occurred while generating questions');
      console.error('Question generation error:', err);
    } finally {
      setGenerating(false);
    }
  };

  // Handle settings change
  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  // Handle question type toggle
  const toggleQuestionType = (type) => {
    setSettings(prev => {
      const currentTypes = [...prev.questionTypes];

      if (currentTypes.includes(type)) {
        // Remove if already included (but ensure at least one type remains)
        if (currentTypes.length > 1) {
          return {
            ...prev,
            questionTypes: currentTypes.filter(t => t !== type)
          };
        }
        return prev;
      } else {
        // Add if not included
        return {
          ...prev,
          questionTypes: [...currentTypes, type]
        };
      }
    });
  };

  // Handle Bloom's taxonomy level toggle
  const toggleBloomLevel = (level) => {
    setSettings(prev => {
      const currentLevels = [...prev.bloomLevels];

      if (currentLevels.includes(level)) {
        // Remove if already included (but ensure at least one level remains)
        if (currentLevels.length > 1) {
          return {
            ...prev,
            bloomLevels: currentLevels.filter(l => l !== level)
          };
        }
        return prev;
      } else {
        // Add if not included
        return {
          ...prev,
          bloomLevels: [...currentLevels, level]
        };
      }
    });
  };

  // Render a question based on its type
  const renderQuestion = (question, index) => {
    switch (question.type) {
      case 'multiple-choice':
        return renderMultipleChoiceQuestion(question, index);
      case 'essay':
        return renderEssayQuestion(question, index);
      case 'true-false':
        return renderTrueFalseQuestion(question, index);
      case 'fill-in-blank':
        return renderFillInBlankQuestion(question, index);
      case 'matching':
        return renderMatchingQuestion(question, index);
      default:
        return (
          <div key={question.id} className="question-item">
            <p>Unsupported question type: {question.type}</p>
          </div>
        );
    }
  };

  // Render a multiple choice question
  const renderMultipleChoiceQuestion = (question, index) => {
    return (
      <div key={question.id} className="question-item">
        <div className="question-header">
          <span className="question-number">{index + 1}</span>
          <span className="question-type">Multiple Choice</span>
          <span className="question-difficulty">{question.difficulty}</span>
          <span className="question-bloom-level">{question.bloomLevel}</span>
        </div>
        <p className="question-text">{question.questionText}</p>
        <div className="question-options">
          {question.options.map((option, optionIndex) => (
            <div key={optionIndex} className="option-item">
              <input
                type="radio"
                id={`q${index}-option-${optionIndex}`}
                name={`question-${index}`}
              />
              <label htmlFor={`q${index}-option-${optionIndex}`}>{option}</label>
            </div>
          ))}
        </div>
        <div className="question-explanation">
          <p><strong>Explanation:</strong> {question.explanation}</p>
        </div>
      </div>
    );
  };

  // Render an essay question
  const renderEssayQuestion = (question, index) => {
    return (
      <div key={question.id} className="question-item">
        <div className="question-header">
          <span className="question-number">{index + 1}</span>
          <span className="question-type">Essay</span>
          <span className="question-difficulty">{question.difficulty}</span>
          <span className="question-bloom-level">{question.bloomLevel}</span>
        </div>
        <p className="question-text">{question.questionText}</p>
        <div className="essay-response">
          <p className="response-guide">Suggested response length: {question.suggestedResponseLength}</p>
          <textarea
            rows="4"
            placeholder="Write your answer here..."
            className="essay-textarea"
          ></textarea>
        </div>
        <div className="question-rubric">
          <p><strong>Rubric:</strong> {question.rubric}</p>
        </div>
      </div>
    );
  };

  // Render a true/false question
  const renderTrueFalseQuestion = (question, index) => {
    return (
      <div key={question.id} className="question-item">
        <div className="question-header">
          <span className="question-number">{index + 1}</span>
          <span className="question-type">True/False</span>
          <span className="question-difficulty">{question.difficulty}</span>
          <span className="question-bloom-level">{question.bloomLevel}</span>
        </div>
        <p className="question-text">{question.questionText}</p>
        <div className="true-false-options">
          <div className="option-item">
            <input
              type="radio"
              id={`q${index}-true`}
              name={`question-${index}`}
            />
            <label htmlFor={`q${index}-true`}>True</label>
          </div>
          <div className="option-item">
            <input
              type="radio"
              id={`q${index}-false`}
              name={`question-${index}`}
            />
            <label htmlFor={`q${index}-false`}>False</label>
          </div>
        </div>
        <div className="question-explanation">
          <p><strong>Explanation:</strong> {question.explanation}</p>
        </div>
      </div>
    );
  };

  // Render a fill-in-the-blank question
  const renderFillInBlankQuestion = (question, index) => {
    return (
      <div key={question.id} className="question-item">
        <div className="question-header">
          <span className="question-number">{index + 1}</span>
          <span className="question-type">Fill in the Blank</span>
          <span className="question-difficulty">{question.difficulty}</span>
          <span className="question-bloom-level">{question.bloomLevel}</span>
        </div>
        <p className="question-text">{question.questionText}</p>
        <div className="fill-blank-response">
          <input
            type="text"
            placeholder="Your answer..."
            className="fill-blank-input"
          />
        </div>
        <div className="question-explanation">
          <p><strong>Explanation:</strong> {question.explanation}</p>
        </div>
      </div>
    );
  };

  // Render a matching question
  const renderMatchingQuestion = (question, index) => {
    return (
      <div key={question.id} className="question-item">
        <div className="question-header">
          <span className="question-number">{index + 1}</span>
          <span className="question-type">Matching</span>
          <span className="question-difficulty">{question.difficulty}</span>
          <span className="question-bloom-level">{question.bloomLevel}</span>
        </div>
        <p className="question-text">{question.questionText}</p>
        <div className="matching-container">
          <div className="matching-terms">
            {question.items.map((item, itemIndex) => (
              <div key={`term-${itemIndex}`} className="matching-term">
                <span className="term-label">{String.fromCharCode(65 + itemIndex)}.</span>
                <span className="term-text">{item.term}</span>
              </div>
            ))}
          </div>
          <div className="matching-definitions">
            {question.items.map((item, itemIndex) => (
              <div key={`def-${itemIndex}`} className="matching-definition">
                <span className="def-number">{itemIndex + 1}.</span>
                <span className="def-text">{item.definition}</span>
                <select className="matching-select">
                  <option value="">Select...</option>
                  {question.items.map((_, optionIndex) => (
                    <option key={optionIndex} value={String.fromCharCode(65 + optionIndex)}>
                      {String.fromCharCode(65 + optionIndex)}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
        <div className="question-explanation">
          <p><strong>Explanation:</strong> {question.explanation}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="question-generator-container">
      <div className="question-generator-header">
        <h3><FaQuestion /> AI Question Generator</h3>
        <div className="header-actions">
          <button
            className="settings-btn"
            onClick={() => setShowSettings(!showSettings)}
            title="Settings"
          >
            <FaCog />
          </button>
          <button
            className="close-btn"
            onClick={onClose}
            title="Close"
          >
            <FaTimes />
          </button>
        </div>
      </div>

      <div className="question-generator-content">
        <div className="task-info">
          <h4>Generating questions based on:</h4>
          <p className="task-title">{todo.title}</p>
          {todo.description && (
            <p className="task-description">{todo.description}</p>
          )}
        </div>

        {showSettings && (
          <div className="question-settings">
            <h4>Question Settings</h4>

            <div className="setting-group">
              <label>Difficulty Level:</label>
              <div className="setting-options">
                <button
                  className={`setting-btn ${settings.difficulty === 'easy' ? 'active' : ''}`}
                  onClick={() => handleSettingChange('difficulty', 'easy')}
                >
                  Easy
                </button>
                <button
                  className={`setting-btn ${settings.difficulty === 'medium' ? 'active' : ''}`}
                  onClick={() => handleSettingChange('difficulty', 'medium')}
                >
                  Medium
                </button>
                <button
                  className={`setting-btn ${settings.difficulty === 'hard' ? 'active' : ''}`}
                  onClick={() => handleSettingChange('difficulty', 'hard')}
                >
                  Hard
                </button>
              </div>
            </div>

            <div className="setting-group">
              <label>Question Types:</label>
              <div className="setting-options">
                <button
                  className={`setting-btn ${settings.questionTypes.includes('multiple-choice') ? 'active' : ''}`}
                  onClick={() => toggleQuestionType('multiple-choice')}
                >
                  Multiple Choice
                </button>
                <button
                  className={`setting-btn ${settings.questionTypes.includes('essay') ? 'active' : ''}`}
                  onClick={() => toggleQuestionType('essay')}
                >
                  Essay
                </button>
                <button
                  className={`setting-btn ${settings.questionTypes.includes('true-false') ? 'active' : ''}`}
                  onClick={() => toggleQuestionType('true-false')}
                >
                  True/False
                </button>
                <button
                  className={`setting-btn ${settings.questionTypes.includes('fill-in-blank') ? 'active' : ''}`}
                  onClick={() => toggleQuestionType('fill-in-blank')}
                >
                  Fill in Blank
                </button>
                <button
                  className={`setting-btn ${settings.questionTypes.includes('matching') ? 'active' : ''}`}
                  onClick={() => toggleQuestionType('matching')}
                >
                  Matching
                </button>
              </div>
            </div>

            <div className="setting-group">
              <label>Number of Questions:</label>
              <div className="setting-options">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={settings.count}
                  onChange={(e) => handleSettingChange('count', Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                  className="count-input"
                />
              </div>
            </div>

            <div className="setting-group">
              <label>Bloom's Taxonomy Levels:</label>
              <div className="setting-options bloom-levels">
                <button
                  className={`setting-btn ${settings.bloomLevels.includes('knowledge') ? 'active' : ''}`}
                  onClick={() => toggleBloomLevel('knowledge')}
                  title="Remembering facts and basic concepts"
                >
                  Knowledge
                </button>
                <button
                  className={`setting-btn ${settings.bloomLevels.includes('comprehension') ? 'active' : ''}`}
                  onClick={() => toggleBloomLevel('comprehension')}
                  title="Explaining ideas or concepts"
                >
                  Comprehension
                </button>
                <button
                  className={`setting-btn ${settings.bloomLevels.includes('application') ? 'active' : ''}`}
                  onClick={() => toggleBloomLevel('application')}
                  title="Using information in new situations"
                >
                  Application
                </button>
                <button
                  className={`setting-btn ${settings.bloomLevels.includes('analysis') ? 'active' : ''}`}
                  onClick={() => toggleBloomLevel('analysis')}
                  title="Drawing connections among ideas"
                >
                  Analysis
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="generate-actions">
          <button
            className="generate-btn"
            onClick={generateQuestions}
            disabled={generating}
          >
            {generating ? 'Generating...' : 'Generate Questions'}
          </button>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {questions.length > 0 && (
          <div className="questions-container">
            <h4>Generated Questions</h4>
            {questions.map((question, index) => renderQuestion(question, index))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionGenerator;
