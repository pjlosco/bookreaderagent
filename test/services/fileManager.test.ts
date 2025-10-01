import { FileManager, AudioMetadata } from '../../src/services/fileManager';
import fs from 'fs';
import path from 'path';

describe('FileManager', () => {
  let fileManager: FileManager;
  const testBaseDir = './test-audio';

  beforeEach(() => {
    fileManager = new FileManager(testBaseDir);
  });

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(testBaseDir)) {
      fs.rmSync(testBaseDir, { recursive: true, force: true });
    }
  });

  test('should create base directory on initialization', () => {
    expect(fs.existsSync(testBaseDir)).toBe(true);
  });

  test('should get document audio directory path', () => {
    const docId = 'test-doc-123';
    const expectedPath = path.join(testBaseDir, docId);
    const result = fileManager.getDocumentAudioDir(docId);
    expect(result).toBe(expectedPath);
  });

  test('should ensure document directory exists', () => {
    const docId = 'test-doc-123';
    const docDir = fileManager.ensureDocumentDir(docId);
    
    expect(fs.existsSync(docDir)).toBe(true);
    expect(docDir).toContain(docId);
  });

  test('should detect existing audio files', () => {
    const docId = 'test-doc-123';
    const docDir = fileManager.ensureDocumentDir(docId);
    
    // Create a mock audio file
    fs.writeFileSync(path.join(docDir, 'chapter-1.mp3'), 'mock audio data');
    
    expect(fileManager.hasExistingAudio(docId)).toBe(true);
  });

  test('should return false for non-existing audio', () => {
    const docId = 'non-existing-doc';
    expect(fileManager.hasExistingAudio(docId)).toBe(false);
  });

  test('should get existing audio files', () => {
    const docId = 'test-doc-123';
    const docDir = fileManager.ensureDocumentDir(docId);
    
    // Create mock audio files
    fs.writeFileSync(path.join(docDir, 'chapter-1.mp3'), 'mock audio data');
    fs.writeFileSync(path.join(docDir, 'chapter-2.mp3'), 'mock audio data');
    fs.writeFileSync(path.join(docDir, 'metadata.json'), '{}');
    
    const audioFiles = fileManager.getExistingAudioFiles(docId);
    
    expect(audioFiles).toHaveLength(2);
    expect(audioFiles).toContain('chapter-1.mp3');
    expect(audioFiles).toContain('chapter-2.mp3');
  });

  test('should return empty array for non-existing directory', () => {
    const docId = 'non-existing-doc';
    const audioFiles = fileManager.getExistingAudioFiles(docId);
    expect(audioFiles).toEqual([]);
  });

  test('should save and load metadata', () => {
    const docId = 'test-doc-123';
    const metadata: AudioMetadata = {
      documentId: docId,
      documentTitle: 'Test Document',
      totalChapters: 2,
      generatedAt: new Date().toISOString(),
      chapters: [
        {
          id: '1',
          title: 'Chapter 1',
          fileName: 'chapter-1.mp3',
          filePath: '/path/to/chapter-1.mp3',
          size: 1024
        }
      ]
    };
    
    fileManager.saveMetadata(docId, metadata);
    const loadedMetadata = fileManager.loadMetadata(docId);
    
    expect(loadedMetadata).toEqual(metadata);
  });

  test('should return null for non-existing metadata', () => {
    const docId = 'non-existing-doc';
    const metadata = fileManager.loadMetadata(docId);
    expect(metadata).toBeNull();
  });

  test('should handle metadata loading errors gracefully', () => {
    const docId = 'test-doc-123';
    const docDir = fileManager.ensureDocumentDir(docId);
    
    // Create invalid JSON file
    fs.writeFileSync(path.join(docDir, 'metadata.json'), 'invalid json');
    
    const metadata = fileManager.loadMetadata(docId);
    expect(metadata).toBeNull();
  });

  test('should delete document audio', () => {
    const docId = 'test-doc-123';
    const docDir = fileManager.ensureDocumentDir(docId);
    
    // Create some files
    fs.writeFileSync(path.join(docDir, 'chapter-1.mp3'), 'mock audio data');
    fs.writeFileSync(path.join(docDir, 'metadata.json'), '{}');
    
    expect(fs.existsSync(docDir)).toBe(true);
    
    const result = fileManager.deleteDocumentAudio(docId);
    
    expect(result).toBe(true);
    expect(fs.existsSync(docDir)).toBe(false);
  });

  test('should return false when deleting non-existing audio', () => {
    const docId = 'non-existing-doc';
    const result = fileManager.deleteDocumentAudio(docId);
    expect(result).toBe(false);
  });

  test('should get audio file info for existing file', () => {
    const docId = 'test-doc-123';
    const chapterId = '1';
    const docDir = fileManager.ensureDocumentDir(docId);
    const filePath = path.join(docDir, 'chapter-1.mp3');
    
    // Create mock audio file
    fs.writeFileSync(filePath, 'mock audio data');
    
    const info = fileManager.getAudioFileInfo(docId, chapterId);
    
    expect(info.exists).toBe(true);
    expect(info.filePath).toBe(filePath);
    expect(info.size).toBeGreaterThan(0);
  });

  test('should get audio file info for non-existing file', () => {
    const docId = 'test-doc-123';
    const chapterId = '1';
    const docDir = fileManager.ensureDocumentDir(docId);
    const expectedPath = path.join(docDir, 'chapter-1.mp3');
    
    const info = fileManager.getAudioFileInfo(docId, chapterId);
    
    expect(info.exists).toBe(false);
    expect(info.filePath).toBe(expectedPath);
    expect(info.size).toBeUndefined();
  });
});

