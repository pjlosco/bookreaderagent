import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { google } from '@google-cloud/text-to-speech/build/protos/protos';
import fs from 'fs';
import path from 'path';

export interface TTSOptions {
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

export interface AudioFile {
  filePath: string;
  fileName: string;
  duration?: number;
  size: number;
}

export class AudioGenerator {
  private client: TextToSpeechClient;
  private outputDir: string;

  constructor(outputDir: string = './audio') {
    this.client = new TextToSpeechClient();
    this.outputDir = outputDir;
    this.ensureOutputDir();
  }

  private ensureOutputDir(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async generateAudio(
    text: string, 
    fileName: string, 
    options: TTSOptions = {}
  ): Promise<AudioFile> {
    try {
      const request: google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
        input: { text },
        voice: {
          languageCode: options.voice?.languageCode || 'en-GB',
          name: options.voice?.name || 'en-GB-Neural2-A', // British English female voice (premium quality)
          ssmlGender: options.voice?.ssmlGender || 'FEMALE',
        },
        audioConfig: {
          audioEncoding: options.audioConfig?.audioEncoding || 'MP3',
          speakingRate: options.audioConfig?.speakingRate || 1.0,
          pitch: options.audioConfig?.pitch || 0.0,
          volumeGainDb: options.audioConfig?.volumeGainDb || 0.0,
        },
      };

      const [response] = await this.client.synthesizeSpeech(request);
      
      if (!response.audioContent) {
        throw new Error('No audio content received from TTS service');
      }

      const filePath = path.join(this.outputDir, `${fileName}.mp3`);
      fs.writeFileSync(filePath, response.audioContent as Buffer);

      const stats = fs.statSync(filePath);
      
      return {
        filePath,
        fileName: `${fileName}.mp3`,
        size: stats.size,
      };
    } catch (error) {
      throw new Error(`TTS generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async generateChapterAudio(
    chapterTitle: string,
    chapterContent: string,
    chapterId: string
  ): Promise<AudioFile> {
    // Create clean filename from chapter title
    const cleanFileName = this.createCleanFileName(chapterTitle);
    
    // Clean the content to avoid title repetition
    const cleanedContent = this.cleanContentForTTS(chapterTitle, chapterContent);
    
    return this.generateAudio(cleanedContent, cleanFileName);
  }

  private cleanContentForTTS(title: string, content: string): string {
    let cleanedContent = content.trim();
    
    // Clean up markdown and formatting first
    cleanedContent = cleanedContent
      .replace(/^\s*#+\s*/gm, '') // Remove markdown headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
      .replace(/\*(.*?)\*/g, '$1') // Remove italic formatting
      .replace(/\n{3,}/g, '\n\n') // Normalize multiple newlines
      .trim();
    
    // Remove duplicate title occurrences (keep only the first one)
    const titleVariations = [
      title,
      title.replace(/^Chapter \d+:\s*/i, ''), // Without "Chapter X:" prefix
      title.replace(/:\s*$/, ''), // Without trailing colon
    ];
    
    for (const variation of titleVariations) {
      if (!variation.trim()) continue;
      
      // Create regex to find all occurrences (case insensitive)
      const titleRegex = new RegExp(
        `(^|\\n)\\s*${this.escapeRegex(variation)}\\s*(\\n|$)`,
        'gi'
      );
      
      // Count occurrences
      const matches = cleanedContent.match(titleRegex);
      if (matches && matches.length > 1) {
        // Keep first occurrence, remove subsequent ones
        let firstOccurrence = true;
        cleanedContent = cleanedContent.replace(titleRegex, (match) => {
          if (firstOccurrence) {
            firstOccurrence = false;
            return match; // Keep the first one
          }
          return '\n'; // Replace duplicates with newline
        });
      }
    }
    
    // Final cleanup
    cleanedContent = cleanedContent
      .replace(/\n{3,}/g, '\n\n') // Normalize multiple newlines again
      .trim();
    
    return cleanedContent;
  }

  private escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private createCleanFileName(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .substring(0, 100); // Limit length
  }

  async generateMultipleChapterAudio(
    chapters: Array<{ id: string; title: string; content: string }>
  ): Promise<AudioFile[]> {
    const audioFiles: AudioFile[] = [];
    
    for (const chapter of chapters) {
      const audioFile = await this.generateChapterAudio(
        chapter.title,
        chapter.content,
        chapter.id
      );
      audioFiles.push(audioFile);
    }
    
    return audioFiles;
  }

  getAvailableVoices(languageCode: string = 'en-US'): Promise<google.cloud.texttospeech.v1.IVoice[]> {
    return this.client.listVoices({ languageCode }).then(([response]) => response.voices || []);
  }

}

