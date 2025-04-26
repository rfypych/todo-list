// AI Question Generator Service
// This service uses NLP techniques to generate questions based on task content

class QuestionGeneratorService {
  constructor() {
    // Initialize with default settings
    this.defaultSettings = {
      difficulty: 'medium', // 'easy', 'medium', 'hard'
      questionTypes: ['multiple-choice', 'essay', 'true-false'], // Types of questions to generate
      count: 3, // Default number of questions to generate
      bloomLevels: ['knowledge', 'comprehension', 'application', 'analysis'] // Bloom's taxonomy levels
    };
  }

  // Generate questions based on task content and settings
  generateQuestions(taskTitle, taskDescription, settings = {}) {
    // Merge default settings with provided settings
    const mergedSettings = { ...this.defaultSettings, ...settings };
    
    // In a real implementation, this would call an AI API
    // For now, we'll simulate the AI by generating questions based on patterns
    
    // Ensure we have content to work with
    const title = taskTitle || '';
    const description = taskDescription || '';
    const content = `${title} ${description}`.trim();
    
    if (!content) {
      return {
        success: false,
        error: 'No content provided to generate questions from',
        questions: []
      };
    }
    
    // Generate questions based on content and settings
    const questions = this._simulateAIQuestionGeneration(content, mergedSettings);
    
    return {
      success: true,
      settings: mergedSettings,
      questions
    };
  }
  
  // Simulate AI question generation
  _simulateAIQuestionGeneration(content, settings) {
    const questions = [];
    const words = content.split(/\\s+/).filter(word => word.length > 3);
    const keyTerms = this._extractKeyTerms(content);
    
    // Generate questions based on settings.count
    for (let i = 0; i < settings.count; i++) {
      // Determine question type for this question
      const questionType = settings.questionTypes[i % settings.questionTypes.length];
      
      // Determine Bloom's taxonomy level for this question
      const bloomLevel = settings.bloomLevels[i % settings.bloomLevels.length];
      
      // Generate question based on type and difficulty
      const question = this._generateQuestionByType(content, keyTerms, questionType, settings.difficulty, bloomLevel);
      
      if (question) {
        questions.push(question);
      }
    }
    
    return questions;
  }
  
  // Extract key terms from content
  _extractKeyTerms(content) {
    // In a real implementation, this would use NLP to extract important terms
    // For now, we'll just take longer words as "key terms"
    const words = content.split(/\\s+/);
    return words
      .filter(word => word.length > 4)
      .map(word => word.replace(/[^a-zA-Z0-9]/g, ''))
      .filter(word => word.length > 0);
  }
  
  // Generate a question based on type, difficulty, and Bloom's level
  _generateQuestionByType(content, keyTerms, type, difficulty, bloomLevel) {
    // Get a key term to use in the question
    const keyTerm = keyTerms.length > 0 
      ? keyTerms[Math.floor(Math.random() * keyTerms.length)] 
      : 'this topic';
    
    // Base question object
    const question = {
      id: Math.random().toString(36).substring(2, 11),
      type,
      difficulty,
      bloomLevel
    };
    
    switch (type) {
      case 'multiple-choice':
        return this._generateMultipleChoiceQuestion(content, keyTerm, difficulty, bloomLevel, question);
      
      case 'essay':
        return this._generateEssayQuestion(content, keyTerm, difficulty, bloomLevel, question);
      
      case 'true-false':
        return this._generateTrueFalseQuestion(content, keyTerm, difficulty, bloomLevel, question);
      
      case 'fill-in-blank':
        return this._generateFillInBlankQuestion(content, keyTerm, difficulty, bloomLevel, question);
      
      case 'matching':
        return this._generateMatchingQuestion(content, keyTerms, difficulty, bloomLevel, question);
      
      default:
        return null;
    }
  }
  
  // Generate a multiple choice question
  _generateMultipleChoiceQuestion(content, keyTerm, difficulty, bloomLevel, question) {
    const questionTemplates = {
      knowledge: [
        `What is ${keyTerm}?`,
        `Which of the following best describes ${keyTerm}?`,
        `What is the definition of ${keyTerm}?`
      ],
      comprehension: [
        `Which example demonstrates ${keyTerm}?`,
        `How would you explain ${keyTerm} to someone else?`,
        `What is the main idea related to ${keyTerm}?`
      ],
      application: [
        `How would you use ${keyTerm} to solve a problem?`,
        `What is an example of ${keyTerm} in action?`,
        `How can ${keyTerm} be applied in a real-world situation?`
      ],
      analysis: [
        `What are the components of ${keyTerm}?`,
        `How does ${keyTerm} relate to other concepts in this topic?`,
        `What evidence supports the concept of ${keyTerm}?`
      ]
    };
    
    // Get templates for the specified Bloom level, or default to knowledge
    const templates = questionTemplates[bloomLevel] || questionTemplates.knowledge;
    
    // Select a random template
    const questionText = templates[Math.floor(Math.random() * templates.length)];
    
    // Generate options
    const correctAnswer = `The correct explanation of ${keyTerm}`;
    const options = [
      correctAnswer,
      `An incorrect explanation of ${keyTerm}`,
      `A misleading statement about ${keyTerm}`,
      `A common misconception about ${keyTerm}`
    ];
    
    // Shuffle options
    const shuffledOptions = this._shuffleArray([...options]);
    
    return {
      ...question,
      questionText,
      options: shuffledOptions,
      correctAnswer,
      explanation: `This question tests your understanding of ${keyTerm} at the ${bloomLevel} level.`
    };
  }
  
