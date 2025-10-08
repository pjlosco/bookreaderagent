import { Request, Response } from 'express';
import { DocumentProcessor, ProcessingOptions } from '../services/documentProcessor';
import path from 'path';
import fs from 'fs';

export class BookController {
  private documentProcessor: DocumentProcessor;
  private processingJobs: Map<string, any> = new Map();

  constructor() {
    this.documentProcessor = new DocumentProcessor('./audio');
  }

  async processDocument(req: Request, res: Response): Promise<void> {
    try {
      const { documentUrl, options = {} } = req.body;

      if (!documentUrl) {
        res.status(400).json({ 
          error: 'Bad Request',
          message: 'documentUrl is required' 
        });
        return;
      }

      // Generate a job ID for tracking
      const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store job info
      this.processingJobs.set(jobId, {
        status: 'processing',
        startTime: new Date(),
        documentUrl,
        progress: 0
      });

      // Set up progress tracking
      const progressOptions: ProcessingOptions = {
        ...options,
        onProgress: (progress) => {
          const job = this.processingJobs.get(jobId);
          if (job) {
            job.progress = progress.percentage;
            job.currentStage = progress.stage;
            job.message = progress.message;
          }
        }
      };

      // Process document asynchronously
      this.documentProcessor.processDocument(documentUrl, progressOptions)
        .then(result => {
          const job = this.processingJobs.get(jobId);
          if (job) {
            job.status = result.success ? 'completed' : 'failed';
            job.endTime = new Date();
            job.result = result;
          }
        })
        .catch(error => {
          const job = this.processingJobs.get(jobId);
          if (job) {
            job.status = 'failed';
            job.endTime = new Date();
            job.error = error.message;
          }
        });

      // Return job ID immediately
      res.json({
        jobId,
        status: 'processing',
        message: 'Document processing started'
      });

    } catch (error) {
      console.error('Error in processDocument:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getProcessingStatus(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;
      const job = this.processingJobs.get(jobId);

      if (!job) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Job not found'
        });
        return;
      }

