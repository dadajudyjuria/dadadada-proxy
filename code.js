const express = require('express');
const axios = require('axios');
const dns = require('dns');

// บังคับให้ Node.js ใช้ DNS ของ Google เพื่อแก้ปัญหาหาโดเมนไม่เจอบน Cloud
dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = express();
app.use(express.json());

app.get('/live.m3u8', async (req, res) => {
    const streamUrl = process.env.STREAM_URL;
    
    if (!streamUrl) {
        return res.status(404).send('Error loading stream: No STREAM_URL environment variable provided');
    }

    try {
        console.log('Attempting to fetch stream from:', streamUrl);
        
        const response = await axios({
            method: 'get',
            url: streamUrl,
            headers: {
                'Accept': '*/*',
                'Origin': 'https://kicksball.com',
                'Referer': 'https://kicksball.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0'
            },
            responseType: 'stream'
        });

        response.data.pipe(res);
    } catch (error) {
        console.error('Proxy error details:', error.response ? error.response.status : error.message);
        res.status(500).send(`Error loading stream: ${error.message}`);
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
