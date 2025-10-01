import { detectChapters } from '../../src/services/chapterService';

describe('Chapter Detection', () => {
  test('should detect markdown headings', () => {
    const content = `# Chapter 1: Introduction

This is the first chapter content.

## Subsection

More content here.

# Chapter 2: Conclusion

Final chapter content.`;

    const chapters = detectChapters(content);
    
    expect(chapters).toHaveLength(3);
    expect(chapters[0].title).toBe('# Chapter 1: Introduction');
    expect(chapters[1].title).toBe('## Subsection');
    expect(chapters[2].title).toBe('# Chapter 2: Conclusion');
  });

  test('should detect numbered chapters', () => {
    const content = `Chapter 1: Getting Started

Content here.

Chapter 2: Advanced Topics

More content.`;

    const chapters = detectChapters(content);
    
    expect(chapters).toHaveLength(2);
    expect(chapters[0].title).toBe('Chapter 1: Getting Started');
    expect(chapters[1].title).toBe('Chapter 2: Advanced Topics');
  });

  test('should generate proper chapter IDs', () => {
    const content = `# Chapter 1: Introduction

Content here.`;

    const chapters = detectChapters(content);
    
    expect(chapters[0].id).toBe('chapter-1-introduction');
  });
});