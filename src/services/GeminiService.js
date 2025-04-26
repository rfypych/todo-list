import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API with your API key
const API_KEY = 'AIzaSyAeNNz4Ub3Cp8guoO2gSExwlLRMV2a27Ds';
const genAI = new GoogleGenerativeAI(API_KEY);

class GeminiService {
  constructor() {
    // Use gemini-pro model (the correct model name for the current API version)
    this.model = genAI.getGenerativeModel({
      model: 'gemini-pro',
      apiVersion: 'v1' // Explicitly set API version to v1 instead of v1beta
    });
  }

  /**
   * Generate questions based on task content
   * @param {Object} task - The task object containing title and description
   * @param {Object} options - Options for question generation
   * @param {number} options.numQuestions - Number of questions to generate (default: 3)
   * @param {string} options.difficulty - Difficulty level: 'easy', 'medium', 'hard' (default: 'medium')
   * @param {string} options.questionType - Type of questions: 'multiple-choice', 'essay', 'true-false', 'fill-in-blanks', 'matching' (default: 'multiple-choice')
   * @param {string} options.bloomLevel - Bloom's taxonomy level: 'knowledge', 'comprehension', 'application', 'analysis', 'synthesis', 'evaluation' (default: 'comprehension')
   * @returns {Promise<Array>} - Array of generated questions
   */
  async generateQuestions(task, options = {}) {
    try {
      const {
        numQuestions = 3,
        difficulty = 'medium',
        questionType = 'multiple-choice',
        bloomLevel = 'comprehension'
      } = options;

      // Prepare the content to analyze
      const content = `
Task Title: ${task.title || ''}
Task Description: ${task.description || ''}
      `.trim();

      console.log('Preparing content for Gemini:', content);

      // Create the prompt for Gemini
      const prompt = this._createPrompt(content, numQuestions, difficulty, questionType, bloomLevel);

      console.log('Sending request to Gemini API...');

      // Generate content using Gemini with safety settings
      const generationConfig = {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      };

      const safetySettings = [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ];

      // Generate content using Gemini
      const result = await this.model.generateContent({
        contents: [prompt],
        generationConfig,
        safetySettings
      });

      console.log('Received response from Gemini API');

      const response = await result.response;
      const text = response.text();

      console.log('Raw response text:', text.substring(0, 100) + '...');

      // Parse the response to extract questions
      const questions = this._parseQuestions(text, questionType);
      console.log(`Successfully parsed ${questions.length} questions`);

      return questions;
    } catch (error) {
      console.error('Error generating questions:', error);
      throw error;
    }
  }

  /**
   * Create a prompt for Gemini based on parameters
   * @private
   */
  _createPrompt(content, numQuestions, difficulty, questionType, bloomLevel) {
    // Create a more structured prompt that's easier for the model to follow
    const prompt = {
      role: "user",
      parts: [
        {
          text: `You are an educational question generator. I need you to create ${numQuestions} ${difficulty} level questions in ${questionType} format that target the ${bloomLevel} level of Bloom's taxonomy.

The questions should be based on this content:
${content}

Please follow these exact formatting rules:

${this._getFormatInstructions(questionType)}

Important guidelines:
- Create exactly ${numQuestions} questions
- Make sure all questions are directly related to the content provided
- Ensure questions are at ${difficulty} difficulty level
- Target the ${bloomLevel} cognitive level from Bloom's taxonomy
- Follow the exact format specified above
- Make sure all answers are correct and explanations are clear
- Do not include any additional text or explanations outside the question format`
        }
      ]
    };

    return prompt;
  },

  /**
   * Get format instructions based on question type
   * @private
   */
  _getFormatInstructions(questionType) {
    switch (questionType) {
      case 'multiple-choice':
        return `For multiple-choice questions:
Q1: [Question text]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
Correct Answer: [Letter of correct option]
Explanation: [Brief explanation of the correct answer]

Q2: ...`;

      case 'essay':
        return `For essay questions:
Q1: [Question text]
Sample Answer: [Brief outline of what a good answer should include]

Q2: ...`;

      case 'true-false':
        return `For true-false questions:
Q1: [Statement]
Answer: [True/False]
Explanation: [Brief explanation of why the statement is true or false]

Q2: ...`;

      case 'fill-in-blanks':
        return `For fill-in-the-blanks questions:
Q1: [Sentence with _____ for blank]
Answer: [Word or phrase that fills the blank]
Explanation: [Brief explanation of the answer]

Q2: ...`;

      case 'matching':
        return `For matching questions:
Column A:
A1: [Item 1]
A2: [Item 2]
A3: [Item 3]

Column B:
B1: [Matching item for A1]
B2: [Matching item for A2]
B3: [Matching item for A3]

Correct Matches: A1-B1, A2-B2, A3-B3`;

      default:
        return `For general questions:
Q1: [Question text]
Answer: [Answer text]
Explanation: [Brief explanation]

Q2: ...`;
    }
  }

