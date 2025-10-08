# Book Reader Agent

An intelligent AI agent that converts Google Docs into high-quality audio and provides interactive, contextual assistance. Perfect for consuming long documents while having an AI assistant that can answer questions about the content you're listening to.

## ✨ Recent Accomplishments

### Karaoke-Style Read-Along (Latest)
- **Synchronized text display** — Shows chapter text only while audio is playing
- **Sentence highlighting** — Active sentence highlighted in purple as audio progresses
- **Auto-scroll tracking** — Text scrolls within container to follow audio (no page lock)
- **Click-to-jump** — Click any sentence to jump to that position in audio
- **Single-track playback** — Only one audio plays at a time, others auto-pause
- **Smart timing estimation** — Word-based timing scaled to actual audio duration

### Progress Tracking & Management
- **Chapter completion tracking** — Automatic completion badges when 95% listened
- **Document-level progress** — Overall percentage and chapter count display
- **Save/resume playback** — Continues from last position with resume button
- **Visual progress bars** — Real-time progress updates every 500ms
- **Listening time tracking** — Cumulative time spent on each chapter
- **localStorage persistence** — Progress survives browser restarts
- **Data management** — Clear progress for chapters, documents, or all data

### Interactive Chapter Management
- **Tab-based chapter detection** — Properly parses Google Docs tabs (4 tabs = 4 chapters, not 8 subsections)
- **Interactive UI** — Toggle switches to generate/delete audio for individual chapters
- **Document library** — View and manage all processed Google Docs
- **Smart caching** — Reuses existing audio files (97% faster on second run: 15s → 486ms)
- **Clean filenames** — Uses chapter titles instead of IDs (e.g., `chapter-1-what-is-machine-learning.mp3`)
- **Confirmation dialogs** — Prevents accidental audio deletion
- **British English voice** — Premium Neural2-A voice for natural-sounding audiobooks

### Text Cleaning & Optimization
- **Title deduplication** — Keeps chapter title once, removes duplicates
- **Markdown removal** — Strips `**bold**`, `*italic*` for cleaner TTS
- **Whitespace normalization** — Reduces character count by ~13%
- **Cost optimization** — Saves money by cleaning unnecessary formatting

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
- **TTS Library**: @google-cloud/text-to-speech for high-quality audio generation
- **AI/ML**: OpenAI API or Hugging Face Transformers for Q&A
- **Vector Database**: Pinecone or Chroma for document embeddings
- **TTS**: Google Cloud Text-to-Speech for high-quality speech synthesis
- **Frontend**: React/TypeScript with audio player and chat interface
- **Real-time**: WebSocket for live audio position tracking

## 🎉 Recent Accomplishments

### ✅ Multi-file Audio Generation (Completed)
- **DocumentProcessor Orchestrator**: Complete end-to-end workflow with comprehensive error handling
- **Progress Tracking**: Real-time progress callbacks with detailed stage reporting (fetching, detecting, generating, complete)
- **Robust Error Handling**: Specific error messages for document not found, permission denied, rate limits, and TTS failures
- **Comprehensive Testing**: 51 passing tests with 92.82% code coverage
- **Backward Compatibility**: All existing functionality preserved while adding new features

### ✅ Service Architecture Refactoring (Completed)
- **Domain-Specific Naming**: Renamed all services to use clear, descriptive names
  - `googleDocsService` → `documentFetcher`
  - `chapterService` → `chapterDetector`  
  - `ttsService` → `audioGenerator`
  - `audioService` → `fileManager`
- **Improved Maintainability**: Clear separation of concerns and intuitive naming

## 📋 Implementation Status

### Phase 1: Core Audio & Interface ✅ (Completed)
- [x] Project setup with TypeScript and Jest
- [x] Google Docs URL parsing and document ID extraction
- [x] Google Docs API integration setup
- [x] Document content fetching and parsing
- [x] **Chapter detection and segmentation** - Identify natural breaking points (headings, tabs, sections)
- [x] **Multi-file audio generation** - Create separate audio files for each chapter/section
- [x] **Google Cloud Text-to-Speech integration** - Convert text to high-quality audio
- [x] **DocumentProcessor orchestrator** - End-to-end workflow with comprehensive error handling
- [x] **Progress tracking system** - Real-time progress callbacks with detailed stage reporting
- [x] **Comprehensive test coverage** - 92.82% coverage with 51 passing tests
- [x] **Interactive web interface** - Two-tab interface with document library
- [x] **Chapter-by-chapter audio control** - Toggle switches for individual chapter generation
- [x] **Audio file reuse** - Intelligent caching to avoid regenerating existing files
- [x] **Document library** - View and manage all processed documents
- [x] **Metadata tracking** - Persistent storage of document and chapter information
- [x] **Confirmation dialogs** - Protection against accidental deletion
- [x] **Tab-based chapter detection** - Proper parsing of Google Docs tabs
- [x] **Text cleaning for TTS** - Removes markdown, normalizes whitespace, deduplicates titles
- [x] **British English Neural2 voice** - Premium quality female voice (en-GB-Neural2-A)
- [x] **Clean filename generation** - Uses chapter titles for intuitive file names
- [x] **MP3 download functionality** - Individual chapter downloads with icons

