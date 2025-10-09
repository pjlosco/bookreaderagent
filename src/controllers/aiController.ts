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
  private aiService: AIService;
  private fileManager: FileManager;

  constructor() {
    this.aiService = new AIService();
    this.fileManager = new FileManager('./audio');
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

      // Ask the AI
      const response = await this.aiService.askQuestion({
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

      // Generate summary
      const summary = await this.aiService.summarizeChapter(
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

      const concepts = await this.aiService.extractKeyConcepts(chapter.content);

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