  /**
   * Parse the response from Gemini to extract questions
   * @private
   */
  _parseQuestions(text, questionType) {
    // Split the text by question markers (Q1:, Q2:, etc.)
    const questionBlocks = text.split(/Q\d+:/);

    // Remove the first element if it's empty or contains only the introduction
    if (questionBlocks[0].trim().length === 0 || !questionBlocks[0].includes('Answer')) {
      questionBlocks.shift();
    }

    // Parse each question block based on the question type
    return questionBlocks.map((block, index) => {
      const questionNumber = index + 1;
      const questionText = block.trim();

      switch (questionType) {
        case 'multiple-choice':
          const options = {};
          const optionMatches = questionText.match(/([A-D])\) (.*?)(?=\n[A-D]\)|Correct Answer:|$)/gs);

          if (optionMatches) {
            optionMatches.forEach(match => {
              const optionLetter = match.charAt(0);
              const optionText = match.substring(3).trim();
              options[optionLetter] = optionText;
            });
          }

          const correctAnswerMatch = questionText.match(/Correct Answer: ([A-D])/);
          const explanationMatch = questionText.match(/Explanation: (.*?)(?=\n\n|$)/s);

          return {
            id: `q${questionNumber}`,
            type: 'multiple-choice',
            question: questionText.split('\n')[0].trim(),
            options,
            correctAnswer: correctAnswerMatch ? correctAnswerMatch[1] : '',
            explanation: explanationMatch ? explanationMatch[1].trim() : ''
          };

        case 'essay':
          const sampleAnswerMatch = questionText.match(/Sample Answer: (.*?)(?=\n\n|$)/s);

          return {
            id: `q${questionNumber}`,
            type: 'essay',
            question: questionText.split('\n')[0].trim(),
            sampleAnswer: sampleAnswerMatch ? sampleAnswerMatch[1].trim() : ''
          };

        case 'true-false':
          const tfAnswerMatch = questionText.match(/Answer: (True|False)/i);
          const tfExplanationMatch = questionText.match(/Explanation: (.*?)(?=\n\n|$)/s);

          return {
            id: `q${questionNumber}`,
            type: 'true-false',
            statement: questionText.split('\n')[0].trim(),
            answer: tfAnswerMatch ? tfAnswerMatch[1] : '',
            explanation: tfExplanationMatch ? tfExplanationMatch[1].trim() : ''
          };

        case 'fill-in-blanks':
          const fibAnswerMatch = questionText.match(/Answer: (.*?)(?=\n|Explanation:|$)/s);
          const fibExplanationMatch = questionText.match(/Explanation: (.*?)(?=\n\n|$)/s);

          return {
            id: `q${questionNumber}`,
            type: 'fill-in-blanks',
            sentence: questionText.split('\n')[0].trim(),
            answer: fibAnswerMatch ? fibAnswerMatch[1].trim() : '',
            explanation: fibExplanationMatch ? fibExplanationMatch[1].trim() : ''
          };

        case 'matching':
          // For matching questions, we need to parse both columns and matches
          const columnAItems = {};
          const columnBItems = {};
          let matches = [];

          // Parse Column A
          const columnAMatches = questionText.match(/A\d+: .*?(?=\n|$)/g);
          if (columnAMatches) {
            columnAMatches.forEach(match => {
              const [key, value] = match.split(': ');
              columnAItems[key] = value;
            });
          }

          // Parse Column B
          const columnBMatches = questionText.match(/B\d+: .*?(?=\n|$)/g);
          if (columnBMatches) {
            columnBMatches.forEach(match => {
              const [key, value] = match.split(': ');
              columnBItems[key] = value;
            });
          }

          // Parse Correct Matches
          const matchesMatch = questionText.match(/Correct Matches: (.*?)(?=\n\n|$)/);
          if (matchesMatch) {
            matches = matchesMatch[1].split(', ').map(match => {
              const [a, b] = match.split('-');
              return { a, b };
            });
          }

          return {
            id: `q${questionNumber}`,
            type: 'matching',
            columnA: columnAItems,
            columnB: columnBItems,
            correctMatches: matches
          };

        default:
          const defaultAnswerMatch = questionText.match(/Answer: (.*?)(?=\n|Explanation:|$)/s);
          const defaultExplanationMatch = questionText.match(/Explanation: (.*?)(?=\n\n|$)/s);

          return {
            id: `q${questionNumber}`,
            type: 'generic',
            question: questionText.split('\n')[0].trim(),
            answer: defaultAnswerMatch ? defaultAnswerMatch[1].trim() : '',
            explanation: defaultExplanationMatch ? defaultExplanationMatch[1].trim() : ''
          };
      }
    });
  }
}

// Create a singleton instance
const geminiService = new GeminiService();
export default geminiService;
