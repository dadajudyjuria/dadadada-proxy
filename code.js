const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// ตัวแปรเก็บลิงก์สตรีมล่าสุด
let currentStreamUrl = '';

// 1. Endpoint สำหรับรับค่าลิงก์ใหม่จาก GitHub Actions
app.post('/update-link', (req, res) => {
    const { streamUrl } = req.body;
    if (!streamUrl) {
        return res.status(400).json({ error: 'streamUrl is required' });
    }
    currentStreamUrl = streamUrl;
    console.log('Updated stream URL:', currentStreamUrl);
    res.json({ success: true, message: 'Stream URL updated successfully' });
});

// 2. Endpoint สำหรับแปลงลิงก์ M3U8 (Proxy ดึงสตรีมพร้อมแนบ Header กันโดนบล็อก)
app.get('/live.m3u8', async (req, res) => {
    if (!currentStreamUrl) {
        return res.status(404).send('Error loading stream: No stream URL provided');
    }

    try {
        console.log('Attempting to fetch stream from:', currentStreamUrl);
        
        const response = await axios({
            method: 'get',
            url: currentStreamUrl,
            headers: {
                'Referer': 'https://kickskall.com/',
                'Origin': 'https://kickskall.com',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            responseType: 'stream'
        });

        response.data.pipe(res);
    } catch (error) {
        console.error('Proxy error details:', error.response ? error.response.status : error.message);
        res.status(500).send(`Error loading stream: ${error.message}`);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
