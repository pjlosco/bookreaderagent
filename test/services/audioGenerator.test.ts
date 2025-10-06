import { AudioGenerator } from '../../src/services/audioGenerator';

// Mock the Google Cloud TTS client
jest.mock('@google-cloud/text-to-speech', () => ({
  TextToSpeechClient: jest.fn().mockImplementation(() => ({
    synthesizeSpeech: jest.fn().mockResolvedValue([{
      audioContent: Buffer.from('fake-audio-data')
    }]),
    listVoices: jest.fn().mockResolvedValue([{
      voices: [
        { name: 'en-US-Standard-A', languageCodes: ['en-US'] },
        { name: 'en-US-Standard-B', languageCodes: ['en-US'] }
      ]
    }])
  }))
}));

// Mock fs module
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined),
    writeFile: jest.fn().mockResolvedValue(undefined)
  },
  existsSync: jest.fn().mockReturnValue(true)
}));

describe('AudioGenerator', () => {
  let audioGenerator: AudioGenerator;

  beforeEach(() => {
    audioGenerator = new AudioGenerator('/test/output');
  });

  describe('createCleanFileName', () => {
    it('should create clean filenames from chapter titles', () => {
      // Access private method for testing
      const createCleanFileName = (audioGenerator as any).createCleanFileName.bind(audioGenerator);

      expect(createCleanFileName('Chapter 1: What is Machine Learning?')).toBe('chapter-1-what-is-machine-learning');
      expect(createCleanFileName('Key Concepts')).toBe('key-concepts');
      expect(createCleanFileName('Conclusion')).toBe('conclusion');
      expect(createCleanFileName('Chapter 2: Common Algorithms')).toBe('chapter-2-common-algorithms');
    });

    it('should handle special characters', () => {
      const createCleanFileName = (audioGenerator as any).createCleanFileName.bind(audioGenerator);

      expect(createCleanFileName('Chapter 1: "What is Machine Learning?"')).toBe('chapter-1-what-is-machine-learning');
      expect(createCleanFileName('Key Concepts & Applications')).toBe('key-concepts-applications');
      expect(createCleanFileName('Chapter 3: Applications (Part 1)')).toBe('chapter-3-applications-part-1');
    });

    it('should handle multiple spaces and hyphens', () => {
      const createCleanFileName = (audioGenerator as any).createCleanFileName.bind(audioGenerator);

      expect(createCleanFileName('Chapter   1:  What  is  Machine  Learning')).toBe('chapter-1-what-is-machine-learning');
      expect(createCleanFileName('Key---Concepts')).toBe('key-concepts');
      expect(createCleanFileName('-Key Concepts-')).toBe('key-concepts');
    });

    it('should limit filename length', () => {
      const createCleanFileName = (audioGenerator as any).createCleanFileName.bind(audioGenerator);
      const longTitle = 'A'.repeat(150);

      const result = createCleanFileName(longTitle);
      expect(result.length).toBeLessThanOrEqual(100);
    });
  });

  describe('cleanContentForTTS', () => {
    it('should keep first title occurrence and remove duplicates', () => {
      const cleanContentForTTS = (audioGenerator as any).cleanContentForTTS.bind(audioGenerator);

      const result = cleanContentForTTS(
        'Chapter 1: What is Machine Learning?',
        'Chapter 1: What is Machine Learning?\n\nMachine learning is a subset...\n\nChapter 1: What is Machine Learning?\n\nMore content...'
      );

      // Should have the title once at the beginning
      expect(result).toContain('Chapter 1: What is Machine Learning?');
      expect(result).toContain('Machine learning is a subset');
      expect(result).toContain('More content');
      
      // Count occurrences - should only appear once
      const titleCount = (result.match(/Chapter 1: What is Machine Learning\?/g) || []).length;
      expect(titleCount).toBe(1);
    });

    it('should handle conclusion sections with duplicates', () => {
      const cleanContentForTTS = (audioGenerator as any).cleanContentForTTS.bind(audioGenerator);

      const result = cleanContentForTTS(
        'Conclusion',
        'Conclusion\n\nIn conclusion, machine learning is...\n\nConclusion\n\nMore concluding thoughts...'
      );

      // Should have "Conclusion" once
      expect(result).toContain('Conclusion');
      expect(result).toContain('In conclusion, machine learning is');
      expect(result).toContain('More concluding thoughts');
      
      // Count occurrences - should only appear once as standalone title
      const lines = result.split('\n').filter((line: string) => line.trim() === 'Conclusion');
      expect(lines.length).toBe(1);
    });

    it('should remove markdown formatting', () => {
      const cleanContentForTTS = (audioGenerator as any).cleanContentForTTS.bind(audioGenerator);

      const result = cleanContentForTTS(
        'Key Concepts',
        '**Supervised Learning**: The algorithm learns...\n\n*Unsupervised Learning*: Finds patterns...'
      );

      expect(result).not.toContain('**');
      expect(result).not.toContain('*');
      expect(result).toContain('Supervised Learning: The algorithm learns');
      expect(result).toContain('Unsupervised Learning: Finds patterns');
    });

    it('should handle multiple newlines', () => {
      const cleanContentForTTS = (audioGenerator as any).cleanContentForTTS.bind(audioGenerator);

      const result = cleanContentForTTS(
        'Test Title',
        'Test Title\n\n\n\n\nContent with multiple newlines\n\n\nMore content'
      );

      expect(result).toContain('Test Title'); // Title should be kept
      expect(result).not.toMatch(/\n{3,}/); // Multiple newlines should be normalized
      expect(result).toContain('Content with multiple newlines');
    });

    it('should handle case insensitive title removal for duplicates', () => {
      const cleanContentForTTS = (audioGenerator as any).cleanContentForTTS.bind(audioGenerator);

      const result = cleanContentForTTS(
        'Key Concepts',
        'KEY CONCEPTS\n\nSupervised learning is...\n\nKEY CONCEPTS\n\nMore content'
      );

      expect(result).toContain('KEY CONCEPTS'); // First occurrence kept
      expect(result).toContain('Supervised learning is');
      expect(result).toContain('More content');
      
      // Should only have one occurrence
      const upperCaseCount = (result.match(/KEY CONCEPTS/g) || []).length;
      expect(upperCaseCount).toBe(1);
    });
  });

  describe('generateChapterAudio', () => {
    it('should use clean filename and keep title once in content', async () => {
      const generateAudioSpy = jest.spyOn(audioGenerator, 'generateAudio').mockResolvedValue({
        fileName: 'chapter-1-what-is-machine-learning.mp3',
        filePath: '/test/output/chapter-1-what-is-machine-learning.mp3',
        size: 12345
      });

      await audioGenerator.generateChapterAudio(
        'Chapter 1: What is Machine Learning?',
        'Chapter 1: What is Machine Learning?\n\nMachine learning is a subset...\n\nChapter 1: What is Machine Learning?\n\nMore content',
        'chapter-1'
      );

      const callArgs = generateAudioSpy.mock.calls[0][0];
      
      // Should contain title once
      expect(callArgs).toContain('Chapter 1: What is Machine Learning?');
      expect(callArgs).toContain('Machine learning is a subset');
      expect(callArgs).toContain('More content');
      
      // Should only have title once
      const titleCount = (callArgs.match(/Chapter 1: What is Machine Learning\?/g) || []).length;
      expect(titleCount).toBe(1);
    });
  });
});