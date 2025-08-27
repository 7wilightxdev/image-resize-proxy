# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Netlify Functions-based image resize proxy that uses Jimp for image processing. The service accepts image URLs via query parameters and returns resized images optimized for web delivery.

## Architecture

- **Platform**: Netlify Functions (serverless)
- **Runtime**: Node.js with ES modules
- **Image Processing**: Jimp library (Netlify-compatible alternative to Sharp)
- **Build System**: ESBuild (via Netlify)
- **Function Location**: `netlify/functions/resize.js`

### Core Function

The main resize function (`netlify/functions/resize.js`) handles:
- Fetching images from Google Cloud Storage pre-signed URLs
- Resizing with cover fit mode (crops and scales to exact dimensions)
- JPEG output with configurable quality
- Base64 encoding for Netlify Functions response format
- Comprehensive error handling with Vietnamese error messages

### API Parameters

- `url`: Image URL (required)
- `w`: Width in pixels (default: 800)
- `h`: Height in pixels (default: 600) 
- `q`: JPEG quality 0-100 (default: 85)

## Development Commands

```bash
# Start local development server
npm run dev

# Deploy to production
npm run deploy

# Build (no-op - Netlify handles build)
npm run build
```

## Configuration

- **netlify.toml**: Defines function directory, redirects API routes to functions, and sets ESBuild as the Node.js bundler
- **Redirects**: All `/api/*` requests route to `/.netlify/functions/*`

## Dependencies

- **jimp**: Image processing library chosen for Netlify compatibility
- **netlify-cli**: Development and deployment tools

## Key Implementation Details

- Uses `cover()` method for aspect-ratio preserving resize with cropping
- Returns images as base64-encoded responses with proper MIME types
- Implements aggressive caching headers (`max-age=31536000`)
- CORS-enabled with `Access-Control-Allow-Origin: *`
- Comprehensive error handling for missing URLs, fetch failures, and processing errors