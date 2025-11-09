# Videos Directory

Add your furniture shop videos here. The website expects the following video files:

## Required Videos

1. **shop-tour.mp4** - Virtual shop tour video
   - Shows when user clicks "Virtual Shop Tour" button on home page
   - Recommended: 1-2 minute walkthrough of your shop

2. **beds-collection.mp4** - Beds category showcase
   - Displays when user clicks on Beds category with video icon
   - Show your best bed designs

3. **sofas-collection.mp4** (Optional)
4. **tables-collection.mp4** (Optional)
5. **default-collection.mp4** (Optional) - Fallback video

## Video Specifications

- **Format**: MP4 (H.264 codec recommended)
- **Resolution**: 1920x1080 (Full HD) or 1280x720 (HD)
- **Compression**: Use H.264 with medium to high quality
- **File Size**: Keep under 50MB for faster loading
- **Duration**: 30 seconds to 2 minutes optimal

## Tools for Compression

- **HandBrake**: https://handbrake.fr/ (Free, cross-platform)
- **FFmpeg**: Command-line tool for advanced users
- **Online tools**: CloudConvert, FreeConvert

## Example FFmpeg Command

```bash
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k output.mp4
```

This will compress your video while maintaining good quality.

## Tips

- Record videos in good lighting
- Use stable camera/phone (tripod recommended)
- Show different angles of furniture
- Add background music (royalty-free)
- Keep it professional and engaging
