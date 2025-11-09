# Audio Directory

Add your furniture descriptions and audio files here.

## Required Audio Files

1. **chairs-description.mp3**
   - Audio description of chairs category
   - Example: "Welcome to our chairs collection. We have ergonomic office chairs, dining chairs, bar stools, and more. All designed for comfort and style..."

2. **decor-description.mp3**
   - Audio description of home decor category
   - Example: "Explore our home decor collection featuring lamps, wall art, mirrors, and accessories to beautify your space..."

## Audio Specifications

- **Format**: MP3
- **Bitrate**: 128 kbps or higher
- **Sample Rate**: 44.1 kHz
- **Duration**: 15-30 seconds recommended
- **File Size**: Keep under 1MB

## How to Create Audio Files

### Option 1: Record Your Own Voice

1. **Using Phone**:
   - Use voice recorder app
   - Find a quiet place
   - Speak clearly and enthusiastically
   - Convert to MP3 if needed

2. **Using Computer**:
   - Audacity (Free): https://www.audacityteam.org/
   - Adobe Audition (Paid)
   - Online recorders

### Option 2: Text-to-Speech (TTS)

**Free TTS Tools:**
- Google Text-to-Speech
- Microsoft Azure TTS (Free tier)
- Natural Reader: https://www.naturalreaders.com/
- TTSMaker: https://ttsmaker.com/

**Premium TTS (Better Quality):**
- Amazon Polly
- Google Cloud TTS
- Microsoft Azure TTS
- ElevenLabs (Very natural)

### Option 3: Hire Voice Artist

- Fiverr: Starting from $5
- Upwork: Professional voice artists
- Voices.com: High-quality recordings

## Sample Script Templates

### Chairs Description
```
Welcome to our chairs collection! We offer a wide range of seating solutions including
ergonomic office chairs, stylish dining chairs, comfortable lounge chairs, and modern
bar stools. Each piece is carefully selected for quality, comfort, and design.
Visit our showroom to try them out!
```

### Decor Description
```
Discover our home decor collection featuring elegant lamps, beautiful wall art,
decorative mirrors, and unique accessories. Transform your space with our curated
selection of decorative pieces that add personality and charm to any room.
Browse our collection today!
```

## Audio Editing Tips

1. Remove background noise
2. Normalize volume levels
3. Add fade in/out (1 second)
4. Keep it professional and friendly
5. Use clear pronunciation

## Conversion Tools

**Online Converters:**
- CloudConvert: https://cloudconvert.com/
- FreeConvert: https://www.freeconvert.com/
- Zamzar: https://www.zamzar.com/

**Desktop Tools:**
- Audacity (Free)
- Format Factory (Free)
- FFmpeg (Command-line)

## Example FFmpeg Command

```bash
ffmpeg -i input.wav -codec:a libmp3lame -b:a 128k output.mp3
```

This converts any audio file to MP3 format.
