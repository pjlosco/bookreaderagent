import { Chapter } from './chapterDetector';
import { TextCleaner } from '../utils/textCleaner';

/**
 * Tab-based chapter detector that creates one chapter per tab
 * This is more appropriate for Google Docs with tabs
 */
export class TabBasedChapterDetector {
  
  /**
   * Create chapters from tab content
   * Each tab becomes one chapter with its title and all content
   */
  static createChaptersFromTabs(tabData: Array<{
    title: string;
    content: string;
  }>): Chapter[] {
    const chapters: Chapter[] = [];
    
    tabData.forEach((tab, index) => {
      // Clean the content for better TTS
      const cleanedContent = TextCleaner.cleanText(tab.content, {
        removeMarkdown: true,
        normalizeWhitespace: true,
        removeRedundantTitles: false, // Keep titles since they're tab titles
        minChapterLength: 10 // Lower threshold for tabs
      });
      
      if (cleanedContent.trim()) {
        chapters.push({
          id: this.generateTabChapterId(tab.title, index),
          title: tab.title,
          content: cleanedContent,
          startIndex: 0,
          endIndex: cleanedContent.length
        });
      }
    });
    
    return chapters;
  }
  
  /**
   * Generate a clean chapter ID from tab title
   */
  private static generateTabChapterId(title: string, index: number): string {
    // Clean the title to create a valid ID
    const cleanTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    
    return `tab-${index}-${cleanTitle}`;
  }
  
  /**
   * Get expected number of chapters (for testing)
   */
  static getExpectedChapterCount(tabData: Array<{title: string; content: string}>): number {
    return tabData.filter(tab => 
      TextCleaner.cleanText(tab.content, {
        removeMarkdown: true,
        normalizeWhitespace: true,
        minChapterLength: 10
      }).trim().length > 0
    ).length;
  }
}

