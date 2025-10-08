import { extractDocumentId, fetchDocumentContent, fetchDocumentWithChapters, fetchDocumentWithTabChapters } from './documentFetcher';
import { Chapter } from './chapterDetector';
import { AudioGenerator, TTSOptions, AudioFile } from './audioGenerator';
import { FileManager } from './fileManager';
import { CostEstimator, CostEstimate } from '../utils/costEstimator';
import { TextCleaner } from '../utils/textCleaner';
import path from 'path';
import fs from 'fs';

export interface ProgressCallback {
    (progress: {
      stage: 'fetching' | 'detecting' | 'generating' | 'complete';
      current: number;
      total: number;
      percentage: number;
      message: string;
    }): void;
  }
  
  export interface ProcessingOptions {
    outputDir?: string;
    onProgress?: ProgressCallback;
    forceRegenerate?: boolean;  // If true, regenerate audio even if files exist
    voice?: {
      languageCode: string;
      name: string;
      ssmlGender: 'NEUTRAL' | 'MALE' | 'FEMALE';
    };
    audioConfig?: {
      audioEncoding: 'MP3' | 'LINEAR16' | 'OGG_OPUS';
      speakingRate?: number;
      pitch?: number;
      volumeGainDb?: number;
    };
  }

export interface ProcessingResult {
  documentId: string;
  totalChapters: number;
  audioFiles: Array<{
    chapterId: string;
    chapterTitle: string;
    fileName: string;
    filePath: string;
    size: number;
    url: string;
    content: string;
  }>;
  processingTime: number;
  success: boolean;
  error?: string;
  costEstimate?: CostEstimate;
}


export class DocumentProcessor {
  private audioGenerator: AudioGenerator;
  private fileManager: FileManager;
  private baseOutputDir: string;

  constructor(outputDir: string = './audio') {
    this.baseOutputDir = outputDir;
    this.audioGenerator = new AudioGenerator(outputDir);
    this.fileManager = new FileManager(outputDir);
  }
  
