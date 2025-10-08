# Voice Selection Testing Guide

This guide will help you verify that the voice selection fix is working correctly.

## Quick Test (Recommended)

Run the automated test script:

```bash
npm run build
node test-voice-selection.js
```

This will:
- Generate 3 audio files with different voices
- Compare file sizes (different sizes = different voices)
- Provide clear success/failure indicators
- Give you file paths to listen to

**Expected Result:** Three files with different sizes, and each sounds distinctly different when played.

---

## Manual Testing Methods

### Method 1: Test via Direct API Call

Start your server:
```bash
npm start
# or
npm run dev
```

In another terminal, test generating a single chapter with a custom voice:

```bash
# Test with Wavenet-C voice
curl -X POST http://localhost:3000/api/books/generate-chapter \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "test-doc",
    "chapterId": "test-chapter-1",
    "chapterTitle": "Voice Test Wavenet-C",
    "chapterContent": "This is a test of the Wavenet-C voice. It should sound different from the default Neural2-A voice. If you hear a distinct voice, the fix is working correctly.",
    "voice": {
      "languageCode": "en-GB",
      "name": "en-GB-Wavenet-C",
      "ssmlGender": "FEMALE"
    }
  }'
```

Then test with Neural2-F:
```bash
curl -X POST http://localhost:3000/api/books/generate-chapter \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "test-doc",
    "chapterId": "test-chapter-2",
    "chapterTitle": "Voice Test Neural2-F",
    "chapterContent": "This is a test of the Neural2-F voice. It should sound smooth and professional, different from both Neural2-A and Wavenet-C voices.",
    "voice": {
      "languageCode": "en-GB",
      "name": "en-GB-Neural2-F",
      "ssmlGender": "FEMALE"
    }
  }'
```

The audio files will be in: `./audio/test-doc/`

### Method 2: Test Full Document Processing

Process a document with a custom voice:

```bash
curl -X POST http://localhost:3000/api/books/process \
  -H "Content-Type: application/json" \
  -d '{
    "documentUrl": "YOUR_GOOGLE_DOC_URL",
    "voice": {
      "languageCode": "en-GB",
      "name": "en-GB-Wavenet-A",
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

This will return a `jobId`. Check the status:
```bash
curl http://localhost:3000/api/books/status/{jobId}
```

### Method 3: Compare with Voice Samples

Your `voice-samples/` directory contains reference samples. Compare new generations:

```bash
# Listen to reference Neural2-A
open voice-samples/en-GB-Neural2-A.mp3

# Listen to reference Wavenet-C
open voice-samples/en-GB-Wavenet-C.mp3

# Listen to your test generation
open voice-selection-test/voice-test-*.mp3
```

---

## What to Listen For

When comparing voices, you should hear differences in:

1. **Accent/Pronunciation** - Subtle variations in British English pronunciation
2. **Tone** - Some voices are warmer, others more professional
3. **Pitch** - Each voice has a slightly different pitch range
4. **Rhythm** - Speaking pace and natural pauses vary
5. **Quality** - Neural2 and Wavenet should sound more natural than Standard voices

---

## Troubleshooting

### All files sound the same?

**Problem:** Voice options are not being passed through.

**Check:**
1. Verify you rebuilt after changes: `npm run build`
2. Check server logs for any errors
3. Ensure the voice name is spelled correctly (case-sensitive!)
4. Verify the voice exists: `node list-voices.js | grep Neural2`

### Getting errors?

**Error: Voice not found**
- The voice name might be misspelled
- Run `node list-voices.js` to see all available voices
- Ensure your GCP account has access to Neural2/Wavenet voices

**Error: Permission denied**
- Check your `GOOGLE_APPLICATION_CREDENTIALS` environment variable
- Verify the service account has Text-to-Speech permissions

### Files have same size?

If all generated files have exactly the same byte size, the same voice is being used. This means:
- The voice parameter is not being passed
- There's a regression in the code
- The voice name is invalid and it's falling back to default

---

## Success Indicators

✅ **Fix is Working When:**
- Files have different sizes (typically vary by 5-15%)
- Each voice sounds distinctly different when played
- The file size matches the expected range for each voice type
- Server logs show the correct voice name being used

❌ **Fix is NOT Working When:**
- All files have identical sizes
- All voices sound exactly the same
- Only default voice (Neural2-A) is ever used
- Voice parameter changes don't affect output

---

## Testing Checklist

- [ ] Run automated test script (`node test-voice-selection.js`)
- [ ] Verify files have different sizes
- [ ] Listen to each generated file
- [ ] Confirm voices sound distinctly different
- [ ] Test via API endpoint with curl
- [ ] Test with at least 3 different voices
- [ ] Compare with reference samples in `voice-samples/`
- [ ] Test full document processing with custom voice
- [ ] Verify server logs show correct voice names

---

## Need Help?

If the voices still don't work after testing:
1. Check the TypeScript is compiled: `npm run build`
2. Restart your server completely
3. Review server console logs for errors
4. Verify GCP credentials and permissions
5. Check that voice names match exactly (case-sensitive)
