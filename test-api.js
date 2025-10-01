require('dotenv').config();
const { fetchDocumentContent } = require('./dist/services/googleDocsService');

async function testAPI() {
  try {
    console.log('Testing Google Docs API...');
    console.log('Credentials path:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
    const content = await fetchDocumentContent('1qRZs6S2amEOQpzOydjUmArkzbmnJZ6jJR7oRBKtfx_A');
    console.log('Success! Content length:', content.length);
    console.log('First 200 characters:', content.substring(0, 200) + '...');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();