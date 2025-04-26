import { useState } from 'react';
import { FaQuestion, FaSpinner, FaChevronDown, FaChevronUp, FaLightbulb } from 'react-icons/fa';
import geminiService from '../services/GeminiService';

const QuestionGenerator = ({ task }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);
  const [options, setOptions] = useState({
    numQuestions: 3,
    difficulty: 'medium',
    questionType: 'multiple-choice',
    bloomLevel: 'comprehension'
  });
  const [showOptions, setShowOptions] = useState(false);

  const handleOptionChange = (e) => {
    const { name, value } = e.target;
    setOptions(prev => ({
      ...prev,
      [name]: name === 'numQuestions' ? parseInt(value, 10) : value
    }));
  };

  const generateQuestions = async () => {
    if (!task.title && !task.description) {
      setError('Task needs a title or description to generate questions.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const generatedQuestions = await geminiService.generateQuestions(task, options);
      setQuestions(generatedQuestions);
    } catch (err) {
      console.error('Error generating questions:', err);
      setError('Failed to generate questions. Please try again later.');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderQuestion = (question) => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="question multiple-choice" key={question.id}>
            <div className="question-text">{question.question}</div>
            <div className="options">
              {Object.entries(question.options).map(([key, value]) => (
                <div 
                  className={`option ${key === question.correctAnswer ? 'correct' : ''}`} 
                  key={key}
                >
                  <span className="option-letter">{key}</span>
                  <span className="option-text">{value}</span>
                </div>
              ))}
            </div>
            {question.explanation && (
              <div className="explanation">
                <strong>Explanation:</strong> {question.explanation}
              </div>
            )}
          </div>
        );

      case 'essay':
        return (
          <div className="question essay" key={question.id}>
            <div className="question-text">{question.question}</div>
            {question.sampleAnswer && (
              <div className="sample-answer">
                <strong>Sample Answer:</strong> {question.sampleAnswer}
              </div>
            )}
          </div>
        );

      case 'true-false':
        return (
          <div className="question true-false" key={question.id}>
            <div className="question-text">{question.statement}</div>
            <div className={`answer ${question.answer.toLowerCase()}`}>
              {question.answer}
            </div>
            {question.explanation && (
              <div className="explanation">
                <strong>Explanation:</strong> {question.explanation}
              </div>
            )}
          </div>
        );

      case 'fill-in-blanks':
        return (
          <div className="question fill-in-blanks" key={question.id}>
            <div className="question-text">{question.sentence}</div>
            <div className="answer">
              <strong>Answer:</strong> {question.answer}
            </div>
            {question.explanation && (
              <div className="explanation">
                <strong>Explanation:</strong> {question.explanation}
              </div>
            )}
          </div>
        );

      case 'matching':
        return (
          <div className="question matching" key={question.id}>
            <div className="columns">
              <div className="column column-a">
                <h4>Column A</h4>
                {Object.entries(question.columnA).map(([key, value]) => (
                  <div className="matching-item" key={key}>
                    <span className="item-key">{key}</span>
                    <span className="item-value">{value}</span>
                  </div>
                ))}
              </div>
              <div className="column column-b">
                <h4>Column B</h4>
                {Object.entries(question.columnB).map(([key, value]) => (
                  <div className="matching-item" key={key}>
                    <span className="item-key">{key}</span>
                    <span className="item-value">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="matches">
              <strong>Correct Matches:</strong>
              {question.correctMatches.map((match, index) => (
                <span key={index} className="match">
                  {match.a}-{match.b}
                  {index < question.correctMatches.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="question generic" key={question.id}>
            <div className="question-text">{question.question}</div>
            <div className="answer">
              <strong>Answer:</strong> {question.answer}
            </div>
            {question.explanation && (
              <div className="explanation">
                <strong>Explanation:</strong> {question.explanation}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className={`question-generator ${isOpen ? 'open' : ''}`}>
      <div className="question-generator-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="header-title">
          <FaLightbulb className="icon" />
          <span>AI Question Generator</span>
        </div>
        <button className="toggle-btn">
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>

      {isOpen && (
        <div className="question-generator-content">
          <div className="options-bar">
            <button 
              className="options-toggle" 
              onClick={() => setShowOptions(!showOptions)}
            >
              {showOptions ? 'Hide Options' : 'Show Options'}
              {showOptions ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            <button 
              className="generate-btn" 
              onClick={generateQuestions}
              disabled={isGenerating}
            >
              {isGenerating ? <FaSpinner className="spinner" /> : <FaQuestion />}
              {isGenerating ? 'Generating...' : 'Generate Questions'}
            </button>
          </div>

          {showOptions && (
            <div className="generator-options">
              <div className="option-group">
                <label htmlFor="numQuestions">Number of Questions:</label>
                <select 
                  id="numQuestions" 
                  name="numQuestions" 
                  value={options.numQuestions}
                  onChange={handleOptionChange}
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>

              <div className="option-group">
                <label htmlFor="difficulty">Difficulty Level:</label>
                <select 
                  id="difficulty" 
                  name="difficulty" 
                  value={options.difficulty}
                  onChange={handleOptionChange}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="option-group">
                <label htmlFor="questionType">Question Type:</label>
                <select 
                  id="questionType" 
                  name="questionType" 
                  value={options.questionType}
                  onChange={handleOptionChange}
                >
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="essay">Essay</option>
                  <option value="true-false">True/False</option>
                  <option value="fill-in-blanks">Fill in the Blanks</option>
                  <option value="matching">Matching</option>
                </select>
              </div>

              <div className="option-group">
                <label htmlFor="bloomLevel">Bloom's Taxonomy Level:</label>
                <select 
                  id="bloomLevel" 
                  name="bloomLevel" 
                  value={options.bloomLevel}
                  onChange={handleOptionChange}
                >
                  <option value="knowledge">Knowledge</option>
                  <option value="comprehension">Comprehension</option>
                  <option value="application">Application</option>
                  <option value="analysis">Analysis</option>
                  <option value="synthesis">Synthesis</option>
                  <option value="evaluation">Evaluation</option>
                </select>
              </div>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          {questions.length > 0 && (
            <div className="questions-container">
              <h3>Generated Questions</h3>
              {questions.map(renderQuestion)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionGenerator;
