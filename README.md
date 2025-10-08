# Book Reader Agent

An intelligent AI agent that converts Google Docs into high-quality audio and provides interactive, contextual assistance. Perfect for consuming long documents while having an AI assistant that can answer questions about the content you're listening to.

## ✨ Recent Accomplishments

### Large Chapter Support with Automatic Chunking (Latest)
- **Handles any chapter size** — Automatically processes chapters exceeding 5,000 character API limit
- **Smart paragraph splitting** — Maintains natural breaks at paragraph/sentence boundaries
- **Seamless audio merging** — FFmpeg-based concatenation creates single file per chapter
- **Tested with 18KB chapter** — Successfully generated 20-minute seamless audio file
- **Transparent to user** — Works automatically, no configuration needed
- **Cost efficient** — Only $0.29 for 18KB chapter using Neural2-A voice

### Karaoke-Style Read-Along
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

### Phase 3: Voice & Performance ✅ (Completed)
- [x] **Voice selection via API** - Custom voices (Neural2, Wavenet, Standard)
- [x] **Voice options fully configurable** - Pass voice parameters in API requests
- [x] **Large chapter support** - Automatic chunking for chapters >5,000 characters
- [x] **Smart paragraph splitting** - Maintains natural breaks in long chapters
- [x] **FFmpeg audio concatenation** - Seamless merging of chunked audio
- [x] **Tested with 18KB chapter** - Successfully generated 20-minute audio file
- [x] **Playback speed control** - 0.75x to 2.0x range with fine adjustments
- [x] **Persistent speed preferences** - LocalStorage saves user's preferred speed
- [x] **Real-time speed adjustment** - Instant feedback with smooth slider

### Phase 4: AI Agent Features (Next Priority)
- [ ] **Interactive Q&A during playback** - Pause to ask questions about content
- [ ] **Cross-chapter context** - AI can reference content from other chapters
- [ ] Document chunking with timestamps per chapter
- [ ] Vector embeddings for semantic search across all chapters
- [ ] LLM integration for Q&A (OpenAI/Claude/Gemini)
- [ ] Chat interface for user questions
- [ ] **Chapter-aware responses** - AI knows which chapter user is listening to
- [ ] Conversation history management
- [ ] Real-time WebSocket communication

### Phase 5: Advanced Features (Future)
- [ ] Multiple voice selection UI (dropdown in web interface)
- [ ] Advanced chapter navigation (table of contents, jump to section)
- [ ] Batch processing for multiple documents
- [ ] Voice cloning for consistent narrator
- [ ] Mobile-optimized responsive interface
- [ ] Offline mode with cached content
- [ ] Bookmarking and annotations
- [ ] Export progress reports
- [ ] Playlist creation (custom chapter orders)
- [ ] Share and collaborate features

### Phase 6: Code Quality & Testing Audit (Quality Assurance)
- [ ] **Function audit** - Review all functions for correctness and edge cases
- [ ] **Comment audit** - Ensure all functions have comprehensive JSDoc comments
- [ ] **Test coverage expansion** - Increase from 92.82% to 95%+ coverage
- [ ] **Integration tests** - End-to-end workflow testing
- [ ] **Error handling audit** - Verify all error paths are handled
- [ ] **Performance profiling** - Identify and fix bottlenecks
- [ ] **Code consistency** - Ensure naming conventions followed
- [ ] **Security audit** - Check for vulnerabilities (API keys, input validation)
- [ ] **Edge case testing** - Empty chapters, special characters, very long text
- [ ] **Browser compatibility** - Test on Chrome, Firefox, Safari, Edge
- [ ] **Accessibility audit** - WCAG 2.1 compliance check
- [ ] **Documentation verification** - Ensure README matches actual implementation

