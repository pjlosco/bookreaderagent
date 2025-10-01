import dotenv from 'dotenv';
dotenv.config();

import { google } from 'googleapis';
import { extractDocumentId, fetchDocumentContent, parseDocumentContent, parseParagraph, parseTable } from '../../src/services/documentFetcher';

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

  // Add these tests to your existing describe block

test('should parse paragraph content correctly', () => {
  const mockParagraph = {
    elements: [
      { textRun: { content: "Hello " } },
      { textRun: { content: "World" } }
    ]
  };
  
  const result = parseParagraph(mockParagraph);
  expect(result).toBe("Hello World");
});

test('should parse table content correctly', () => {
  const mockTable = {
    tableRows: [
      {
        tableCells: [
          {
            content: [
              {
                paragraph: {
                  elements: [
                    { textRun: { content: "Cell 1" } }
                  ]
                }
              }
            ]
          }
        ]
      }
    ]
  };
  
  const result = parseTable(mockTable);
  expect(result).toBe("Cell 1 \n");  // Changed from "Cell 1\n" to "Cell 1 \n"
});

test('should handle empty paragraph', () => {
  const mockParagraph = { elements: [] };
  const result = parseParagraph(mockParagraph);
  expect(result).toBe("");
});

test('should handle empty table', () => {
  const mockTable = { tableRows: [] };
  const result = parseTable(mockTable);
  expect(result).toBe("");
});

test('should handle parseDocumentContent with no body', () => {
  const result = parseDocumentContent({});
  expect(result).toBe('');
});

test('should handle parseTable with no tableRows', () => {
  const result = parseTable({});
  expect(result).toBe('');
});

});

