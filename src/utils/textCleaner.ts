/**
 * Text cleaning utilities for better Text-to-Speech output
 */

export interface CleanTextOptions {
  removeMarkdown?: boolean;
  normalizeWhitespace?: boolean;
  removeEmptyChapters?: boolean;
  removeRedundantTitles?: boolean;
  minChapterLength?: number;
}

export class TextCleaner {
  /**
   * Clean text content for better TTS output
   */
  static cleanText(text: string, options: CleanTextOptions = {}): string {
    const {
      removeMarkdown = true,
      normalizeWhitespace = true,
      removeRedundantTitles = true,
      minChapterLength = 50
    } = options;

    let cleaned = text;

    // Remove markdown formatting
    if (removeMarkdown) {
      cleaned = this.removeMarkdown(cleaned);
    }

    // Normalize whitespace
    if (normalizeWhitespace) {
      cleaned = this.normalizeWhitespace(cleaned);
    }

    // Remove redundant titles (if content starts with the same title)
    if (removeRedundantTitles) {
      cleaned = this.removeRedundantTitles(cleaned);
    }

    // Remove chapters that are too short
    if (cleaned.length < minChapterLength) {
      return '';
    }

    return cleaned.trim();
  }

  /**
   * Remove markdown formatting that TTS doesn't handle well
   */
  private static removeMarkdown(text: string): string {
    return text
      // Remove bold/italic markers
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      
      // Remove headers
      .replace(/^#{1,6}\s+/gm, '')
      
      // Remove links but keep the text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      
      // Remove lists markers
      .replace(/^\s*[-*+]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      
      // Remove horizontal rules
      .replace(/^---+$/gm, '')
      .replace(/^\*\*\*+$/gm, '');
  }

  /**
   * Normalize whitespace for better TTS flow
   */
  private static normalizeWhitespace(text: string): string {
    return text
      // Replace multiple newlines with single newline
      .replace(/\n{3,}/g, '\n\n')
      
      // Replace multiple spaces with single space
      .replace(/[ \t]{2,}/g, ' ')
      
      // Remove leading/trailing whitespace from lines
      .split('\n')
      .map(line => line.trim())
      .join('\n')
      
      // Remove empty lines at start/end
      .replace(/^\n+/, '')
      .replace(/\n+$/, '');
  }

  /**
   * Remove redundant chapter titles from content
   */
  private static removeRedundantTitles(text: string): string {
    const lines = text.split('\n');
    if (lines.length < 2) return text;

    const firstLine = lines[0].trim();
    const secondLine = lines[1].trim();

    // If first line looks like a title and second line is empty, remove the title
    if (this.isTitle(firstLine) && secondLine === '') {
      return lines.slice(2).join('\n');
    }

    return text;
  }

  /**
   * Check if a line looks like a title
   */
  private static isTitle(line: string): boolean {
    // Check for common title patterns
    return (
      line.match(/^Chapter \d+/i) !== null ||
      line.match(/^(Introduction|Conclusion|Summary|Preface|Epilogue|Appendix|Key Concepts|Overview|Background|Methodology|Results|Discussion|References|Bibliography)/i) !== null ||
      (line.length < 100 && line.length > 3 && /^[A-Z]/.test(line))
    );
  }

  /**
   * Clean an array of chapters
   */
  static cleanChapters(chapters: Array<{title: string, content: string}>, options: CleanTextOptions = {}): Array<{title: string, content: string}> {
    return chapters
      .map(chapter => ({
        ...chapter,
        content: this.cleanText(chapter.content, options)
      }))
      .filter(chapter => chapter.content.length > 0); // Remove empty chapters
  }

  /**
   * Get character count savings from cleaning
   */
  static getCleaningStats(originalText: string, cleanedText: string): {
    originalLength: number;
    cleanedLength: number;
    savings: number;
    savingsPercent: number;
  } {
    const originalLength = originalText.length;
    const cleanedLength = cleanedText.length;
    const savings = originalLength - cleanedLength;
    const savingsPercent = Math.round((savings / originalLength) * 100);

    return {
      originalLength,
      cleanedLength,
      savings,
      savingsPercent
    };
  }
}

