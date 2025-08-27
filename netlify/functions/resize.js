const sharp = require('sharp');

exports.handler = async (event, context) => {
    try {
        const { url, w = '800', h = '600', q = '85' } = event.queryStringParameters || {};

        if (!url) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Missing url parameter' })
            };
        }

        console.log(`Processing image: ${url} -> ${w}x${h}`);

        // Fetch image from GCS pre-signed URL
        const response = await fetch(url);
        if (!response.ok) {
            return {
                statusCode: 404,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Image not found' })
            };
        }

        const imageBuffer = Buffer.from(await response.arrayBuffer());
        console.log(`Original image size: ${imageBuffer.length} bytes`);

        // Resize with Sharp (optimized for large images)
        const resizedBuffer = await sharp(imageBuffer, {
            limitInputPixels: false,    // Allow very large images
            sequentialRead: true        // Sequential read to save memory
        })
            .resize(parseInt(w), parseInt(h), {
                fit: 'cover',
                withoutEnlargement: false,
                kernel: sharp.kernel.lanczos3
            })
            .jpeg({
                quality: parseInt(q),
                progressive: true,
                mozjpeg: true
            })
            .toBuffer();

        console.log(`Resized image size: ${resizedBuffer.length} bytes`);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'image/jpeg',
                // 'Cache-Control': 'public, max-age=31536000',
                'Content-Length': resizedBuffer.length.toString(),
                'Access-Control-Allow-Origin': '*'
            },
            body: resizedBuffer.toString('base64'),
            isBase64Encoded: true
        };

    } catch (error) {
        console.error('Error processing image:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error: 'Error processing image',
                details: error.message
            })
        };
    }
};