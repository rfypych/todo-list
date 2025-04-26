// AI Service for generating questions using OpenRouter API
class AIService {
  constructor() {
    this.apiKey = null;
    this.model = 'deepseek/deepseek-chat-v3-0324:free';
    this.baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
  }

  // Initialize with API key
  init(apiKey) {
    if (!apiKey) return false;
    this.apiKey = apiKey;
    return true;
  }

  // Check if the service is initialized
  isInitialized() {
    return !!this.apiKey;
  }

  // Generate questions based on task content
  async generateQuestions(taskTitle, taskDescription, options = {}) {
    if (!this.isInitialized()) {
      throw new Error('AI Service not initialized. Please provide an API key.');
    }

    const {
      difficulty = 'medium',
      questionType = 'multiple_choice',
      numQuestions = 3,
      bloomLevel = 'understanding'
    } = options;

    // Prepare the prompt for the AI
    const prompt = this._createPrompt(taskTitle, taskDescription, difficulty, questionType, numQuestions, bloomLevel);

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Todo List Question Generator'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are an educational assistant that creates high-quality questions based on learning materials.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return this._parseResponse(data, questionType);
    } catch (error) {
      console.error('Error generating questions:', error);
      throw error;
    }
  }

  // Create the prompt for the AI based on parameters
  _createPrompt(title, description, difficulty, questionType, numQuestions, bloomLevel) {
    let prompt = `Generate ${numQuestions} ${difficulty} difficulty ${questionType.replace('_', ' ')} questions about the following topic:\n\n`;
    prompt += `Title: ${title}\n`;
    prompt += `Description: ${description || 'No additional description provided.'}\n\n`;
    
    prompt += `Requirements:\n`;
    prompt += `1. Questions should be at the ${bloomLevel} level of Bloom's Taxonomy\n`;
    
    // Add specific instructions based on question type
    switch (questionType) {
      case 'multiple_choice':
        prompt += `2. Each question should have 4 options (A, B, C, D)\n`;
        prompt += `3. Clearly indicate the correct answer\n`;
        prompt += `4. Format each question as: Q1. [Question text]\\nA. [Option A]\\nB. [Option B]\\nC. [Option C]\\nD. [Option D]\\nCorrect Answer: [Letter]\n`;
        break;
      case 'true_false':
        prompt += `2. Each statement should be clearly true or false\n`;
        prompt += `3. Format each question as: Q1. [Statement]\\nCorrect Answer: [True/False]\n`;
        break;
      case 'fill_in_blank':
        prompt += `2. Create sentences with blanks for key concepts\n`;
        prompt += `3. Format each question as: Q1. [Sentence with _____ for blank]\\nCorrect Answer: [Word or phrase that fills the blank]\n`;
        break;
      case 'short_answer':
        prompt += `2. Questions should be answerable in 1-2 sentences\n`;
        prompt += `3. Provide a model answer for each question\n`;
        prompt += `4. Format each question as: Q1. [Question text]\\nModel Answer: [Brief answer]\n`;
        break;
      case 'essay':
        prompt += `2. Questions should require deeper analysis and longer responses\n`;
        prompt += `3. Provide key points that should be addressed in the answer\n`;
        prompt += `4. Format each question as: Q1. [Question text]\\nKey Points: [Bullet points of concepts to address]\n`;
        break;
      default:
        prompt += `2. Make questions clear and specific to the topic\n`;
        prompt += `3. Provide answers for each question\n`;
    }
    
    prompt += `\nReturn ONLY the questions and answers in the specified format, without any additional text, explanations, or numbering system other than what was specified.`;
    
    return prompt;
  }

  // Parse the AI response into a structured format
  _parseResponse(data, questionType) {
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from AI service');
    }

    const responseText = data.choices[0].message.content.trim();
    const questions = [];
    
    // Split the response into individual questions
    const questionBlocks = responseText.split(/Q\d+\./).filter(block => block.trim());
    
    questionBlocks.forEach((block, index) => {
      const questionData = {
        id: index + 1,
        type: questionType,
        content: block.trim()
      };
      
      // Further parsing based on question type
      if (questionType === 'multiple_choice') {
        const correctAnswerMatch = block.match(/Correct Answer:\s*([A-D])/i);
        if (correctAnswerMatch) {
          questionData.correctAnswer = correctAnswerMatch[1];
        }
        
        // Extract options
        const options = [];
        const optionMatches = block.matchAll(/([A-D])\.\s*([^\n]+)/g);
        for (const match of optionMatches) {
          options.push({
            label: match[1],
            text: match[2].trim()
          });
        }
        questionData.options = options;
        
        // Extract question text
        const questionTextMatch = block.match(/^([^A-D\n]+)/);
        if (questionTextMatch) {
          questionData.questionText = questionTextMatch[0].trim();
        }
      } else if (questionType === 'true_false') {
        const correctAnswerMatch = block.match(/Correct Answer:\s*(True|False)/i);
        if (correctAnswerMatch) {
          questionData.correctAnswer = correctAnswerMatch[1];
        }
        
        // Extract statement
        const statementMatch = block.match(/^([^Correct\n]+)/);
        if (statementMatch) {
          questionData.questionText = statementMatch[0].trim();
        }
      }
      
      questions.push(questionData);
    });
    
    return questions;
  }
}

// Create a singleton instance
const aiService = new AIService();
export default aiService;
