import { TabBasedChapterDetector } from '../../src/services/tabBasedChapterDetector';
import { Chapter } from '../../src/services/chapterDetector';

describe('TabBasedChapterDetector', () => {
  describe('createChaptersFromTabs', () => {
    it('should create one chapter per tab', () => {
      const tabData = [
        {
          title: 'Chapter 1: What is Machine Learning',
          content: 'Machine learning is a subset of artificial intelligence...\n\nKey Concepts\n\n**Supervised Learning**: The algorithm learns...'
        },
        {
          title: 'Chapter 2: Common Algorithms',
          content: 'Linear Regression\n\nDecision Trees\n\nNeural Networks'
        },
        {
          title: 'Chapter 3: Applications',
          content: 'Machine learning applications include...'
        },
        {
          title: 'Conclusion',
          content: 'In conclusion, machine learning is...'
        }
      ];

      const chapters = TabBasedChapterDetector.createChaptersFromTabs(tabData);

      expect(chapters).toHaveLength(4);
      expect(chapters[0].title).toBe('Chapter 1: What is Machine Learning');
      expect(chapters[1].title).toBe('Chapter 2: Common Algorithms');
      expect(chapters[2].title).toBe('Chapter 3: Applications');
      expect(chapters[3].title).toBe('Conclusion');
    });

    it('should clean content for TTS', () => {
      const tabData = [
        {
          title: 'Test Chapter',
          content: '**Bold text** and normal text\n\n\n\nMultiple newlines\n\n\n'
        }
      ];

      const chapters = TabBasedChapterDetector.createChaptersFromTabs(tabData);

      expect(chapters).toHaveLength(1);
      expect(chapters[0].content).not.toContain('**');
      expect(chapters[0].content).not.toMatch(/\n{3,}/);
    });

    it('should filter out empty tabs', () => {
      const tabData = [
        {
          title: 'Valid Chapter',
          content: 'This has content'
        },
        {
          title: 'Empty Chapter',
          content: '   \n\n   '
        },
        {
          title: 'Another Valid Chapter',
          content: 'This also has content'
        }
      ];

      const chapters = TabBasedChapterDetector.createChaptersFromTabs(tabData);

      expect(chapters).toHaveLength(2);
      expect(chapters[0].title).toBe('Valid Chapter');
      expect(chapters[1].title).toBe('Another Valid Chapter');
    });

    it('should generate clean chapter IDs', () => {
      const tabData = [
        {
          title: 'Chapter 1: What is Machine Learning?',
          content: 'Content here'
        },
        {
          title: 'Conclusion',
          content: 'More content'
        }
      ];

      const chapters = TabBasedChapterDetector.createChaptersFromTabs(tabData);

      expect(chapters[0].id).toBe('tab-0-chapter-1-what-is-machine-learning');
      expect(chapters[1].id).toBe('tab-1-conclusion');
    });
  });

  describe('getExpectedChapterCount', () => {
    it('should return correct count for valid tabs', () => {
      const tabData = [
        { title: 'Chapter 1', content: 'Content' },
        { title: 'Chapter 2', content: 'More content' },
        { title: 'Empty', content: '   ' },
        { title: 'Chapter 3', content: 'Final content' }
      ];

      const count = TabBasedChapterDetector.getExpectedChapterCount(tabData);

      expect(count).toBe(2); // Only chapters with content > 10 characters
    });
  });
});
