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
          languageCode: options.voice?.languageCode || 'en-US',
          name: options.voice?.name || 'en-US-Wavenet-D',
          ssmlGender: options.voice?.ssmlGender || 'NEUTRAL',
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
    const fileName = `chapter-${chapterId}`;
    const fullText = `${chapterTitle}\n\n${chapterContent}`;
    
    return this.generateAudio(fullText, fileName);
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

