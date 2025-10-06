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
    
    // Use googleapis to get document with tabs content
    const docs = google.docs({ version: 'v1', auth });
    const response = await docs.documents.get({
      documentId: documentId,
      includeTabsContent: true  // This is crucial for getting tabs
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
    
    // Parse main document body
    if (document.body?.content) {
        for (const element of document.body.content) {
            if (element.paragraph) {
                text += parseParagraph(element.paragraph) + '\n';
            } else if (element.table) {
                text += parseTable(element.table) + '\n';
            }
        }
    }
    
    // Parse tabs if they exist
    if (document.tabs && document.tabs.length > 0) {
        for (const tab of document.tabs) {
            const tabAny = tab as any;
            if (tabAny.documentTab?.body?.content) {
                text += '\n\n'; // Add separation between tabs
                for (const element of tabAny.documentTab.body.content) {
                    if (element.paragraph) {
                        text += parseParagraph(element.paragraph) + '\n';
                    } else if (element.table) {
                        text += parseTable(element.table) + '\n';
                    }
                }
            }
            
            // Handle child tabs recursively
            if (tabAny.childTabs && tabAny.childTabs.length > 0) {
                text += parseChildTabs(tabAny.childTabs);
            }
        }
    }
    
    return text.trim();
}

function parseChildTabs(childTabs: any[]): string {
    let text = '';
    for (const childTab of childTabs) {
        if (childTab.documentTab?.body?.content) {
            text += '\n\n'; // Add separation
            for (const element of childTab.documentTab.body.content) {
                if (element.paragraph) {
                    text += parseParagraph(element.paragraph) + '\n';
                } else if (element.table) {
                    text += parseTable(element.table) + '\n';
                }
            }
        }
        
        // Recursively handle nested child tabs
        if (childTab.childTabs && childTab.childTabs.length > 0) {
            text += parseChildTabs(childTab.childTabs);
        }
    }
    return text;
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

export async function fetchDocumentWithTabChapters(documentId: string): Promise<Chapter[]> {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/documents.readonly']
    });
    
    const docs = google.docs({ version: 'v1', auth });
    const response = await docs.documents.get({
      documentId: documentId,
      includeTabsContent: true
    });
    
    const tabData: Array<{title: string; content: string}> = [];
    
    // Extract tab data
    if (response.data.tabs && response.data.tabs.length > 0) {
      for (const tab of response.data.tabs) {
        const tabAny = tab as any;
        if (tabAny.documentTab?.body?.content) {
          const tabTitle = tabAny.tabProperties?.title || `Tab ${tabData.length + 1}`;
          const tabContent = parseDocumentContent({ body: tabAny.documentTab.body });
          
          if (tabContent.trim()) {
            tabData.push({
              title: tabTitle,
              content: tabContent
            });
          }
        }
      }
    } else {
      // Fallback to main document body if no tabs
      if (response.data.body?.content) {
        const mainContent = parseDocumentContent({ body: response.data.body });
        if (mainContent.trim()) {
          tabData.push({
            title: response.data.title || 'Document',
            content: mainContent
          });
        }
      }
    }
    
    // Use tab-based chapter detector
    const { TabBasedChapterDetector } = await import('./tabBasedChapterDetector');
    return TabBasedChapterDetector.createChaptersFromTabs(tabData);
    
  } catch (error) {
    throw new Error(`Failed to fetch document with tab chapters: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Handle common errors:
// - Invalid document ID
// - Private document (no access)
// - Document not found
// - API rate limits


