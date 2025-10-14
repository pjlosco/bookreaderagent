import { Request, Response } from 'express';
import { AIService, ConversationMessage } from '../services/aiService';
import { FileManager } from '../services/fileManager';
import path from 'path';

/**
 * Controller for AI-powered Q&A features.
 * 
 * Endpoints:
 * - POST /api/ai/ask - Ask a question about chapter content
 * - POST /api/ai/summarize - Get chapter summary
 * - POST /api/ai/concepts - Extract key concepts from chapter
 * 
 * All endpoints require chapter context (documentId + chapterId) to provide
 * accurate, context-aware responses.
 */
export class AIController {
  private aiService: AIService | null = null;
  private fileManager: FileManager;
  private aiEnabled: boolean;

  constructor() {
    this.fileManager = new FileManager('./audio');
    
    // Check if AI features are enabled
    this.aiEnabled = !!process.env.GEMINI_API_KEY;
    
    // Only initialize AI service if API key is available
    if (this.aiEnabled) {
      try {
        this.aiService = new AIService();
      } catch (error) {
        console.warn('AI features disabled: GEMINI_API_KEY not configured');
        this.aiEnabled = false;
      }
    } else {
      console.log('AI features disabled: GEMINI_API_KEY not set in environment');
    }
  }

  /**
   * Check if AI service is available and return appropriate error if not
   */
  private checkAIAvailable(res: Response): boolean {
    if (!this.aiEnabled || !this.aiService) {
      res.status(503).json({
        error: 'Service Unavailable',
        message: 'AI features are not enabled. Please set GEMINI_API_KEY in your environment to use Q&A functionality.',
        hint: 'Visit https://makersuite.google.com/app/apikey to get your API key'
      });
      return false;
    }
    return true;
  }

  /**
   * Ask a question about chapter content.
   * 
   * Request body:
   * - question: string (required) - The user's question
   * - documentId: string (required) - ID of the document
   * - chapterId: string (required) - ID of the current chapter
   * - conversationHistory: ConversationMessage[] (optional) - Previous messages
   * 
   * Response:
   * - answer: string - AI-generated answer
   * - chapterTitle: string - Title of the chapter used for context
   * - timestamp: string - When the answer was generated
   * 
   * Example:
   * POST /api/ai/ask
   * {
   *   "question": "What is gradient descent?",
   *   "documentId": "1GWShQ74...",
   *   "chapterId": "chapter-7"
   * }
   */
  async askQuestion(req: Request, res: Response): Promise<void> {
    try {
      // Check if AI features are available
      if (!this.checkAIAvailable(res)) {
        return;
      }

      const { question, documentId, chapterId, conversationHistory } = req.body;

      // Validate required fields
      if (!question || !documentId || !chapterId) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'question, documentId, and chapterId are required'
        });
        return;
      }

      // Load chapter content from metadata
      const metadata = this.fileManager.loadMetadata(documentId);
      
      if (!metadata) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Document not found'
        });
        return;
      }

      // Find the specific chapter
      const chapter = metadata.chapters.find(ch => ch.id === chapterId);
      
      if (!chapter) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Chapter not found'
        });
        return;
      }

      if (!chapter.content) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Chapter content not available. Generate audio first to cache content.'
        });
        return;
      }

      // Ask the AI (we know aiService is not null due to checkAIAvailable)
      const response = await this.aiService!.askQuestion({
        question,
        chapterTitle: chapter.title,
        chapterContent: chapter.content,
        conversationHistory
      });

      res.json({
        success: true,
        answer: response.answer,
        chapterTitle: chapter.title,
        timestamp: response.timestamp
      });

    } catch (error) {
      console.error('Error in askQuestion:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get a summary of a chapter.
   * 
   * Useful for:
   * - Quick overview before listening
   * - Reviewing content after listening
   * - Deciding which chapters to prioritize
   * 
   * Request body:
   * - documentId: string (required)
   * - chapterId: string (required)
   */
  async summarizeChapter(req: Request, res: Response): Promise<void> {
    try {
      // Check if AI features are available
      if (!this.checkAIAvailable(res)) {
        return;
      }

      const { documentId, chapterId } = req.body;

      if (!documentId || !chapterId) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'documentId and chapterId are required'
        });
        return;
      }

      // Load chapter content
      const metadata = this.fileManager.loadMetadata(documentId);
      
      if (!metadata) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Document not found'
        });
        return;
      }

      const chapter = metadata.chapters.find(ch => ch.id === chapterId);
      
      if (!chapter || !chapter.content) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Chapter content not found'
        });
        return;
      }

      // Generate summary (we know aiService is not null due to checkAIAvailable)
      const summary = await this.aiService!.summarizeChapter(
        chapter.title,
        chapter.content
      );

      res.json({
        success: true,
        summary,
        chapterTitle: chapter.title,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in summarizeChapter:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Extract key concepts from a chapter.
   * 
   * Returns a list of main topics, terms, and ideas for:
   * - Study guides
   * - Quick reference
   * - Navigation aids
   */
  async extractConcepts(req: Request, res: Response): Promise<void> {
    try {
      // Check if AI features are available
      if (!this.checkAIAvailable(res)) {
        return;
      }

      const { documentId, chapterId } = req.body;

      if (!documentId || !chapterId) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'documentId and chapterId are required'
        });
        return;
      }

      const metadata = this.fileManager.loadMetadata(documentId);
      
      if (!metadata) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Document not found'
        });
        return;
      }

      const chapter = metadata.chapters.find(ch => ch.id === chapterId);
      
      if (!chapter || !chapter.content) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Chapter content not found'
        });
        return;
      }

      const concepts = await this.aiService!.extractKeyConcepts(chapter.content);

      res.json({
        success: true,
        concepts,
        chapterTitle: chapter.title,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in extractConcepts:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

