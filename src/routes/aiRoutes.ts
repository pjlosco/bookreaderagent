import { Router } from 'express';
import { AIController } from '../controllers/aiController';

const router = Router();
const aiController = new AIController();

/**
 * AI-powered Q&A routes for interactive learning.
 * 
 * Base path: /api/ai
 * 
 * Endpoints:
 * - POST /ask - Ask a question about chapter content
 * - POST /summarize - Get chapter summary
 * - POST /concepts - Extract key concepts
 */

// Ask a question about chapter content
router.post('/ask', aiController.askQuestion.bind(aiController));

// Get a summary of a chapter
router.post('/summarize', aiController.summarizeChapter.bind(aiController));

// Extract key concepts from a chapter
router.post('/concepts', aiController.extractConcepts.bind(aiController));

export { router as aiRoutes };

