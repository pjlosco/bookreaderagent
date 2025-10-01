import dotenv from 'dotenv';
dotenv.config();

import { google } from 'googleapis';
import { extractDocumentId, fetchDocumentContent, parseDocumentContent } from '../../src/services/googleDocsService';

describe('extractDocumentId', () => {
  test('should extract ID from full Google Docs URL with /edit', () => {
    const url = 'https://docs.google.com/document/d/1ABC123def456/edit';
    const result = extractDocumentId(url);
    expect(result).toBe('1ABC123def456');
  });

  test('should extract ID from full Google Docs URL with /view', () => {
    const url = 'https://docs.google.com/document/d/1ABC123def456/view';
    const result = extractDocumentId(url);
    expect(result).toBe('1ABC123def456');
  });

  test('should extract ID from Google Docs URL without trailing path', () => {
    const url = 'https://docs.google.com/document/d/1ABC123def456';
    const result = extractDocumentId(url);
    expect(result).toBe('1ABC123def456');
  });

  test('should return ID when input is already just an ID', () => {
    const id = '1ABC123def456';
    const result = extractDocumentId(id);
    expect(result).toBe('1ABC123def456');
  });

  test('should return null for invalid URL format', () => {
    const url = 'https://example.com/not-a-google-doc';
    const result = extractDocumentId(url);
    expect(result).toBeNull();
  });

  test('should return null for empty string', () => {
    const result = extractDocumentId('');
    expect(result).toBeNull();
  });

  test('should authenticate with Google', async () => {
    // This test just checks if we can create the auth object
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/documents.readonly']
    });
    
    expect(auth).toBeDefined();
  });

  test('should parse document content correctly', () => {
    const mockDocument = {
      body: {
        content: [
          {
            paragraph: {
              elements: [
                { textRun: { content: "Hello World" } }
              ]
            }
          }
        ]
      }
    };
    
    const result = parseDocumentContent(mockDocument);
    expect(result).toBe("Hello World");
  });


});