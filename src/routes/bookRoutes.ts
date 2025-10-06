import { Router } from 'express';
import { BookController } from '../controllers/bookController';

const router = Router();
const bookController = new BookController();

// Process document endpoint
router.post('/process', bookController.processDocument.bind(bookController));

// Fetch chapters without generating audio
router.post('/fetch-chapters', bookController.fetchChapters.bind(bookController));

// Generate individual chapter audio
router.post('/generate-chapter', bookController.generateChapterAudio.bind(bookController));

// Delete individual chapter audio
router.delete('/audio/:documentId/:chapterId', bookController.deleteChapterAudio.bind(bookController));

// Get processing status endpoint
router.get('/status/:jobId', bookController.getProcessingStatus.bind(bookController));

// List all processed documents
router.get('/documents', bookController.listDocuments.bind(bookController));

// Download specific audio file (must come before /audio)
router.get('/audio/:filename', bookController.downloadAudio.bind(bookController));

// Get all audio files
router.get('/audio', bookController.getAllAudioFiles.bind(bookController));

// Get generated audio files for a document
router.get('/:documentId/audio', bookController.getAudioFiles.bind(bookController));

export { router as bookRoutes };