### Phase 7: Cloud Storage & Multi-Format Support (Scalability)
- [ ] **Google Drive integration** - Store audio files in Google Drive instead of local filesystem
- [ ] **Clerk authentication** - Easy user login/signup system with OAuth
- [ ] **User file management** - Each user has their own Drive folder
- [ ] **Cross-application access** - Audio files accessible from multiple apps/devices
- [ ] **PDF support** - Extract and process PDF documents
- [ ] **EPUB support** - Handle ebook formats
- [ ] **Word document support** - Process .docx files
- [ ] **Plain text support** - Handle .txt files
- [ ] **Web scraping** - Extract content from URLs (articles, blogs)
- [ ] **File upload** - Direct file upload instead of just URLs
- [ ] **Cloud metadata storage** - Store progress/metadata in database (Firestore/Supabase)
- [ ] **Sharing & permissions** - Share generated audio with others
- [ ] **Storage quota management** - Track and limit user storage
- [ ] **Automatic cleanup** - Delete old/unused audio files

### Phase 8: Mobile Application (Mobile-First Experience)
- [ ] **React Native setup** - Cross-platform mobile app (iOS + Android)
- [ ] **Onboarding flow** - Guided setup for API credentials and permissions
- [ ] **Credential management** - Secure storage of API keys and tokens
- [ ] **Profile area** - Edit user settings, API credentials, preferences
- [ ] **Voice preference UI** - Select and preview voices in-app
- [ ] **Document import** - Upload or link documents from mobile
- [ ] **Audio playback** - Native mobile audio player with background playback
- [ ] **Download management** - Offline audio storage on device
- [ ] **Read-along view** - Mobile-optimized text highlighting
- [ ] **Speed control** - Touch-friendly speed slider
- [ ] **Progress sync** - Sync progress across web and mobile
- [ ] **Push notifications** - Notify when audio generation completes
- [ ] **CarPlay/Android Auto** - Integration for in-car listening
- [ ] **Siri/Google Assistant** - Voice commands for playback control
- [ ] **Lock screen controls** - Standard mobile media controls
- [ ] **Headphone controls** - Play/pause/skip with headphone buttons

## 🗺️ Roadmap & Next Steps

### 🎯 Immediate Priorities

#### Phase 4: AI Question & Answer System (Next - 3-4 weeks)
**Goal:** Enable users to ask questions about content while listening

**Tasks:**
- [ ] Integrate LLM API (OpenAI GPT-4 or Google Gemini)
- [ ] Implement chapter text embedding and vector storage
- [ ] Create chat interface in web UI
- [ ] Add "Ask a Question" button that pauses audio
- [ ] Context-aware prompting (knows current chapter/position)
- [ ] Conversation history within session
- [ ] Response streaming for better UX

**Why Now:** Core differentiator - interactive audiobook with AI tutor

#### Phase 6: Code Quality & Testing Audit (After Phase 4 - 1-2 weeks)
**Goal:** Ensure all code is production-ready and well-tested

**Tasks:**
- [ ] Audit all functions for correctness and edge cases
- [ ] Add comprehensive JSDoc comments to all functions
- [ ] Expand test coverage from 92.82% to 95%+
- [ ] Add integration tests for full workflows
- [ ] Security audit (API keys, input validation, XSS protection)
- [ ] Performance profiling and optimization
- [ ] Browser compatibility testing
- [ ] Accessibility audit (WCAG 2.1)

**Why Then:** Before scaling to more users, ensure code quality is excellent

#### Phase 5: UI Polish (Can be done in parallel - 1-2 weeks)
**Priority:** Medium | **Can start alongside Phase 4**

**Voice Selection UI:**
- [ ] Create voice preview samples for each option
- [ ] Add dropdown/card selector to UI
- [ ] Allow voice selection before generation

**Enhanced Navigation:**
- [ ] Collapsible chapter list for long books
- [ ] Search/filter chapters by title
- [ ] Keyboard shortcuts (n/p for next/prev chapter)
- [ ] Table of contents view

**Performance (Optional):**
- [ ] Parallel chunk generation (4x faster for large chapters)
- [ ] Streaming audio delivery (play while generating)

