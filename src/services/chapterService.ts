export interface Chapter {
    id: string;
    title: string;
    content: string;
    startIndex: number;
    endIndex: number;
  }
  
  export function detectChapters(content: string): Chapter[] {
    const chapters: Chapter[] = [];
    const lines = content.split('\n');
    
    let currentChapter: Partial<Chapter> = {
      content: '',
      startIndex: 0
    };
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detect chapter markers
      if (isChapterHeading(line)) {
        // Save previous chapter if it exists
        if (currentChapter.title && currentChapter.content && currentChapter.content.trim().length > 10) {
            currentChapter.endIndex = i - 1;
            chapters.push(currentChapter as Chapter);
        }
        
        // Start new chapter
        currentChapter = {
          id: generateChapterId(line),
          title: line,
          content: line + '\n',
          startIndex: i
        };
      } else {
        // Add line to current chapter
        if (currentChapter.content !== undefined) {
          currentChapter.content += line + '\n';
        }
      }
    }
    
    // Add the last chapter
    if (currentChapter.title && currentChapter.content && currentChapter.content.trim().length > 10) {
        currentChapter.endIndex = lines.length - 1;
        chapters.push(currentChapter as Chapter);
    }
    
    // Handle content before first heading as preface
    if (chapters.length === 0 && content.trim()) {
        chapters.push({
        id: 'preface',
        title: 'Preface',
        content: content.trim(),
        startIndex: 0,
        endIndex: lines.length - 1
        });
    }
    
    return chapters;
  }
  
  function isChapterHeading(line: string): boolean {
    // Check for various heading patterns
    return (
      line.startsWith('# ') ||           // Markdown H1
      line.startsWith('## ') ||          // Markdown H2
      line.startsWith('### ') ||         // Markdown H3
      !!line.match(/^Chapter \d+/i) ||   // "Chapter 1", "Chapter 2", etc.
      !!line.match(/^\d+\.\s/) ||        // "1. Title", "2. Title"
      !!line.match(/^[A-Z][A-Z\s]+$/) && line.length < 50  // ALL CAPS titles
    );
  }
  
  function generateChapterId(title: string): string {
    return title
      .toLowerCase()
      .replace(/^#+\s*/, '')  // Remove markdown headers first
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  }