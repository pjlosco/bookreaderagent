import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIQuestion {
  question: string;
  chapterTitle?: string;
  chapterContent?: string;
  conversationHistory?: ConversationMessage[];
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AIResponse {
  answer: string;
  sources?: string[];
  timestamp: string;
}

/**
 * AI Service for interactive Q&A about document content.
 * 
 * Uses Google Gemini Pro for cost-effective, high-quality responses.
 * Pricing: ~$0.002 per question (significantly cheaper than GPT-4)
 * 
 * Features:
 * - Context-aware responses using chapter content
 * - Conversation history support
 * - Streaming responses (future enhancement)
 * - Source citation from chapter text
 * 
 * Example usage:
 * ```typescript
 * const aiService = new AIService();
 * const response = await aiService.askQuestion({
 *   question: "What is gradient descent?",
 *   chapterTitle: "Introduction to Neural Networks",
 *   chapterContent: "Gradient descent is..."
 * });
 * ```
 */
export class AIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY;
    
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is required for AI features');
    }

    this.genAI = new GoogleGenerativeAI(key);
    // Use Gemini Pro for best balance of quality and cost
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  /**
   * Ask a question about document content with full context awareness.
   * 
   * The AI receives:
   * - The user's question
   * - The current chapter title and full content
   * - Previous conversation history (for follow-up questions)
   * 
   * System prompt instructs the AI to:
   * - Act as a helpful tutor
   * - Use the chapter content as primary source
   * - Provide clear, educational explanations
   * - Cite specific parts when relevant
   * 
   * @param questionData - Question with chapter context and history
   * @returns AI-generated answer with metadata
   * 
   * Example:
   * - Question: "What's the difference between Gini and Entropy?"
   * - Context: Chapter 4 content about decision trees
   * - Response: Explanation based on chapter's specific definitions
   */
  async askQuestion(questionData: AIQuestion): Promise<AIResponse> {
    try {
      const { question, chapterTitle, chapterContent, conversationHistory = [] } = questionData;

      // Build context-aware prompt
      let prompt = this.buildPrompt(question, chapterTitle, chapterContent, conversationHistory);

      // Generate response
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const answer = response.text();

      return {
        answer,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      throw new Error(`AI service error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Build a comprehensive prompt with chapter context and conversation history.
   * 
   * Structure:
   * 1. System instructions (role, tone, constraints)
   * 2. Chapter context (title + content)
   * 3. Conversation history (if any)
   * 4. Current question
   * 
   * @private
   */
  private buildPrompt(
    question: string,
    chapterTitle?: string,
    chapterContent?: string,
    conversationHistory?: ConversationMessage[]
  ): string {
    let prompt = '';

    // System instructions
    prompt += `You are a helpful, knowledgeable tutor assisting a student who is listening to an audiobook. `;
    prompt += `Your role is to answer questions about the content they're currently studying. `;
    prompt += `Provide clear, educational explanations. Keep responses concise but thorough.\n\n`;

    // Add chapter context if available
    if (chapterTitle && chapterContent) {
      prompt += `# Current Chapter Context\n\n`;
      prompt += `**Chapter:** ${chapterTitle}\n\n`;
      prompt += `**Content:**\n${chapterContent}\n\n`;
      prompt += `Please base your answer primarily on this chapter's content. `;
      prompt += `If the chapter doesn't contain the answer, you can provide general knowledge but note that.\n\n`;
    }

    // Add conversation history if exists
    if (conversationHistory && conversationHistory.length > 0) {
      prompt += `# Previous Conversation\n\n`;
      conversationHistory.forEach((msg) => {
        const role = msg.role === 'user' ? 'Student' : 'Tutor';
        prompt += `**${role}:** ${msg.content}\n\n`;
      });
    }

    // Add current question
    prompt += `# Current Question\n\n`;
    prompt += `**Student:** ${question}\n\n`;
    prompt += `**Tutor:**`;

    return prompt;
  }

  /**
   * Summarize a chapter for quick understanding.
   * 
   * Useful for providing chapter overviews or helping users decide
   * which chapters to listen to.
   * 
   * @param chapterTitle - Title of the chapter
   * @param chapterContent - Full chapter text
   * @returns Concise summary (2-3 paragraphs)
   */
  async summarizeChapter(chapterTitle: string, chapterContent: string): Promise<string> {
    try {
      const prompt = `Summarize the following chapter in 2-3 concise paragraphs. Focus on the key concepts and main takeaways.\n\n` +
                     `**Chapter:** ${chapterTitle}\n\n` +
                     `**Content:**\n${chapterContent}\n\n` +
                     `**Summary:**`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();

    } catch (error) {
      throw new Error(`AI summarization error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Extract key concepts from a chapter.
   * 
   * Identifies main topics, terms, and ideas for study guides or navigation.
   * 
   * @param chapterContent - Full chapter text
   * @returns Array of key concepts
   */
  async extractKeyConcepts(chapterContent: string): Promise<string[]> {
    try {
      const prompt = `Extract the 5-10 most important concepts, terms, or ideas from this text. ` +
                     `Return them as a simple list, one per line.\n\n` +
                     `${chapterContent}\n\n` +
                     `**Key Concepts:**`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse the response into an array
      return text
        .split('\n')
        .map((line: string) => line.replace(/^[-*•]\s*/, '').trim())
        .filter((line: string) => line.length > 0);

    } catch (error) {
      throw new Error(`AI concept extraction error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

