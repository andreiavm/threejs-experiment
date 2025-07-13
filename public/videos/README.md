# Video Cube Setup

## Adding Videos to the Cube

To display videos on each face of the cube, add video files to this `public/videos/` directory with the following names:

- `video1.mp4` - Front face
- `video2.mp4` - Back face  
- `video3.mp4` - Right face
- `video4.mp4` - Left face
- `video5.mp4` - Top face
- `video6.mp4` - Bottom face

## Supported Formats
- MP4 (recommended)
- WebM
- OGG

## Video Requirements
- Keep file sizes reasonable for web performance
- Videos will automatically loop
- Videos are muted by default (required for autoplay)

## Fallback
If video files are not found, the cube will display colored faces with labels as fallback.

## Customization
You can modify the video sources in `/src/components/VideoCube.jsx` to use:
- Different file names
- External video URLs
- Streaming video sources
