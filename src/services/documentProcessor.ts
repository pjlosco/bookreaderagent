import { extractDocumentId, fetchDocumentContent, fetchDocumentWithChapters } from './documentFetcher';
import { Chapter } from './chapterDetector';
import { AudioGenerator, TTSOptions } from './audioGenerator';
import { FileManager } from './fileManager';

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
  }>;
  processingTime: number;
  success: boolean;
  error?: string;
}


export class DocumentProcessor {
  private audioGenerator: AudioGenerator;
  private fileManager: FileManager;

  constructor(outputDir: string = './audio') {
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

      // 2. Fetch document and detect chapters
      reportProgress('fetching', 2, 5, 'Fetching document content...');
      let chapters: Chapter[];
      try {
        chapters = await fetchDocumentWithChapters(documentId);
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

      // 3. Generate audio for each chapter
      const audioFiles = [];
      const totalChapters = chapters.length;
      
      for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        reportProgress('generating', i + 1, totalChapters, `Generating audio for: ${chapter.title}`);
        
        const audioFile = await this.audioGenerator.generateChapterAudio(
          chapter.title,
          chapter.content,
          chapter.id
        );
        
        audioFiles.push({
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          fileName: audioFile.fileName,
          filePath: audioFile.filePath,
          size: audioFile.size
        });
      }

      // 4. Return success result
      reportProgress('complete', totalChapters, totalChapters, 'Processing complete!');
      return {
        documentId,
        totalChapters: chapters.length,
        audioFiles,
        processingTime: Date.now() - startTime,
        success: true
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
}

  