  async processDocument(
    documentInput: string, 
    options: ProcessingOptions = {}
  ): Promise<ProcessingResult> {
    const startTime = Date.now();
    const { onProgress } = options;
    
    // Helper function to report progress
    const reportProgress = (stage: 'fetching' | 'detecting' | 'generating' | 'complete', current: number, total: number, message: string) => {
      if (onProgress) {
        const percentage = Math.round((current / total) * 100);
        onProgress({ stage, current, total, percentage, message });
      }
    };
    
    try {
      // 1. Extract document ID from input
      reportProgress('fetching', 1, 5, 'Extracting document ID...');
      const documentId = extractDocumentId(documentInput);
      if (!documentId) {
        throw new Error('Invalid document ID or URL');
      }

      // Create document-specific output directory
      const documentOutputDir = path.join(this.baseOutputDir, documentId);
      this.audioGenerator = new AudioGenerator(documentOutputDir);
      this.fileManager = new FileManager(documentOutputDir);

      // 2. Fetch document and detect chapters (use tab-based detection)
      reportProgress('fetching', 2, 5, 'Fetching document content...');
      let chapters: Chapter[];
      try {
        // Try tab-based chapter detection first
        chapters = await fetchDocumentWithTabChapters(documentId);
        
        // Fallback to content-based detection if no tabs found
        if (chapters.length === 0) {
          chapters = await fetchDocumentWithChapters(documentId);
        }
      } catch (error) {
        // Handle specific document fetching errors
        if (error instanceof Error) {
          if (error.message.includes('not found') || error.message.includes('404')) {
            throw new Error('Document not found or access denied');
          } else if (error.message.includes('permission') || error.message.includes('403')) {
            throw new Error('Permission denied - document may be private');
          } else if (error.message.includes('rate limit') || error.message.includes('429')) {
            throw new Error('API rate limit exceeded - please try again later');
          }
        }
        throw new Error(`Failed to fetch document: ${error instanceof Error ? error.message : String(error)}`);
      }

      // Handle documents with no detected chapters (single continuous text)
      if (chapters.length === 0) {
        reportProgress('detecting', 3, 5, 'No chapters detected, creating single chapter...');
        // Fetch just the raw content to create a single "chapter"
        const rawContent = await fetchDocumentContent(documentId);
        if (!rawContent || rawContent.trim().length === 0) {
          throw new Error('Document appears to be empty');
        }
        
        // Create a single chapter for the entire document
        chapters = [{
          id: 'full-document',
          title: 'Full Document',
          content: rawContent,
          startIndex: 0,
          endIndex: rawContent.length
        }];
      } else {
        reportProgress('detecting', 3, 5, `Detected ${chapters.length} chapters`);
      }

      // 3. Check for existing audio and load metadata
      const existingMetadata = this.fileManager.loadMetadata(documentId);
      const shouldRegenerate = options.forceRegenerate || !existingMetadata;
      
      // 4. Generate audio for each chapter (already cleaned by tab detector)
      const totalChapters = chapters.length;
      const audioFiles = [];
      
      for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        
        // Check if audio file already exists for this chapter
        const cleanFileName = this.createCleanFileName(chapter.title);
        const expectedFilePath = path.join(this.audioGenerator['outputDir'], `${cleanFileName}.mp3`);
        
        let audioFile: AudioFile;
        
        if (!shouldRegenerate && fs.existsSync(expectedFilePath)) {
          // Reuse existing audio file
          reportProgress('generating', i + 1, totalChapters, `Using existing audio for: ${chapter.title}`);
          const stats = fs.statSync(expectedFilePath);
          audioFile = {
            fileName: `${cleanFileName}.mp3`,
            filePath: expectedFilePath,
            size: stats.size
          };
          console.log(`Reusing existing audio: ${cleanFileName}.mp3`);
        } else {
          // Generate new audio
          reportProgress('generating', i + 1, totalChapters, `Generating audio for: ${chapter.title}`);
          
          // Prepare TTS options from processing options
          const ttsOptions: TTSOptions = {};
          if (options.voice) {
            ttsOptions.voice = options.voice;
          }
          if (options.audioConfig) {
            ttsOptions.audioConfig = options.audioConfig;
          }
          
          audioFile = await this.audioGenerator.generateChapterAudio(
            chapter.title,
            chapter.content,
            chapter.id,
            ttsOptions
          );
          console.log(`Generated new audio: ${audioFile.fileName}`);
        }
        
        audioFiles.push({
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          fileName: audioFile.fileName,
          filePath: audioFile.filePath,
          size: audioFile.size,
          url: `/audio/${documentId}/${audioFile.fileName}`,
          content: chapter.content
        });
      }

      // 4. Calculate cost estimate
      const totalText = chapters.reduce((acc, chapter) => acc + chapter.content.length, 0);
      const costEstimate = CostEstimator.estimateCost(
        'x'.repeat(totalText), // Use character count for estimation
        options.voice?.name || 'en-GB-Neural2-A'
      );

      // 5. Save metadata for future reuse
      this.fileManager.saveMetadata(documentId, {
        documentId,
        documentTitle: chapters[0]?.title || 'Unknown',
        totalChapters: chapters.length,
        generatedAt: new Date().toISOString(),
        chapters: audioFiles.map(af => ({
          id: af.chapterId,
          title: af.chapterTitle,
          fileName: af.fileName,
          filePath: af.filePath,
          size: af.size
        }))
      });

      // 6. Return success result
      reportProgress('complete', totalChapters, totalChapters, 'Processing complete!');
      return {
        documentId,
        totalChapters: chapters.length,
        audioFiles,
        processingTime: Date.now() - startTime,
        success: true,
        costEstimate
      };

    } catch (error) {
      return {
        documentId: documentInput,
        totalChapters: 0,
        audioFiles: [],
        processingTime: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private createCleanFileName(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .substring(0, 100); // Limit length
  }
}

  