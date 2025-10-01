import { DocumentProcessor, ProcessingOptions } from '../../src/services/documentProcessor';
import { extractDocumentId, fetchDocumentWithChapters, fetchDocumentContent } from '../../src/services/documentFetcher';
import { AudioGenerator } from '../../src/services/audioGenerator';
import { FileManager } from '../../src/services/fileManager';

// Mock all dependencies
jest.mock('../../src/services/documentFetcher');
jest.mock('../../src/services/audioGenerator');
jest.mock('../../src/services/fileManager');

const mockExtractDocumentId = extractDocumentId as jest.MockedFunction<typeof extractDocumentId>;
const mockFetchDocumentWithChapters = fetchDocumentWithChapters as jest.MockedFunction<typeof fetchDocumentWithChapters>;
const mockFetchDocumentContent = fetchDocumentContent as jest.MockedFunction<typeof fetchDocumentContent>;
const MockAudioGenerator = AudioGenerator as jest.MockedClass<typeof AudioGenerator>;
const MockFileManager = FileManager as jest.MockedClass<typeof FileManager>;

describe('DocumentProcessor', () => {
  let documentProcessor: DocumentProcessor;
  let mockAudioGenerator: jest.Mocked<AudioGenerator>;
  let mockFileManager: jest.Mocked<FileManager>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create mock instances
    mockAudioGenerator = {
      generateChapterAudio: jest.fn(),
      generateAudio: jest.fn(),
      generateMultipleChapterAudio: jest.fn(),
      getAvailableVoices: jest.fn()
    } as any;

    mockFileManager = {
      ensureDirectoryExists: jest.fn(),
      checkAudioExists: jest.fn(),
      saveMetadata: jest.fn(),
      loadMetadata: jest.fn(),
      deleteAudio: jest.fn(),
      getFileInfo: jest.fn()
    } as any;

    // Mock constructors
    MockAudioGenerator.mockImplementation(() => mockAudioGenerator);
    MockFileManager.mockImplementation(() => mockFileManager);

    documentProcessor = new DocumentProcessor('./test-audio');
  });

  describe('processDocument', () => {
    test('should process document with chapters successfully', async () => {
      // Arrange
      const documentId = 'test-doc-123';
      const mockChapters = [
        {
          id: 'chapter-1',
          title: 'Chapter 1',
          content: 'This is chapter 1 content',
          startIndex: 0,
          endIndex: 25
        },
        {
          id: 'chapter-2',
          title: 'Chapter 2',
          content: 'This is chapter 2 content',
          startIndex: 26,
          endIndex: 50
        }
      ];

      const mockAudioFile1 = {
        filePath: './test-audio/chapter-1.mp3',
        fileName: 'chapter-1.mp3',
        size: 1024
      };

      const mockAudioFile2 = {
        filePath: './test-audio/chapter-2.mp3',
        fileName: 'chapter-2.mp3',
        size: 2048
      };

      mockExtractDocumentId.mockReturnValue(documentId);
      mockFetchDocumentWithChapters.mockResolvedValue(mockChapters);
      mockAudioGenerator.generateChapterAudio
        .mockResolvedValueOnce(mockAudioFile1)
        .mockResolvedValueOnce(mockAudioFile2);

      // Act
      const result = await documentProcessor.processDocument('https://docs.google.com/document/d/test-doc-123/edit');

      // Assert
      expect(result.success).toBe(true);
      expect(result.documentId).toBe(documentId);
      expect(result.totalChapters).toBe(2);
      expect(result.audioFiles).toHaveLength(2);
      expect(result.audioFiles[0]).toEqual({
        chapterId: 'chapter-1',
        chapterTitle: 'Chapter 1',
        fileName: 'chapter-1.mp3',
        filePath: './test-audio/chapter-1.mp3',
        size: 1024
      });
      expect(result.audioFiles[1]).toEqual({
        chapterId: 'chapter-2',
        chapterTitle: 'Chapter 2',
        fileName: 'chapter-2.mp3',
        filePath: './test-audio/chapter-2.mp3',
        size: 2048
      });
      expect(result.processingTime).toBeGreaterThanOrEqual(0);
      expect(result.error).toBeUndefined();

      // Verify method calls
      expect(mockExtractDocumentId).toHaveBeenCalledWith('https://docs.google.com/document/d/test-doc-123/edit');
      expect(mockFetchDocumentWithChapters).toHaveBeenCalledWith(documentId);
      expect(mockAudioGenerator.generateChapterAudio).toHaveBeenCalledTimes(2);
      expect(mockAudioGenerator.generateChapterAudio).toHaveBeenCalledWith('Chapter 1', 'This is chapter 1 content', 'chapter-1');
      expect(mockAudioGenerator.generateChapterAudio).toHaveBeenCalledWith('Chapter 2', 'This is chapter 2 content', 'chapter-2');
    });

    test('should handle document with no chapters by creating single chapter', async () => {
      // Arrange
      const documentId = 'test-doc-123';
      const rawContent = 'This is a continuous document without clear chapters.';
      
      mockExtractDocumentId.mockReturnValue(documentId);
      mockFetchDocumentWithChapters.mockResolvedValue([]); // No chapters detected
      mockFetchDocumentContent.mockResolvedValue(rawContent);
      
      const mockAudioFile = {
        filePath: './test-audio/full-document.mp3',
        fileName: 'full-document.mp3',
        size: 1024
      };
      mockAudioGenerator.generateChapterAudio.mockResolvedValue(mockAudioFile);

      // Act
      const result = await documentProcessor.processDocument(documentId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.totalChapters).toBe(1);
      expect(result.audioFiles).toHaveLength(1);
      expect(result.audioFiles[0].chapterId).toBe('full-document');
      expect(result.audioFiles[0].chapterTitle).toBe('Full Document');
      
      expect(mockFetchDocumentContent).toHaveBeenCalledWith(documentId);
      expect(mockAudioGenerator.generateChapterAudio).toHaveBeenCalledWith('Full Document', rawContent, 'full-document');
    });

    test('should return error for invalid document ID', async () => {
      // Arrange
      mockExtractDocumentId.mockReturnValue(null);

      // Act
      const result = await documentProcessor.processDocument('invalid-url');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid document ID or URL');
      expect(result.totalChapters).toBe(0);
      expect(result.audioFiles).toHaveLength(0);
    });

    test('should handle document not found error', async () => {
      // Arrange
      const documentId = 'nonexistent-doc';
      mockExtractDocumentId.mockReturnValue(documentId);
      mockFetchDocumentWithChapters.mockRejectedValue(new Error('Document not found'));

      // Act
      const result = await documentProcessor.processDocument(documentId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Document not found or access denied');
    });

    test('should handle permission denied error', async () => {
      // Arrange
      const documentId = 'private-doc';
      mockExtractDocumentId.mockReturnValue(documentId);
      mockFetchDocumentWithChapters.mockRejectedValue(new Error('permission denied'));

      // Act
      const result = await documentProcessor.processDocument(documentId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Permission denied - document may be private');
    });

    test('should handle rate limit error', async () => {
      // Arrange
      const documentId = 'rate-limited-doc';
      mockExtractDocumentId.mockReturnValue(documentId);
      mockFetchDocumentWithChapters.mockRejectedValue(new Error('rate limit exceeded'));

      // Act
      const result = await documentProcessor.processDocument(documentId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('API rate limit exceeded - please try again later');
    });

    test('should handle empty document', async () => {
      // Arrange
      const documentId = 'empty-doc';
      mockExtractDocumentId.mockReturnValue(documentId);
      mockFetchDocumentWithChapters.mockResolvedValue([]);
      mockFetchDocumentContent.mockResolvedValue(''); // Empty content

      // Act
      const result = await documentProcessor.processDocument(documentId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Document appears to be empty');
    });

    test('should handle TTS generation failure', async () => {
      // Arrange
      const documentId = 'test-doc-123';
      const mockChapters = [{
        id: 'chapter-1',
        title: 'Chapter 1',
        content: 'This is chapter 1 content',
        startIndex: 0,
        endIndex: 25
      }];

      mockExtractDocumentId.mockReturnValue(documentId);
      mockFetchDocumentWithChapters.mockResolvedValue(mockChapters);
      mockAudioGenerator.generateChapterAudio.mockRejectedValue(new Error('TTS generation failed'));

      // Act
      const result = await documentProcessor.processDocument(documentId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('TTS generation failed');
    });

    test('should handle generic fetch error', async () => {
      // Arrange
      const documentId = 'error-doc';
      mockExtractDocumentId.mockReturnValue(documentId);
      mockFetchDocumentWithChapters.mockRejectedValue(new Error('Generic API error'));

      // Act
      const result = await documentProcessor.processDocument(documentId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch document: Generic API error');
    });

    test('should handle non-Error objects in catch block', async () => {
      // Arrange
      const documentId = 'error-doc';
      mockExtractDocumentId.mockReturnValue(documentId);
      mockFetchDocumentWithChapters.mockRejectedValue('String error');

      // Act
      const result = await documentProcessor.processDocument(documentId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch document: String error');
    });

    test('should use custom output directory from constructor', () => {
      // Act
      const customProcessor = new DocumentProcessor('./custom-audio');

      // Assert
      expect(MockAudioGenerator).toHaveBeenCalledWith('./custom-audio');
      expect(MockFileManager).toHaveBeenCalledWith('./custom-audio');
    });

    test('should process with custom options', async () => {
      // Arrange
      const documentId = 'test-doc-123';
      const mockChapters = [{
        id: 'chapter-1',
        title: 'Chapter 1',
        content: 'This is chapter 1 content',
        startIndex: 0,
        endIndex: 25
      }];

      const options: ProcessingOptions = {
        outputDir: './custom-output',
        voice: {
          languageCode: 'en-GB',
          name: 'en-GB-Wavenet-A',
          ssmlGender: 'FEMALE'
        },
        audioConfig: {
          audioEncoding: 'OGG_OPUS',
          speakingRate: 1.2,
          pitch: 2.0,
          volumeGainDb: 1.5
        }
      };

      mockExtractDocumentId.mockReturnValue(documentId);
      mockFetchDocumentWithChapters.mockResolvedValue(mockChapters);
      mockAudioGenerator.generateChapterAudio.mockResolvedValue({
        filePath: './test-audio/chapter-1.mp3',
        fileName: 'chapter-1.mp3',
        size: 1024
      });

      // Act
      const result = await documentProcessor.processDocument(documentId, options);

      // Assert
      expect(result.success).toBe(true);
      // Note: The current implementation doesn't use the options parameter yet
      // This test ensures the method signature works correctly
    });

    test('should call progress callback with correct stages', async () => {
      // Arrange
      const documentId = 'test-doc-123';
      const mockChapters = [
        {
          id: 'chapter-1',
          title: 'Chapter 1',
          content: 'This is chapter 1 content',
          startIndex: 0,
          endIndex: 25
        },
        {
          id: 'chapter-2',
          title: 'Chapter 2',
          content: 'This is chapter 2 content',
          startIndex: 26,
          endIndex: 50
        }
      ];

      const progressCallback = jest.fn();
      const options: ProcessingOptions = {
        onProgress: progressCallback
      };

      mockExtractDocumentId.mockReturnValue(documentId);
      mockFetchDocumentWithChapters.mockResolvedValue(mockChapters);
      mockAudioGenerator.generateChapterAudio
        .mockResolvedValueOnce({
          filePath: './test-audio/chapter-1.mp3',
          fileName: 'chapter-1.mp3',
          size: 1024
        })
        .mockResolvedValueOnce({
          filePath: './test-audio/chapter-2.mp3',
          fileName: 'chapter-2.mp3',
          size: 2048
        });

      // Act
      const result = await documentProcessor.processDocument(documentId, options);

      // Assert
      expect(result.success).toBe(true);
      expect(progressCallback).toHaveBeenCalledTimes(6); // 6 progress reports total (including complete)

      // Check specific progress calls
      expect(progressCallback).toHaveBeenNthCalledWith(1, {
        stage: 'fetching',
        current: 1,
        total: 5,
        percentage: 20,
        message: 'Extracting document ID...'
      });

      expect(progressCallback).toHaveBeenNthCalledWith(2, {
        stage: 'fetching',
        current: 2,
        total: 5,
        percentage: 40,
        message: 'Fetching document content...'
      });

      expect(progressCallback).toHaveBeenNthCalledWith(3, {
        stage: 'detecting',
        current: 3,
        total: 5,
        percentage: 60,
        message: 'Detected 2 chapters'
      });

      expect(progressCallback).toHaveBeenNthCalledWith(4, {
        stage: 'generating',
        current: 1,
        total: 2,
        percentage: 50,
        message: 'Generating audio for: Chapter 1'
      });

      expect(progressCallback).toHaveBeenNthCalledWith(5, {
        stage: 'generating',
        current: 2,
        total: 2,
        percentage: 100,
        message: 'Generating audio for: Chapter 2'
      });

      expect(progressCallback).toHaveBeenNthCalledWith(6, {
        stage: 'complete',
        current: 2,
        total: 2,
        percentage: 100,
        message: 'Processing complete!'
      });
    });

    test('should call progress callback for single chapter document', async () => {
      // Arrange
      const documentId = 'test-doc-123';
      const rawContent = 'This is a continuous document without clear chapters.';
      const progressCallback = jest.fn();
      const options: ProcessingOptions = {
        onProgress: progressCallback
      };

      mockExtractDocumentId.mockReturnValue(documentId);
      mockFetchDocumentWithChapters.mockResolvedValue([]); // No chapters detected
      mockFetchDocumentContent.mockResolvedValue(rawContent);
      mockAudioGenerator.generateChapterAudio.mockResolvedValue({
        filePath: './test-audio/full-document.mp3',
        fileName: 'full-document.mp3',
        size: 1024
      });

      // Act
      const result = await documentProcessor.processDocument(documentId, options);

      // Assert
      expect(result.success).toBe(true);
      expect(progressCallback).toHaveBeenCalledWith({
        stage: 'detecting',
        current: 3,
        total: 5,
        percentage: 60,
        message: 'No chapters detected, creating single chapter...'
      });
    });

    test('should not call progress callback when not provided', async () => {
      // Arrange
      const documentId = 'test-doc-123';
      const mockChapters = [{
        id: 'chapter-1',
        title: 'Chapter 1',
        content: 'This is chapter 1 content',
        startIndex: 0,
        endIndex: 25
      }];

      mockExtractDocumentId.mockReturnValue(documentId);
      mockFetchDocumentWithChapters.mockResolvedValue(mockChapters);
      mockAudioGenerator.generateChapterAudio.mockResolvedValue({
        filePath: './test-audio/chapter-1.mp3',
        fileName: 'chapter-1.mp3',
        size: 1024
      });

      // Act - No progress callback provided
      const result = await documentProcessor.processDocument(documentId);

      // Assert
      expect(result.success).toBe(true);
      // No progress callback should be called, and no errors should occur
    });
  });
});