  // Generate an essay question
  _generateEssayQuestion(content, keyTerm, difficulty, bloomLevel, question) {
    const questionTemplates = {
      knowledge: [
        `Describe what you know about ${keyTerm}.`,
        `Explain the concept of ${keyTerm} in your own words.`
      ],
      comprehension: [
        `Summarize the main points about ${keyTerm}.`,
        `Explain how ${keyTerm} works and why it's important.`
      ],
      application: [
        `Describe a situation where you would apply ${keyTerm} and explain how you would use it.`,
        `How would you implement ${keyTerm} to solve a specific problem?`
      ],
      analysis: [
        `Analyze the strengths and weaknesses of ${keyTerm}.`,
        `Compare and contrast ${keyTerm} with a related concept.`
      ]
    };
    
    // Get templates for the specified Bloom level, or default to knowledge
    const templates = questionTemplates[bloomLevel] || questionTemplates.knowledge;
    
    // Select a random template
    const questionText = templates[Math.floor(Math.random() * templates.length)];
    
    return {
      ...question,
      questionText,
      suggestedResponseLength: difficulty === 'easy' ? 'short paragraph' : 
                              difficulty === 'medium' ? '1-2 paragraphs' : 
                              '2-3 paragraphs',
      rubric: `Your answer should demonstrate understanding of ${keyTerm} at the ${bloomLevel} level.`
    };
  }
  
  // Generate a true/false question
  _generateTrueFalseQuestion(content, keyTerm, difficulty, bloomLevel, question) {
    const questionTemplates = {
      knowledge: [
        `${keyTerm} is a fundamental concept in this topic.`,
        `${keyTerm} is not related to this topic.`
      ],
      comprehension: [
        `${keyTerm} can be understood as a process rather than a static concept.`,
        `${keyTerm} has no practical applications in real-world scenarios.`
      ],
      application: [
        `${keyTerm} can be applied to solve common problems in this field.`,
        `${keyTerm} is purely theoretical and has no practical applications.`
      ],
      analysis: [
        `${keyTerm} consists of multiple interconnected components.`,
        `${keyTerm} is an isolated concept with no relation to other aspects of this topic.`
      ]
    };
    
    // Get templates for the specified Bloom level, or default to knowledge
    const templates = questionTemplates[bloomLevel] || questionTemplates.knowledge;
    
    // Select a random template
    const statementIndex = Math.floor(Math.random() * templates.length);
    const statement = templates[statementIndex];
    const isTrue = statementIndex % 2 === 0; // Even indices are true statements
    
    return {
      ...question,
      questionText: `True or False: ${statement}`,
      correctAnswer: isTrue ? 'True' : 'False',
      explanation: isTrue 
        ? `This statement about ${keyTerm} is correct.` 
        : `This statement about ${keyTerm} is incorrect.`
    };
  }
  
  // Generate a fill-in-the-blank question
  _generateFillInBlankQuestion(content, keyTerm, difficulty, bloomLevel, question) {
    const questionTemplates = {
      knowledge: [
        `__________ is the term used to describe ${keyTerm.toLowerCase()}.`,
        `The concept of ${keyTerm} is defined as __________.`
      ],
      comprehension: [
        `When explaining ${keyTerm}, it's important to understand that it involves __________.`,
        `The main purpose of ${keyTerm} is to __________.`
      ],
      application: [
        `When applying ${keyTerm} in practice, one should first __________.`,
        `A real-world example of ${keyTerm} is __________.`
      ],
      analysis: [
        `The relationship between ${keyTerm} and other concepts can be described as __________.`,
        `When analyzing ${keyTerm}, the key components include __________.`
      ]
    };
    
    // Get templates for the specified Bloom level, or default to knowledge
    const templates = questionTemplates[bloomLevel] || questionTemplates.knowledge;
    
    // Select a random template
    const questionText = templates[Math.floor(Math.random() * templates.length)];
    
    // Determine the answer based on the question
    let answer = '';
    if (questionText.startsWith('__________')) {
      answer = keyTerm;
    } else {
      answer = `a key concept related to ${content.split(' ').slice(0, 3).join(' ')}`;
    }
    
    return {
      ...question,
      questionText,
      correctAnswer: answer,
      explanation: `This fill-in-the-blank question tests your knowledge of ${keyTerm}.`
    };
  }
  
  // Generate a matching question
  _generateMatchingQuestion(content, keyTerms, difficulty, bloomLevel, question) {
    // Need at least 3 key terms for a matching question
    if (keyTerms.length < 3) {
      keyTerms = [...keyTerms, 'concept A', 'concept B', 'concept C'].slice(0, 4);
    }
    
    // Take up to 4 terms
    const terms = keyTerms.slice(0, 4);
    
    // Create definitions
    const items = terms.map((term, index) => ({
      term,
      definition: `Definition or explanation of ${term}`
    }));
    
    return {
      ...question,
      questionText: `Match each term with its correct definition:`,
      items,
      explanation: `This matching question tests your ability to connect terms with their definitions.`
    };
  }
  
  // Utility function to shuffle an array
  _shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

// Create a singleton instance
const questionGeneratorService = new QuestionGeneratorService();
export default questionGeneratorService;
