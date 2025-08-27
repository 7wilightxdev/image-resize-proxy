const sharp = require('sharp');

exports.handler = async (event, context) => {
    try {
        const { url, w = '800', h = '600', q = '85' } = event.queryStringParameters || {};

        if (!url) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Thiếu tham số URL' })
            };
        }

        console.log(`Xử lý ảnh: ${url} -> ${w}x${h}`);

        // Fetch ảnh từ GCS pre-signed URL
        const response = await fetch(url);

        if (!response.ok) {
            return {
                statusCode: 404,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Không tìm thấy ảnh' })
            };
        }

        const imageBuffer = Buffer.from(await response.arrayBuffer());
        console.log(`Kích thước ảnh gốc: ${imageBuffer.length} bytes`);

        // Resize với Sharp (tối ưu cho ảnh lớn)
        const resizedBuffer = await sharp(imageBuffer, {
            limitInputPixels: false,    // Cho phép ảnh rất lớn
            sequentialRead: true        // Đọc tuần tự để tiết kiệm memory
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

        console.log(`Kích thước ảnh sau resize: ${resizedBuffer.length} bytes`);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'image/jpeg',
                'Cache-Control': 'public, max-age=31536000',
                'Content-Length': resizedBuffer.length.toString(),
                'Access-Control-Allow-Origin': '*'
            },
            body: resizedBuffer.toString('base64'),
            isBase64Encoded: true
        };

    } catch (error) {
        console.error('Lỗi xử lý ảnh:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error: 'Lỗi xử lý ảnh',
                details: error.message
            })
        };
    }
};