### Phase 2: Read-Along & Progress Tracking ✅ (Completed)
- [x] **Karaoke-style read-along** - Text displays synchronized with audio playback
- [x] **Sentence-level highlighting** - Active sentence highlighted as audio plays
- [x] **Auto-scroll within container** - Smooth scrolling without page lock
- [x] **Click-to-jump navigation** - Click sentences to seek to that position
- [x] **Single-track playback** - Only one audio plays at a time
- [x] **Chapter completion tracking** - Automatic completion at 95% listened
- [x] **Progress bars** - Real-time visual progress (updates every 500ms)
- [x] **Document-level progress** - Overall completion percentage display
- [x] **Save/resume positions** - Continue from where you left off
- [x] **Listening time tracking** - Track cumulative time per chapter
- [x] **localStorage persistence** - Progress survives browser restarts
- [x] **Progress management** - Clear data for chapters, documents, or everything
- [x] **Resume buttons** - Quick resume with saved position percentage

### Phase 3: AI Agent Features (Planned)
- [ ] **Interactive Q&A during playback** - Pause to ask questions about content
- [ ] **Cross-chapter context** - AI can reference content from other chapters
- [ ] Document chunking with timestamps per chapter
- [ ] Vector embeddings for semantic search across all chapters
- [ ] LLM integration for Q&A (OpenAI/Claude)
- [ ] Chat interface for user questions
- [ ] **Chapter-aware responses** - AI knows which chapter user is listening to
- [ ] Conversation history management
- [ ] Real-time WebSocket communication

### Phase 4: Enhanced Features (Future)
- [ ] Multiple voice selection UI
- [ ] Audio speed control (0.5x - 2.0x)
- [ ] Advanced chapter navigation
- [ ] Batch processing for multiple documents
- [ ] Mobile app interface
- [ ] Offline mode with cached content
- [ ] Bookmarking and annotations
- [ ] Export progress reports

## 🗺️ Roadmap

### Authentication Evolution
- **Phase 1**: Service Account (Current) - Development and backend services
- **Phase 2**: OAuth2 Web Auth - User login through web interface
- **Phase 3**: Mobile OAuth - Platform-specific authentication for iOS/Android
- **Phase 4**: Hybrid Auth - Service account + user authentication

### Future Integrations
- **Mobile Apps**: Native iOS and Android applications
- **Voice Assistants**: Integration with Alexa, Google Assistant
- **Learning Platforms**: Canvas, Blackboard, Moodle integration
- **Enterprise**: SSO, team collaboration features

## 🎙️ Voice Selection

**Default Voice:** `en-GB-Neural2-A` (British English, Female)
- **Quality:** Premium Neural2 voice - most natural-sounding
- **Accent:** British English (en-GB)
- **Gender:** Female
- **Cost:** $16 per 1 million characters (within free tier for typical usage)

### Available Voice Options

**Standard Voices (Best Value - $4/1M chars):**
- `en-GB-Standard-A` — Warm, clear female voice
- `en-GB-Standard-C` — Professional tone
- `en-GB-Standard-F` — Clear and articulate

**Neural2 Voices (Best Quality - $16/1M chars):**
- `en-GB-Neural2-A` ⭐ — Most natural-sounding (current default)
- `en-GB-Neural2-C` — Rich, expressive
- `en-GB-Neural2-F` — Smooth and professional

**WaveNet Voices (Premium - $16/1M chars):**
- `en-GB-Wavenet-A` — High-quality, natural speech
- `en-GB-Wavenet-C` — Excellent clarity
- `en-GB-Wavenet-F` — Professional and engaging

### Changing Voices

**Via API (Recommended):**
```bash
# When processing a document
curl -X POST http://localhost:3000/api/books/process \
  -H "Content-Type: application/json" \
  -d '{
    "documentUrl": "YOUR_GOOGLE_DOC_URL",
    "voice": {
      "languageCode": "en-GB",
      "name": "en-GB-Wavenet-C",
      "ssmlGender": "FEMALE"
    }
  }'

# When generating a single chapter
curl -X POST http://localhost:3000/api/books/generate-chapter \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "YOUR_DOCUMENT_ID",
    "chapterId": "chapter-1",
    "chapterTitle": "Chapter 1",
    "chapterContent": "Your content here...",
    "voice": {
      "languageCode": "en-GB",
      "name": "en-GB-Neural2-F",
      "ssmlGender": "FEMALE"
    },
    "audioConfig": {
      "audioEncoding": "MP3",
      "speakingRate": 1.0,
      "pitch": 0.0,
      "volumeGainDb": 0.0
    }
  }'
```

**Via Code:**
Update the default voice in `src/services/audioGenerator.ts` line 53.

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

### Prerequisites
- Node.js 18+ and npm
- Google Cloud Project with APIs enabled
- Google Cloud Service Account with credentials

### Setup Instructions

#### 1. Google Cloud Setup
1. **Create a Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Required APIs**:
   - Google Docs API
   - Google Cloud Text-to-Speech API
   - Ensure both APIs are enabled for your project

3. **Create Service Account**:
   - Go to "IAM & Admin" > "Service Accounts"
   - Create new service account
   - Download JSON credentials file
   - Place in project root as `credentials.json`

#### 2. Project Setup
```bash
# Clone and install dependencies
git clone <repository-url>
cd bookreaderagent
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials path
```

#### 3. Environment Configuration
Create `.env` file:
```env
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
GOOGLE_PROJECT_ID=your-project-id
PORT=3000
NODE_ENV=development
TTS_OUTPUT_DIR=./audio
```

#### 4. Run Tests
```bash
npm test
npm run test:coverage
```

### Authentication

**Current**: Service Account Authentication
- Server-to-server authentication for development
- Manual credential management
- Best for backend services and automated processes

**Future**: OAuth2 User Authentication
- User login through web/mobile interface
- Access to user's own Google Docs
- Better security and user experience
- Mobile app compatibility

---

*Transform your reading experience into an interactive audio journey with the Book Reader Agent.*
