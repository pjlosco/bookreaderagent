import { AIService, AIQuestion, ConversationMessage } from '../../src/services/aiService';

/**
 * Comprehensive test suite for AIService
 * 
 * Testing Strategy:
 * - Mock the Google Gemini API to avoid real API calls
 * - Test both success and error scenarios
 * - Verify prompt construction logic
 * - Test conversation history handling
 * 
 * Why Mock?
 * 1. Avoid costs ($0.002 per call adds up)
 * 2. Tests run fast and reliably
 * 3. No rate limits or network issues
 * 4. Deterministic outputs for assertions
 */

// Mock the @google/generative-ai package
jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => {
      return {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn()
        })
      };
    })
  };
});

// Import after mocking
import { GoogleGenerativeAI } from '@google/generative-ai';

describe('AIService', () => {
  let aiService: AIService;
  let mockGenerateContent: jest.Mock;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Set up the mock implementation
    const mockModel = {
      generateContent: jest.fn()
    };
    mockGenerateContent = mockModel.generateContent;

    (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue(mockModel)
    }));
  });

  describe('constructor', () => {
    test('should initialize with API key from parameter', () => {
      const testApiKey = 'test-api-key-123';
      const service = new AIService(testApiKey);
      
      expect(service).toBeInstanceOf(AIService);
      expect(GoogleGenerativeAI).toHaveBeenCalledWith(testApiKey);
    });

    test('should initialize with API key from environment', () => {
      process.env.GEMINI_API_KEY = 'env-api-key-456';
      const service = new AIService();
      
      expect(service).toBeInstanceOf(AIService);
      expect(GoogleGenerativeAI).toHaveBeenCalledWith('env-api-key-456');
      
      delete process.env.GEMINI_API_KEY;
    });

    test('should throw error when no API key provided', () => {
      const originalKey = process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEY;

      expect(() => new AIService()).toThrow('GEMINI_API_KEY environment variable is required');

      // Restore
      if (originalKey) process.env.GEMINI_API_KEY = originalKey;
    });

    test('should create Gemini Pro model', () => {
      const service = new AIService('test-key');
      const mockInstance = (GoogleGenerativeAI as jest.Mock).mock.results[0].value;
      
      expect(mockInstance.getGenerativeModel).toHaveBeenCalledWith({ model: 'gemini-pro' });
    });
  });

  describe('askQuestion', () => {
    beforeEach(() => {
      aiService = new AIService('test-api-key');
    });

    test('should return answer for valid question with chapter context', async () => {
      // Mock successful API response
      const mockAnswer = 'Decision trees are a type of supervised learning algorithm...';
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => mockAnswer
        }
      });

      const question: AIQuestion = {
        question: 'What is a decision tree?',
        chapterTitle: 'Chapter 4: Decision Trees',
        chapterContent: 'Decision trees are a popular machine learning algorithm...'
      };

      const response = await aiService.askQuestion(question);

      expect(response.answer).toBe(mockAnswer);
      expect(response.timestamp).toBeDefined();
      expect(new Date(response.timestamp).toString()).not.toBe('Invalid Date');
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    test('should include chapter context in prompt', async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => 'Answer' }
      });

      const question: AIQuestion = {
        question: 'Explain entropy',
        chapterTitle: 'Chapter 4: Decision Trees',
        chapterContent: 'Entropy is a measure of impurity...'
      };

      await aiService.askQuestion(question);

      const promptArg = mockGenerateContent.mock.calls[0][0];
      expect(promptArg).toContain('**Chapter:** Chapter 4: Decision Trees');
      expect(promptArg).toContain('Entropy is a measure of impurity');
      expect(promptArg).toContain('Explain entropy');
    });

    test('should handle questions without chapter context', async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => 'General answer' }
      });

      const question: AIQuestion = {
        question: 'What is machine learning?'
      };

      const response = await aiService.askQuestion(question);

      expect(response.answer).toBe('General answer');
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    test('should include conversation history in prompt', async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => 'Follow-up answer' }
      });

      const conversationHistory: ConversationMessage[] = [
        {
          role: 'user',
          content: 'What is entropy?',
          timestamp: '2025-10-14T10:00:00.000Z'
        },
        {
          role: 'assistant',
          content: 'Entropy is a measure of impurity in decision trees.',
          timestamp: '2025-10-14T10:00:01.000Z'
        }
      ];

      const question: AIQuestion = {
        question: 'How is it calculated?',
        chapterTitle: 'Chapter 4',
        chapterContent: 'Content here...',
        conversationHistory
      };

      await aiService.askQuestion(question);

      const promptArg = mockGenerateContent.mock.calls[0][0];
      expect(promptArg).toContain('Previous Conversation');
      expect(promptArg).toContain('What is entropy?');
      expect(promptArg).toContain('Entropy is a measure of impurity');
      expect(promptArg).toContain('How is it calculated?');
    });

    test('should include system instructions in prompt', async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => 'Answer' }
      });

      const question: AIQuestion = {
        question: 'Test question'
      };

      await aiService.askQuestion(question);

      const promptArg = mockGenerateContent.mock.calls[0][0];
      expect(promptArg).toContain('helpful, knowledgeable tutor');
      expect(promptArg).toContain('audiobook');
      expect(promptArg).toContain('clear, educational explanations');
    });

    test('should handle API errors gracefully', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API rate limit exceeded'));

      const question: AIQuestion = {
        question: 'Test question'
      };

      await expect(aiService.askQuestion(question)).rejects.toThrow('AI service error: API rate limit exceeded');
    });

    test('should handle malformed API responses', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => {
            throw new Error('Unable to parse response');
          }
        }
      });

      const question: AIQuestion = {
        question: 'Test question'
      };

      await expect(aiService.askQuestion(question)).rejects.toThrow('AI service error');
    });

    test('should format conversation history with correct roles', async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => 'Answer' }
      });

      const conversationHistory: ConversationMessage[] = [
        { role: 'user', content: 'Question 1', timestamp: '2025-10-14T10:00:00.000Z' },
        { role: 'assistant', content: 'Answer 1', timestamp: '2025-10-14T10:00:01.000Z' }
      ];

      const question: AIQuestion = {
        question: 'Question 2',
        conversationHistory
      };

      await aiService.askQuestion(question);

      const promptArg = mockGenerateContent.mock.calls[0][0];
      expect(promptArg).toContain('**Student:** Question 1');
      expect(promptArg).toContain('**Tutor:** Answer 1');
    });
  });

  describe('summarizeChapter', () => {
    beforeEach(() => {
      aiService = new AIService('test-api-key');
    });

    test('should generate summary for chapter content', async () => {
      const mockSummary = 'This chapter covers decision trees, including how they work and when to use them.';
      mockGenerateContent.mockResolvedValue({
        response: { text: () => mockSummary }
      });

      const chapterTitle = 'Chapter 4: Decision Trees';
      const chapterContent = 'Decision trees are a machine learning algorithm that uses a tree structure...';

      const summary = await aiService.summarizeChapter(chapterTitle, chapterContent);

      expect(summary).toBe(mockSummary);
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    test('should include chapter title in prompt', async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => 'Summary' }
      });

      await aiService.summarizeChapter('Chapter 5: Random Forests', 'Content...');

      const promptArg = mockGenerateContent.mock.calls[0][0];
      expect(promptArg).toContain('**Chapter:** Chapter 5: Random Forests');
      expect(promptArg).toContain('Summarize the following chapter');
      expect(promptArg).toContain('2-3 concise paragraphs');
    });

    test('should handle empty content', async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => 'This chapter has no content.' }
      });

      const summary = await aiService.summarizeChapter('Empty Chapter', '');

      expect(summary).toBe('This chapter has no content.');
    });

    test('should handle API errors', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Network timeout'));

      await expect(
        aiService.summarizeChapter('Chapter', 'Content')
      ).rejects.toThrow('AI summarization error: Network timeout');
    });
  });

  describe('extractKeyConcepts', () => {
    beforeEach(() => {
      aiService = new AIService('test-api-key');
    });

    test('should extract concepts as array', async () => {
      const mockResponse = '- Decision Trees\n- Entropy\n- Gini Impurity\n- Overfitting\n- Pruning';
      mockGenerateContent.mockResolvedValue({
        response: { text: () => mockResponse }
      });

      const content = 'This chapter discusses decision trees, entropy, Gini impurity...';
      const concepts = await aiService.extractKeyConcepts(content);

      expect(concepts).toEqual([
        'Decision Trees',
        'Entropy',
        'Gini Impurity',
        'Overfitting',
        'Pruning'
      ]);
      expect(concepts).toHaveLength(5);
    });

    test('should parse bullet points with dashes correctly', async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => '- Concept 1\n- Concept 2\n- Concept 3' }
      });

      const concepts = await aiService.extractKeyConcepts('Content...');

      expect(concepts).toEqual(['Concept 1', 'Concept 2', 'Concept 3']);
    });

    test('should parse bullet points with asterisks correctly', async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => '* Concept A\n* Concept B\n* Concept C' }
      });

      const concepts = await aiService.extractKeyConcepts('Content...');

      expect(concepts).toEqual(['Concept A', 'Concept B', 'Concept C']);
    });

    test('should parse numbered lists correctly', async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => '1. First concept\n2. Second concept\n3. Third concept' }
      });

      const concepts = await aiService.extractKeyConcepts('Content...');

      expect(concepts).toEqual(['1. First concept', '2. Second concept', '3. Third concept']);
    });

    test('should filter out empty lines', async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => '- Concept 1\n\n\n- Concept 2\n\n- Concept 3\n\n' }
      });

      const concepts = await aiService.extractKeyConcepts('Content...');

      expect(concepts).toEqual(['Concept 1', 'Concept 2', 'Concept 3']);
      expect(concepts).toHaveLength(3);
    });

    test('should handle empty content', async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => 'No key concepts found.' }
      });

      const concepts = await aiService.extractKeyConcepts('');

      expect(concepts).toEqual(['No key concepts found.']);
    });

    test('should handle API errors', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Service unavailable'));

      await expect(
        aiService.extractKeyConcepts('Content')
      ).rejects.toThrow('AI concept extraction error: Service unavailable');
    });

    test('should include prompt instructions for 5-10 concepts', async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => '- Concept 1' }
      });

      await aiService.extractKeyConcepts('Content...');

      const promptArg = mockGenerateContent.mock.calls[0][0];
      expect(promptArg).toContain('5-10 most important concepts');
      expect(promptArg).toContain('simple list');
    });
  });

  describe('Edge Cases and Integration', () => {
    beforeEach(() => {
      aiService = new AIService('test-api-key');
    });

    test('should handle very long chapter content', async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => 'Summary of long content' }
      });

      const longContent = 'A'.repeat(50000); // 50KB of content
      const summary = await aiService.summarizeChapter('Long Chapter', longContent);

      expect(summary).toBe('Summary of long content');
      expect(mockGenerateContent).toHaveBeenCalled();
    });

    test('should handle special characters in questions', async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => 'Answer with special chars' }
      });

      const question: AIQuestion = {
        question: 'What is "entropy" & how does it work? (explain!)',
        chapterContent: 'Content...'
      };

      const response = await aiService.askQuestion(question);

      expect(response.answer).toBe('Answer with special chars');
      const promptArg = mockGenerateContent.mock.calls[0][0];
      expect(promptArg).toContain('What is "entropy" & how does it work? (explain!)');
    });

    test('should handle unicode characters', async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => 'Unicode response: 你好 🎉' }
      });

      const question: AIQuestion = {
        question: '机器学习是什么？',
        chapterContent: '机器学习内容...'
      };

      const response = await aiService.askQuestion(question);

      expect(response.answer).toContain('你好');
      expect(response.answer).toContain('🎉');
    });

    test('should handle multiple rapid calls', async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => 'Quick answer' }
      });

      const promises = Array(5).fill(null).map((_, i) => 
        aiService.askQuestion({
          question: `Question ${i}`,
          chapterContent: 'Content'
        })
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      expect(mockGenerateContent).toHaveBeenCalledTimes(5);
      results.forEach(result => {
        expect(result.answer).toBe('Quick answer');
        expect(result.timestamp).toBeDefined();
      });
    });
  });
});

