# Large Chapter Audio Generation with Automatic Chunking

## Overview

The BookReaderAgent now supports **automatic chunking and concatenation** for large chapters that exceed Google Cloud Text-to-Speech API limits. The system intelligently splits content, generates audio for each part, and seamlessly merges them into a single audio file.

## The Problem

**Google Cloud TTS Limit:** 5,000 characters per request

**Example:** Chapter 4 from "Create the Future" book:
- **17,959 characters** (3.59x the limit)
- **3,050 words**
- **~20 minutes** of audio

Without chunking, this chapter would fail with an API error.

## The Solution

### Automatic Chunking Strategy

The system uses a **smart, paragraph-aware chunking algorithm**:

1. **Paragraph Boundaries:** Splits at `\n\n` (double newlines) to maintain natural flow
2. **Sentence Fallback:** If a paragraph is too large, splits at sentence boundaries  
3. **Safe Limit:** Uses 4,500 characters per chunk (leaving 500 char buffer)
4. **Natural Breaks:** Ensures no mid-sentence cuts

### Audio Concatenation with ffmpeg

After generating individual audio chunks:

1. **Generate Parts:** Creates `chapter-4-part1.mp3`, `chapter-4-part2.mp3`, etc.
2. **Merge:** Uses ffmpeg to concatenate without re-encoding (fast & lossless)
3. **Cleanup:** Automatically deletes temporary part files
4. **Result:** Single seamless `chapter-4.mp3` file

## Implementation

### Core Method: `generateChapterAudioWithChunking()`

```typescript
async generateChapterAudioWithChunking(
  chapterTitle: string,
  chapterContent: string,
  chapterId: string,
  options: TTSOptions = {}
): Promise<AudioFile>
```

**Features:**
- Automatically detects if chunking is needed
- Falls back to single request for small chapters (<4,500 chars)
- Provides console logging for progress tracking
- Returns single AudioFile object (user never sees the parts)

### Usage

**Automatic (Recommended):**
```typescript
// Controllers and DocumentProcessor now use chunking by default
const audioFile = await audioGenerator.generateChapterAudioWithChunking(
  title, content, id, options
);
```

**Manual:**
```typescript
// For small chapters that don't need chunking
const audioFile = await audioGenerator.generateChapterAudio(
  title, content, id, options
);
```

## Test Results

### Chapter 4 Test ("Making Decision Trees")

**Input:**
- 17,959 characters
- 3,050 words
- ID: `tab-6-chapter-4-making-decision-trees`

**Processing:**
- Split into **5 chunks**
- Generated 5 separate audio files
- Concatenated into single file
- **Total time:** 58.4 seconds

**Output:**
- **File:** `chapter-4-making-decision-trees.mp3`
- **Size:** 9.3 MB
- **Duration:** 20:12 (20 minutes 12 seconds)
- **Quality:** 64 kbps, mono, 24 kHz
- **Seamless:** No audible breaks between chunks

### Cost Analysis

**Voice:** Neural2-A ($16 per 1M characters)
**Chapter Cost:** $0.29

## Dependencies

### Required: ffmpeg

**Installation:**
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

**Node Package:**
```bash
npm install fluent-ffmpeg @types/fluent-ffmpeg
```

**Verification:**
```bash
which ffmpeg  # Should show path
ffmpeg -version  # Should show version info
```

## File Structure

### Generated Files

**Small Chapter (<4,500 chars):**
```
audio/
  └── documentId/
      └── chapter-title.mp3
```

**Large Chapter (>4,500 chars):**
```
audio/
  └── documentId/
      ├── chapter-title-part1.mp3(temporary, deleted after merge)
      ├── chapter-title-part2.mp3 (temporary, deleted after merge)
      ├── ...
      └── chapter-title.mp3(final merged file)
```

## Testing

### Test with Cached Chapter 4

```bash
# Run the test script
node test-chapter4-chunking.js

# Play the result
open test-data/chapter4-audio/chapter-4-making-decision-trees.mp3
```

### Analyze Chapter Size Before Generation

```bash
node analyze-chapter-size.js
```

**Output:**
- Character count
- Estimated chunks needed
- Estimated audio duration
- Estimated file size
- Cost estimation

## Advantages

### For Users
✅ **Single File:** No need to manage multiple audio files  
✅ **Seamless Playback:** No breaks or interruptions  
✅ **Better UX:** Just download and play  

### For System
✅ **Automatic:** Works transparently for all chapter sizes  
✅ **Efficient:** Only chunks when necessary  
✅ **Smart Splitting:** Natural paragraph boundaries  
✅ **Clean:** Auto-cleanup of temporary files  

## Limitations

### Performance
- **Multiple API Calls:** Large chapters take longer (proportional to chunks)
- **Network Dependency:** Each chunk is a separate TTS request
- **FFmpeg Dependency:** Requires ffmpeg to be installed

### Edge Cases
- **Very Long Paragraphs:** May need sentence-level splitting
- **No Paragraphs:** Falls back to sentence splitting
- **Single Long Sentence:** May exceed limit (rare in practice)

## Future Enhancements

### Potential Improvements
1. **Parallel Generation:** Generate multiple chunks simultaneously
2. **Progress Callbacks:** Real-time progress updates for UI
3. **Caching:** Cache chunk boundaries for regeneration
4. **Quality Options:** Different bitrates/codecs for output
5. **Streaming:** Stream parts as they're generated

### Alternative Approaches
1. **Client-Side Concatenation:** Send parts to browser, merge there
2. **S3/CDN Storage:** Store merged file in cloud storage
3. **Background Jobs:** Queue large chapters for async processing

## Configuration

### Tunable Parameters

**In `audioGenerator.ts`:**
```typescript
private readonly MAX_CHARS_PER_REQUEST = 4500;
```

**Adjust for:**
- **More Chunks:** Lower the limit (more API calls, smaller parts)
- **Fewer Chunks:** Raise the limit (fewer API calls, risk of API errors)
- **Recommended:** 4,500 is safe (500 char buffer under 5,000 limit)

## Troubleshooting

### Error: "ffmpeg: command not found"
**Solution:** Install ffmpeg (see Dependencies section)

### Error: "FFmpeg concatenation failed"
**Possible Causes:**
- FFmpeg not in PATH
- Disk space issue
- File permission problem

**Debug:**
```bash
# Check ffmpeg
which ffmpeg
ffmpeg -version

# Check disk space
df -h

# Check file permissions
ls -la audio/documentId/
```

### Chunks Taking Too Long
**Solutions:**
- Use faster TTS voice (Standard vs Neural2)
- Reduce speaking rate
- Consider parallel generation (future enhancement)

## Related Files

- **Implementation:** `src/services/audioGenerator.ts`
- **Controller:** `src/controllers/bookController.ts`  
- **Processor:** `src/services/documentProcessor.ts`
- **Test Script:** `test-chapter4-chunking.js`
- **Analysis:** `analyze-chapter-size.js`
- **Cached Data:** `test-data/chapter4-cached.json`

## Summary

The chunking feature enables the BookReaderAgent to handle chapters of **any length**, automatically breaking them into manageable pieces and delivering a single, seamless audio file to the user. This was successfully tested with a 18KB chapter generating a 20-minute audio file with no user-visible complexity.