      res.json({
        jobId,
        status: job.status,
        progress: job.progress || 0,
        currentStage: job.currentStage,
        message: job.message,
        startTime: job.startTime,
        endTime: job.endTime,
        result: job.result,
        error: job.error
      });

    } catch (error) {
      console.error('Error in getProcessingStatus:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getAllAudioFiles(req: Request, res: Response): Promise<void> {
    try {
      const audioDir = path.join(__dirname, '../../audio');
      
      if (!fs.existsSync(audioDir)) {
        res.json({ audioFiles: [] });
        return;
      }

      const files: Array<{
        filename: string;
        size: number;
        created: Date;
        url: string;
        documentId: string;
        chapterTitle?: string;
      }> = [];

      // Scan all subdirectories for audio files
      const subdirs = fs.readdirSync(audioDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      for (const subdir of subdirs) {
        const subdirPath = path.join(audioDir, subdir);
        const subdirFiles = fs.readdirSync(subdirPath)
          .filter(file => file.endsWith('.mp3'))
          .map(file => {
            const filePath = path.join(subdirPath, file);
            const stats = fs.statSync(filePath);
            return {
              filename: file,
              size: stats.size,
              created: stats.birthtime,
              url: `/audio/${subdir}/${file}`,
              documentId: subdir,
              chapterTitle: this.extractChapterTitleFromFilename(file)
            };
          });
        files.push(...subdirFiles);
      }

      // Also check for files in the root audio directory (legacy files)
      const rootFiles = fs.readdirSync(audioDir)
        .filter(file => file.endsWith('.mp3'))
        .map(file => {
          const filePath = path.join(audioDir, file);
          const stats = fs.statSync(filePath);
          return {
            filename: file,
            size: stats.size,
            created: stats.birthtime,
            url: `/audio/${file}`,
            documentId: 'legacy',
            chapterTitle: this.extractChapterTitleFromFilename(file)
          };
        });
      files.push(...rootFiles);

      // Sort by creation date (newest first)
      files.sort((a, b) => b.created.getTime() - a.created.getTime());

      res.json({ audioFiles: files });

    } catch (error) {
      console.error('Error in getAllAudioFiles:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private extractChapterTitleFromFilename(filename: string): string {
    // Extract chapter title from filename like "chapter-chapter-1-what-is-machine-learning.mp3"
    const withoutExt = filename.replace('.mp3', '');
    const parts = withoutExt.split('-');
    if (parts.length > 1) {
      return parts.slice(1).join(' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return filename;
  }

  async getAudioFiles(req: Request, res: Response): Promise<void> {
    try {
      const { documentId } = req.params;
      const audioDir = path.join(__dirname, '../../audio');
      
      if (!fs.existsSync(audioDir)) {
        res.json({ audioFiles: [] });
        return;
      }

      const files = fs.readdirSync(audioDir)
        .filter(file => file.endsWith('.mp3'))
        .map(file => {
          const filePath = path.join(audioDir, file);
          const stats = fs.statSync(filePath);
          return {
            filename: file,
            size: stats.size,
            created: stats.birthtime,
            url: `/audio/${file}`
          };
        });

      res.json({ audioFiles: files });

    } catch (error) {
      console.error('Error in getAudioFiles:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async downloadAudio(req: Request, res: Response): Promise<void> {
    try {
      const { filename } = req.params;
      const filePath = path.join(__dirname, '../../audio', filename);

      if (!fs.existsSync(filePath)) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Audio file not found'
        });
        return;
      }

      res.download(filePath, filename);

    } catch (error) {
      console.error('Error in downloadAudio:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async fetchChapters(req: Request, res: Response): Promise<void> {
    try {
      const { documentUrl } = req.body;

      if (!documentUrl) {
        res.status(400).json({ 
          error: 'Bad Request',
          message: 'documentUrl is required' 
        });
        return;
      }

      // Import the necessary functions
      const { extractDocumentId, fetchDocumentWithTabChapters } = await import('../services/documentFetcher');
      const { FileManager } = await import('../services/fileManager');

      const documentId = extractDocumentId(documentUrl);
      if (!documentId) {
        res.status(400).json({ 
          error: 'Bad Request',
          message: 'Invalid document URL or ID' 
        });
        return;
      }

      // Fetch chapters without generating audio
      const chapters = await fetchDocumentWithTabChapters(documentId);

        // Check which chapters already have audio files
      const fileManager = new FileManager('./audio');
      const metadata = fileManager.loadMetadata(documentId);
      
      const chaptersWithStatus = chapters.map(chapter => {
        const cleanFileName = this.createCleanFileName(chapter.title);
        const audioPath = path.join('./audio', documentId, `${cleanFileName}.mp3`);
        const hasAudio = fs.existsSync(audioPath);
        
        // Get content from metadata if available, otherwise use fetched content
        let content = chapter.content;
        if (metadata) {
          const metadataChapter = metadata.chapters.find(c => c.id === chapter.id);
          if (metadataChapter?.content) {
            content = metadataChapter.content;
          }
        }
        
        return {
          id: chapter.id,
          title: chapter.title,
          content: content,
          hasAudio,
          audioFile: hasAudio ? `${cleanFileName}.mp3` : null
        };
      });

      res.json({
        documentId,
        documentTitle: metadata?.documentTitle || chapters[0]?.title || 'Unknown Document',
        totalChapters: chapters.length,
        chapters: chaptersWithStatus,
        metadata: metadata || null
      });

    } catch (error) {
      console.error('Error in fetchChapters:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async generateChapterAudio(req: Request, res: Response): Promise<void> {
    try {
      const { documentId, chapterId, chapterTitle, chapterContent, voice, audioConfig } = req.body;

      if (!documentId || !chapterId || !chapterTitle || !chapterContent) {
        res.status(400).json({ 
          error: 'Bad Request',
          message: 'documentId, chapterId, chapterTitle, and chapterContent are required' 
        });
        return;
      }

      // Import AudioGenerator
      const { AudioGenerator } = await import('../services/audioGenerator');
      const audioGenerator = new AudioGenerator(path.join('./audio', documentId));

      // Prepare TTS options
      const ttsOptions: any = {};
      if (voice) {
        ttsOptions.voice = voice;
      }
      if (audioConfig) {
        ttsOptions.audioConfig = audioConfig;
      }

      // Generate audio for this chapter
      const audioFile = await audioGenerator.generateChapterAudio(
        chapterTitle,
        chapterContent,
        chapterId,
        ttsOptions
      );

      // Update metadata
      const { FileManager } = await import('../services/fileManager');
      const fileManager = new FileManager('./audio');
      const metadata = fileManager.loadMetadata(documentId);

      if (metadata) {
        // Check if chapter already exists in metadata
        const existingChapterIndex = metadata.chapters.findIndex(c => c.id === chapterId);
        if (existingChapterIndex >= 0) {
          // Update existing chapter, preserving content
          metadata.chapters[existingChapterIndex] = {
            id: chapterId,
            title: chapterTitle,
            fileName: audioFile.fileName,
            filePath: audioFile.filePath,
            size: audioFile.size,
            content: chapterContent // Save content for read-along feature
          };
        } else {
          // Add new chapter
          metadata.chapters.push({
            id: chapterId,
            title: chapterTitle,
            fileName: audioFile.fileName,
            filePath: audioFile.filePath,
            size: audioFile.size,
            content: chapterContent // Save content for read-along feature
          });
        }
        fileManager.saveMetadata(documentId, metadata);
      } else {
        // Create new metadata
        fileManager.saveMetadata(documentId, {
          documentId,
          documentTitle: chapterTitle,
          totalChapters: 1,
          generatedAt: new Date().toISOString(),
          chapters: [{
            id: chapterId,
            title: chapterTitle,
            fileName: audioFile.fileName,
            filePath: audioFile.filePath,
            size: audioFile.size,
            content: chapterContent // Save content for read-along feature
          }]
        });
      }

      res.json({
        success: true,
        audioFile: {
          chapterId,
          chapterTitle,
          fileName: audioFile.fileName,
          size: audioFile.size,
          url: `/audio/${documentId}/${audioFile.fileName}`
        }
      });

    } catch (error) {
      console.error('Error in generateChapterAudio:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async deleteChapterAudio(req: Request, res: Response): Promise<void> {
    try {
      const { documentId, chapterId } = req.params;

      if (!documentId || !chapterId) {
        res.status(400).json({ 
          error: 'Bad Request',
          message: 'documentId and chapterId are required' 
        });
        return;
      }

      const { FileManager } = await import('../services/fileManager');
      const fileManager = new FileManager('./audio');
      const metadata = fileManager.loadMetadata(documentId);

      if (!metadata) {
        res.status(404).json({ 
          error: 'Not Found',
          message: 'Document metadata not found' 
        });
        return;
      }

      // Find the chapter in metadata
      const chapter = metadata.chapters.find(c => c.id === chapterId);
      if (!chapter) {
        res.status(404).json({ 
          error: 'Not Found',
          message: 'Chapter not found' 
        });
        return;
      }

      // Delete the audio file
      const audioPath = path.join('./audio', documentId, chapter.fileName);
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }

      // Update metadata
      metadata.chapters = metadata.chapters.filter(c => c.id !== chapterId);
      fileManager.saveMetadata(documentId, metadata);

      res.json({
        success: true,
        message: 'Chapter audio deleted successfully'
      });

    } catch (error) {
      console.error('Error in deleteChapterAudio:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async listDocuments(req: Request, res: Response): Promise<void> {
    try {
      const audioBaseDir = './audio';
      
      if (!fs.existsSync(audioBaseDir)) {
        res.json({ documents: [] });
        return;
      }

      const documents = [];
      const dirs = fs.readdirSync(audioBaseDir).filter(file => {
        const filePath = path.join(audioBaseDir, file);
        return fs.statSync(filePath).isDirectory();
      });

      for (const dir of dirs) {
        const metadataPath = path.join(audioBaseDir, dir, 'metadata.json');
        if (fs.existsSync(metadataPath)) {
          try {
            const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
            documents.push({
              documentId: dir,
              documentTitle: metadata.documentTitle || 'Unknown Document',
              totalChapters: metadata.totalChapters || 0,
              generatedAt: metadata.generatedAt,
              chaptersWithAudio: metadata.chapters.length
            });
          } catch (error) {
            console.error(`Error reading metadata for ${dir}:`, error);
          }
        }
      }

      res.json({ documents });

    } catch (error) {
      console.error('Error in listDocuments:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private createCleanFileName(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 100);
  }
}
