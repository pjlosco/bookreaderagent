import fs from 'fs';
import path from 'path';
import { AudioFile } from './audioGenerator';

export interface AudioMetadata {
  documentId: string;
  documentTitle: string;
  totalChapters: number;
  generatedAt: string;
  chapters: Array<{
    id: string;
    title: string;
    fileName: string;
    filePath: string;
    size: number;
    content?: string; // Chapter text content for read-along feature
  }>;
}

export class FileManager {
  private baseAudioDir: string;

  constructor(baseAudioDir: string = './audio') {
    this.baseAudioDir = baseAudioDir;
    this.ensureBaseDir();
  }

  private ensureBaseDir(): void {
    if (!fs.existsSync(this.baseAudioDir)) {
      fs.mkdirSync(this.baseAudioDir, { recursive: true });
    }
  }

  getDocumentAudioDir(documentId: string): string {
    return path.join(this.baseAudioDir, documentId);
  }

  ensureDocumentDir(documentId: string): string {
    const docDir = this.getDocumentAudioDir(documentId);
    if (!fs.existsSync(docDir)) {
      fs.mkdirSync(docDir, { recursive: true });
    }
    return docDir;
  }

  hasExistingAudio(documentId: string): boolean {
    const docDir = this.getDocumentAudioDir(documentId);
    return fs.existsSync(docDir) && fs.readdirSync(docDir).length > 0;
  }

  getExistingAudioFiles(documentId: string): string[] {
    const docDir = this.getDocumentAudioDir(documentId);
    if (!fs.existsSync(docDir)) {
      return [];
    }
    return fs.readdirSync(docDir).filter(file => file.endsWith('.mp3'));
  }

  saveMetadata(documentId: string, metadata: AudioMetadata): void {
    // Save in the document-specific directory
    const docDir = this.getDocumentAudioDir(documentId);
    this.ensureDocumentDir(documentId);
    const metadataPath = path.join(docDir, 'metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  }

  loadMetadata(documentId: string): AudioMetadata | null {
    // Load from the document-specific directory
    const docDir = this.getDocumentAudioDir(documentId);
    const metadataPath = path.join(docDir, 'metadata.json');
    
    if (!fs.existsSync(metadataPath)) {
      return null;
    }
    
    try {
      const data = fs.readFileSync(metadataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to load metadata:', error);
      return null;
    }
  }

  deleteDocumentAudio(documentId: string): boolean {
    const docDir = this.getDocumentAudioDir(documentId);
    if (fs.existsSync(docDir)) {
      fs.rmSync(docDir, { recursive: true, force: true });
      return true;
    }
    return false;
  }

  getAudioFileInfo(documentId: string, chapterId: string): { exists: boolean; filePath: string; size?: number } {
    const docDir = this.getDocumentAudioDir(documentId);
    const fileName = `chapter-${chapterId}.mp3`;
    const filePath = path.join(docDir, fileName);
    
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      return { exists: true, filePath, size: stats.size };
    }
    
    return { exists: false, filePath };
  }
}

