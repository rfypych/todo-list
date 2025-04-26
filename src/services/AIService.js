import { HfInference } from '@huggingface/inference';

class AIService {
  constructor() {
    this.hf = null;
    this.model = 'google-bert/bert-base-multilingual-cased';
    this.initialized = false;
  }

  init(apiKey) {
    if (!apiKey) {
      console.error('API key is required to initialize AI service');
      return false;
    }

    try {
      this.hf = new HfInference(apiKey);
      this.initialized = true;
      console.log('AI service initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing AI service:', error);
      return false;
    }
  }

  isInitialized() {
    return this.initialized;
  }

  async generateQuestions(taskContent, options = {}) {
    if (!this.isInitialized()) {
      console.error('AI service not initialized');
      return { success: false, error: 'AI service not initialized' };
    }

    if (!taskContent) {
      console.error('Task content is required');
      return { success: false, error: 'Task content is required' };
    }

    const {
      count = 3,
      difficulty = 'medium', // easy, medium, hard
      types = ['multiple-choice'], // multiple-choice, essay, true-false, fill-in-blanks, matching
      language = 'en', // en, id, etc.
    } = options;

    try {
      console.log(`Generating ${count} ${difficulty} questions of types ${types.join(', ')} in ${language}`);
      
      // Prepare the prompt for question generation
      const prompt = this.buildPrompt(taskContent, count, difficulty, types, language);
      
      // Call the Hugging Face API for text generation
      const response = await this.hf.textGeneration({
        model: 'gpt2',  // Using GPT-2 for text generation
        inputs: prompt,
        parameters: {
          max_new_tokens: 250 * count, // Adjust based on expected output length
          temperature: 0.7,
          top_p: 0.95,
          repetition_penalty: 1.2,
        }
      });
      
      // Parse the generated text into structured questions
      const questions = this.parseGeneratedQuestions(response.generated_text, types);
      
      return {
        success: true,
        questions,
        raw: response.generated_text,
      };
    } catch (error) {
      console.error('Error generating questions:', error);
      return {
        success: false,
        error: error.message || 'Error generating questions',
      };
    }
  }

  // Build a prompt for the AI based on task content and parameters
  buildPrompt(taskContent, count, difficulty, types, language) {
    const difficultyDescriptions = {
      easy: 'basic understanding and recall',
      medium: 'application and analysis',
      hard: 'evaluation and synthesis',
    };

    const typeDescriptions = {
      'multiple-choice': 'multiple choice questions with 4 options',
      'essay': 'open-ended questions requiring detailed explanations',
      'true-false': 'statements that are either true or false',
      'fill-in-blanks': 'sentences with missing words to be filled in',
      'matching': 'matching items from two columns',
    };

    // Determine language for instructions
    const instructions = language === 'id' 
      ? `Buatlah ${count} pertanyaan ${difficulty} (${difficultyDescriptions[difficulty]}) dengan tipe ${types.map(t => typeDescriptions[t]).join(', ')} berdasarkan materi berikut:\n\n${taskContent}\n\nPertanyaan:`
      : `Generate ${count} ${difficulty} (${difficultyDescriptions[difficulty]}) questions with ${types.map(t => typeDescriptions[t]).join(', ')} based on the following content:\n\n${taskContent}\n\nQuestions:`;

    return instructions;
  }

  // Parse the generated text into structured question objects
  parseGeneratedQuestions(generatedText, types) {
    // Basic parsing - this would need to be enhanced based on actual output patterns
    const questionBlocks = generatedText.split(/\d+\.\s+/).filter(block => block.trim().length > 0);
    
    return questionBlocks.map((block, index) => {
      // Determine question type based on content
      let type = 'essay'; // Default
      if (block.includes('A)') || block.includes('a)') || block.includes('A.') || block.includes('a.')) {
        type = 'multiple-choice';
      } else if (block.toLowerCase().includes('true or false')) {
        type = 'true-false';
      } else if (block.includes('___') || block.includes('...')) {
        type = 'fill-in-blanks';
      } else if (block.includes('Match') || block.includes('matching')) {
        type = 'matching';
      }
      
      // For multiple choice, try to extract options
      let options = [];
      if (type === 'multiple-choice') {
        const optionMatches = block.match(/[A-D][).]\s+.+?(?=\s+[A-D][).]|$)/gs);
        if (optionMatches) {
          options = optionMatches.map(opt => opt.trim());
        }
      }
      
      // Extract the question text
      let questionText = block;
      if (options.length > 0) {
        // Remove options from question text
        questionText = block.split(/[A-D][).]/).shift().trim();
      }
      
      return {
        id: `q-${Date.now()}-${index}`,
        type,
        question: questionText,
        options,
        difficulty: this.determineDifficulty(questionText),
        answer: '', // This would be filled by the user
        correctAnswer: '', // For self-assessment, could be filled later
      };
    });
  }
  
  // Determine question difficulty based on content analysis
  determineDifficulty(questionText) {
    const lowerText = questionText.toLowerCase();
    
    // Check for keywords indicating difficulty
    const hardKeywords = ['analyze', 'evaluate', 'create', 'synthesize', 'critique', 'justify', 'why'];
    const mediumKeywords = ['apply', 'compare', 'contrast', 'explain', 'classify', 'implement', 'how'];
    const easyKeywords = ['define', 'list', 'describe', 'identify', 'recall', 'what', 'when', 'where'];
    
    for (const keyword of hardKeywords) {
      if (lowerText.includes(keyword)) return 'hard';
    }
    
    for (const keyword of mediumKeywords) {
      if (lowerText.includes(keyword)) return 'medium';
    }
    
    for (const keyword of easyKeywords) {
      if (lowerText.includes(keyword)) return 'easy';
    }
    
    // Default to medium if no keywords found
    return 'medium';
  }

  // For more advanced analysis using BERT
  async analyzeContent(content) {
    if (!this.isInitialized()) {
      console.error('AI service not initialized');
      return null;
    }

    try {
      // Use BERT for feature extraction
      const features = await this.hf.featureExtraction({
        model: this.model,
        inputs: content,
      });
      
      return features;
    } catch (error) {
      console.error('Error analyzing content:', error);
      return null;
    }
  }
}

// Create a singleton instance
const aiService = new AIService();
export default aiService;
