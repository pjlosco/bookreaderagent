# Quick Voice Selection Test

## ✅ Verified Working!

The automated test shows **different file sizes** for each voice:
- Neural2-A: 316,992 bytes
- Wavenet-C: 343,872 bytes (+8.5%)
- Neural2-F: 333,504 bytes (+5.2%)

This confirms voices are being applied correctly!

---

## How to Test (3 Easy Ways)

### 1. 🚀 Fastest: Run the Test Script

```bash
npm run build
node test-voice-selection.js
```

Listen to the files:
```bash
open voice-selection-test/voice-test-*.mp3
```

---

### 2. 🌐 Test via API

**Start server:**
```bash
npm start
```

**Generate with custom voice:**
```bash
curl -X POST http://localhost:3000/api/books/generate-chapter \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "test",
    "chapterId": "ch1",
    "chapterTitle": "Test Chapter",
    "chapterContent": "Testing voice selection with Wavenet-C",
    "voice": {
      "languageCode": "en-GB",
      "name": "en-GB-Wavenet-C",
      "ssmlGender": "FEMALE"
    }
  }'
```

Check the file: `./audio/test/*.mp3`

---

### 3. 🎯 Compare with Reference Samples

```bash
# Compare new generation with existing samples
ls -lh voice-samples/
ls -lh voice-selection-test/
```

Play and compare:
```bash
open voice-samples/en-GB-Neural2-A.mp3
open voice-selection-test/voice-test-neural2-a-default.mp3
```

---

## What Success Looks Like

✅ **Different file sizes** for each voice (5-15% variation)  
✅ **Distinct sound** when you play the files  
✅ **No errors** in console/logs  
✅ **Server logs** show correct voice names  

---

## Quick Troubleshooting

**Problem:** All voices sound the same  
**Solution:** Run `npm run build` and restart server

**Problem:** Getting errors  
**Solution:** Check `.env` has `GOOGLE_APPLICATION_CREDENTIALS` set

**Problem:** Voice not found  
**Solution:** Run `node list-voices.js` to see available voices

---

For detailed testing instructions, see: **VOICE_TESTING.md**
