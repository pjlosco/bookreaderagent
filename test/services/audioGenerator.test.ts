import { AudioGenerator } from '../../src/services/audioGenerator';
import fs from 'fs';
import path from 'path';

// Mock the Google Cloud TTS client
jest.mock('@google-cloud/text-to-speech', () => ({
  TextToSpeechClient: jest.fn().mockImplementation(() => ({
    synthesizeSpeech: jest.fn().mockResolvedValue([{
      audioContent: Buffer.from('mock-audio-data')
    }]),
    listVoices: jest.fn().mockResolvedValue([{
      name: 'en-US-Wavenet-D',
      languageCode: 'en-US',
      ssmlGender: 'NEUTRAL'
    }])
  }))
}));

describe('AudioGenerator', () => {
  let audioGenerator: AudioGenerator;
  const testOutputDir = './test-audio';

  beforeEach(() => {
    audioGenerator = new AudioGenerator(testOutputDir);
  });

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true, force: true });
    }
  });

  test('should generate audio file', async () => {
    const text = 'Hello, this is a test.';
    const fileName = 'test-audio';
    
    const result = await audioGenerator.generateAudio(text, fileName);
    
    expect(result.fileName).toBe('test-audio.mp3');
    expect(result.filePath).toContain('test-audio.mp3');
    expect(result.size).toBeGreaterThan(0);
    expect(fs.existsSync(result.filePath)).toBe(true);
  });

  test('should generate multiple chapter audio', async () => {
    const chapters = [
      { id: '1', title: 'Chapter 1', content: 'Content 1' },
      { id: '2', title: 'Chapter 2', content: 'Content 2' }
    ];
    
    const results = await audioGenerator.generateMultipleChapterAudio(chapters);
    
    expect(results).toHaveLength(2);
    expect(results[0].fileName).toBe('chapter-1.mp3');
    expect(results[1].fileName).toBe('chapter-2.mp3');
  });
  
  test('should get available voices', async () => {
    const voices = await audioGenerator.getAvailableVoices('en-US');
    
    expect(Array.isArray(voices)).toBe(true);
    
    // In test environment, we might not have access to real voices
    if (voices.length > 0) {
      expect(voices[0]).toHaveProperty('name');
      expect(voices[0]).toHaveProperty('languageCode');
    }
  });

  test('should handle empty text', async () => {
    const text = '';
    const fileName = 'empty-test';
    
    // Empty text should still generate a file (Google TTS accepts it)
    const result = await audioGenerator.generateAudio(text, fileName);
    expect(result.fileName).toBe('empty-test.mp3');
    expect(result.size).toBeGreaterThan(0);
  });

  test('should handle TTS service errors', async () => {
    // Mock the client to throw an error
    const mockClient = {
      synthesizeSpeech: jest.fn().mockRejectedValue(new Error('TTS API Error'))
    };
    
    const audioGeneratorWithError = new AudioGenerator('./test-audio');
    (audioGeneratorWithError as any).client = mockClient;
    
    await expect(audioGeneratorWithError.generateAudio('test', 'error-test')).rejects.toThrow('TTS generation failed');
  });

});