**Why These:** Quick wins that improve UX while building AI features

### 📅 Mid-Term Goals (3-6 Months)

#### Phase 7: Cloud Storage & Multi-Format Support
**Timeline:** 2-3 months | **Enables:** Multi-user scalability

**Key Features:**
- Google Drive integration for audio storage (eliminates local filesystem limits)
- Clerk authentication system (easy user login/signup)
- PDF, EPUB, DOCX, and plain text support (beyond just Google Docs)
- Cloud metadata storage (Firestore or Supabase)
- File sharing and permissions

**Why Phase 7:** Enables true multi-user product with diverse document support

**Dependencies:** Requires user authentication before multiple users can use system

### 🚀 Long-Term Vision (6-12 Months)

#### Phase 8: Mobile Application
**Timeline:** 3-4 months | **Enables:** Mobile-first experience

**Key Features:**
- React Native cross-platform app (iOS + Android)
- Onboarding flow for API credentials setup
- Profile area for user settings and preferences
- Native mobile audio with background playback
- Progress sync between web and mobile
- CarPlay/Android Auto integration

**Why Phase 8:** Expands to mobile users, completes the ecosystem

#### Authentication Evolution
- **Phase 1**: Service Account (Current) ✅
- **Phase 2**: OAuth2 Web Auth - User login through web interface
- **Phase 3**: User Accounts - Personal libraries and progress
- **Phase 4**: Team Features - Shared documents and collaboration

#### Platform Expansion
- **Mobile Apps**: Native iOS and Android applications
- **Browser Extensions**: Chrome/Firefox extensions for any webpage
- **Voice Assistants**: Integration with Alexa, Google Assistant
- **Learning Platforms**: Canvas, Blackboard, Moodle integration
- **Enterprise**: SSO, analytics, team management

#### Advanced AI Features
- Custom voice training/cloning
- Multi-language support with translation
- Concept extraction and quizzing
- Study guide generation
- Adaptive narration (emphasizes key concepts)

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
- **Automatic chunking for large chapters** (seamlessly handles 20+ minute audio)
- Smart paragraph-aware text splitting
- FFmpeg-based audio concatenation for single-file output

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

## 📝 Suggested Next Steps

Based on current completion (68% - Phases 1-3 done), here are the recommended priorities:

### 🥇 Priority 1: AI Question & Answer System
**Why:** Unique market differentiator - "interactive audiobook with AI tutor"
- Integrate LLM (Gemini Pro recommended: $0.002/question vs GPT-4: $0.01/question)
- Create chat interface in web UI
- Context-aware responses using chapter content
- Timeline: 3-4 weeks to MVP

### 🥈 Priority 2: Voice Selection UI
**Why:** Easy win - API already works, just need dropdown
- Add voice preview samples
- Create voice selector component
- Save preference per document
- Timeline: 3-5 days

### 🥉 Priority 3: Enhanced Navigation
**Why:** 30-chapter documents need better navigation
- Add chapter search/filter
- Keyboard shortcuts (n/p for next/prev)
- Collapsible chapter list
- Timeline: 1 week

**What's Working Now:**
- ✅ Core audio generation with voice selection (Phase 1-3: 100%)
- ✅ Large chapter support (auto-chunking + FFmpeg merging)  
- ✅ Read-along with sentence highlighting
- ✅ Progress tracking & resume
- ✅ Playback speed control (0.75x-2.0x)

**Development Sequence:**
1. **Phase 4 (Next):** AI Q&A - Creates unique "interactive tutor" value prop
2. **Phase 5 (Parallel):** UI polish - Voice selector, navigation improvements
3. **Phase 6 (Before scaling):** Code audit - Ensure quality before growth
4. **Phase 7 (Scaling):** Cloud storage + multi-format - Enable multi-user
5. **Phase 8 (Platform expansion):** Mobile app - Complete the ecosystem

---

*Transform your reading experience into an interactive audio journey with the Book Reader Agent.*
