# Book Reader Agent

An intelligent AI agent that converts Google Docs into high-quality audio and provides interactive, contextual assistance. Perfect for consuming long documents while having an AI assistant that can answer questions about the content you're listening to.

## 🎯 Purpose

The Book Reader Agent bridges the gap between written content and audio consumption while adding intelligent interaction by:
- **Accessing Google Docs**: Directly connects to Google Docs via API to fetch text content
- **Intelligent Processing**: Uses NLP models to summarize, clean, and optimize text for audio conversion
- **High-Quality Audio**: Generates natural-sounding speech using advanced TTS (Text-to-Speech) technology
- **AI-Powered Q&A**: Interactive assistant that answers questions about the content you're currently listening to
- **Contextual Understanding**: Tracks audio position and provides relevant explanations based on what you've heard
- **Flexible Delivery**: Provides multiple output options for different use cases

## 🏗️ Architecture

### Frontend
- **Interactive Interface**: Clean web interface with audio player and chat
- **URL Input**: Users simply paste a Google Doc URL or ID
- **Audio Player**: Built-in web player with position tracking
- **Chat Interface**: Ask questions about the content you're listening to
- **Download Options**: MP3 download links for offline listening

### Backend
- **Google Docs API**: Fetches and processes document content
- **Audio Position Tracking**: Monitors what part of the document is currently playing
- **Document Chunking**: Breaks content into searchable segments with timestamps
- **AI Integration**: LLM-powered question answering with context awareness
- **NLP Processing**: Text preprocessing using Hugging Face Transformers
  - Text summarization for long documents
  - Content cleaning and formatting
  - Chapter/section detection
- **TTS Engine**: Google Cloud Text-to-Speech for high-quality audio generation
- **Audio Streaming**: Real-time audio streaming to web interface

### AI Agent Features
- **Contextual Q&A**: Answers questions based on current listening position
- **Document Memory**: Remembers content from earlier in the document
- **Semantic Search**: Finds relevant sections using embeddings
- **Conversation History**: Maintains chat context throughout the session

### Output Options
- **Web Player**: Stream audio directly in the browser
- **MP3 Download**: High-quality audio file for offline use
- **Device Audio**: Direct playback to user's speakers/headphones

## 🚀 Use Cases

- **Interactive Learning**: Listen to educational content while asking clarifying questions
- **Research Assistance**: Get instant explanations of complex concepts while listening to papers
- **Accessibility**: Make content accessible with AI-powered explanations
- **Multitasking**: Listen to documents while commuting, exercising, or working
- **Content Consumption**: Transform any Google Doc into an interactive podcast experience
- **Study Sessions**: Ask questions about specific sections you're reviewing
- **Professional Development**: Learn from technical documents with AI guidance
- **Book-Like Documents**: Handle large documents with natural chapter breaks and tab organization
- **Educational Materials**: Convert textbooks and course materials into navigable audio chapters

## 🛠️ Technology Stack

- **Backend**: Node.js with TypeScript and Express
- **Google Integration**: Google Docs API and Google Cloud Text-to-Speech
- **AI/ML**: OpenAI API or Hugging Face Transformers for Q&A
- **Vector Database**: Pinecone or Chroma for document embeddings
- **TTS**: Google Cloud Text-to-Speech for high-quality speech synthesis
- **Frontend**: React/TypeScript with audio player and chat interface
- **Real-time**: WebSocket for live audio position tracking

## 📋 Implementation Status

### Phase 1: Basic TTS (In Progress)
- [x] Project setup with TypeScript and Jest
- [x] Google Docs URL parsing and document ID extraction
- [x] Google Docs API integration setup
- [x] Document content fetching and parsing
- [ ] **Chapter detection and segmentation** - Identify natural breaking points (headings, tabs, sections)
- [ ] **Multi-file audio generation** - Create separate audio files for each chapter/section
- [ ] Google Cloud Text-to-Speech integration
- [ ] Basic web interface with audio player
- [ ] **Chapter navigation** - Allow users to jump between chapters
- [ ] MP3 download functionality (individual chapters + full document)

### Phase 2: AI Agent Features (Planned)
- [ ] **Chapter-aware audio position tracking** - Track position within current chapter
- [ ] **Cross-chapter context** - AI can reference content from other chapters
- [ ] Document chunking with timestamps per chapter
- [ ] Vector embeddings for semantic search across all chapters
- [ ] LLM integration for Q&A (OpenAI/Claude)
- [ ] Chat interface for user questions
- [ ] **Chapter-aware responses** - AI knows which chapter user is listening to
- [ ] Conversation history management
- [ ] Real-time WebSocket communication

### Phase 3: Enhanced Features (Future)
- [ ] Multiple voice selection
- [ ] Audio speed control
- [ ] Chapter/section navigation
- [ ] Batch processing for multiple documents
- [ ] Mobile app interface
- [ ] Offline mode with cached content

## 🎵 Audio Quality

The agent prioritizes audio quality by:
- Using Google Cloud Text-to-Speech for natural-sounding speech
- Optimizing text for better pronunciation
- Supporting multiple voice options and languages
- Generating high-bitrate MP3 output
- Providing real-time streaming capabilities

## 🤖 AI Agent Capabilities

The intelligent agent provides:
- **Contextual Understanding**: Knows what you're currently listening to
- **Smart Q&A**: Answers questions based on document content and position
- **Memory**: Remembers previous parts of the conversation and document
- **Semantic Search**: Finds relevant sections using AI-powered search
- **Natural Interaction**: Conversational interface that feels like talking to a knowledgeable assistant

## 🚀 Getting Started

1. **Phase 1**: Basic document-to-audio conversion
2. **Phase 2**: Add AI-powered Q&A capabilities
3. **Phase 3**: Enhanced features and mobile support

---

*Transform your reading experience into an interactive audio journey with the Book Reader Agent.*
