import { google } from "googleapis";
import { detectChapters, Chapter } from './chapterDetector';

// Authenticate with Google using your service account
const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/documents.readonly']
  });

// Extract document ID from Google Doc URLs
export function extractDocumentId(input: string): string | null {
    // Handle different URL patterns
    //     Google Doc URLs come in different formats:
    // DOCUMENT_ID
    // https://docs.google.com/document/d/DOCUMENT_ID/edit
    // https://docs.google.com/document/d/DOCUMENT_ID/view
    // https://docs.google.com/document/d/DOCUMENT_ID
    // If it's already just an ID (no slashes), return it
    if (input === '') {
        return null;
    }

    if (!input.includes('/')) {
        return input;
    }
    // If it's a full URL, extract the ID
    if (input.includes('docs.google.com/document/d/')) {
        // Find the part after '/d/' and before the next '/'
        const startIndex = input.indexOf('/d/') + 3;
        const endIndex = input.indexOf('/', startIndex);
        
        if (endIndex === -1) {
          // No trailing slash, take everything after '/d/'
          return input.substring(startIndex);
        } else {
          // Take everything between '/d/' and next '/'
          return input.substring(startIndex, endIndex);
        }
    }

    return null;
  }

// Fetch document content from Google Docs API
export async function fetchDocumentContent(documentId: string): Promise<string> {
  try {
    // Create auth object inside the function
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/documents.readonly']
    });
    
    // Use googleapis to get document
    const docs = google.docs({ version: 'v1', auth });
    const response = await docs.documents.get({
      documentId: documentId,
    });
    
    // Parse the structured content
    const content = parseDocumentContent(response.data); 
    
    // Return clean text
    return content;
  } catch (error) {
    console.log('Full error details:', error);
    throw new Error(`Failed to fetch document: ${error instanceof Error ? error.message : String(error)}`);
  }
}


export function parseDocumentContent(document: any): string {
    let text = '';
    if (document.body?.content) {
        for (const element of document.body.content) {
            if (element.paragraph) {
                text += parseParagraph(element.paragraph) + '\n';
            } else if (element.table) {
                text += parseTable(element.table) + '\n';
            }
        }
    }
    return text.trim();
}

export function parseParagraph(paragraph: any): string {
    let text = '';
    if (paragraph.elements) {
        for (const element of paragraph.elements) {
            if (element.textRun?.content) {
                text += element.textRun.content;
            }
        }
    }
    return text;
}

export function parseTable(table: any): string {
    let text = '';
    
    if (table.tableRows) {
      for (const row of table.tableRows) {
        if (row.tableCells) {
          for (const cell of row.tableCells) {
            if (cell.content) {
              for (const element of cell.content) {
                if (element.paragraph) {
                  text += parseParagraph(element.paragraph) + ' ';
                }
              }
            }
          }
          text += '\n';
        }
      }
    }
    
    return text;
}


// Add this function
export async function fetchDocumentWithChapters(documentId: string): Promise<Chapter[]> {
  const content = await fetchDocumentContent(documentId);
  return detectChapters(content);
}

// Handle common errors:
// - Invalid document ID
// - Private document (no access)
// - Document not found
// - API rate limits


