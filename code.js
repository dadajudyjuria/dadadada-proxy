const express = require('express');
const axios = require('axios');
const url = require('url');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let liveStreams = {
    ch1: '',
    ch2: ''
};

app.post('/update-link', (req, res) => {
    const { channel, streamUrl } = req.body;
    if (!channel || !streamUrl) {
        return res.status(400).send("Missing channel or streamUrl");
    }
    liveStreams[channel] = streamUrl;
    console.log(`[Update] อัปเดตลิงก์ช่อง ${channel} สำเร็จ!`);
    res.send({ status: 'success', channel, streamUrl });
});

app.get('/live.m3u8', async (req, res) => {
    try {
        const channel = req.query.ch || 'ch1';
        const currentStreamUrl = liveStreams[channel];

        if (!currentStreamUrl) {
            return res.status(400).send("ยังไม่มีการส่งลิงก์สดเข้ามา กรุณารอสักครู่...");
        }

        const response = await axios.get(currentStreamUrl, {
            headers: {
                'Referer': 'https://kicksball.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        let m3u8Content = response.data;
        const baseUrl = currentStreamUrl.substring(0, currentStreamUrl.lastIndexOf('/') + 1);
        
        const lines = m3u8Content.split('\n');
        const modifiedLines = lines.map(line => {
            line = line.trim();
            if (line && !line.startsWith('#')) {
                const absoluteUrl = url.resolve(baseUrl, line);
                return `/segment?url=${encodeURIComponent(absoluteUrl)}`;
            }
            return line;
        });

        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        res.send(modifiedLines.join('\n'));
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Error loading stream or token expired");
    }
});

app.get('/segment', async (req, res) => {
    try {
        const targetSegmentUrl = req.query.url;
        if (!targetSegmentUrl) return res.status(400).send("Missing url");

        const response = await axios.get(targetSegmentUrl, {
            responseType: 'arraybuffer',
            headers: {
                'Referer': 'https://kicksball.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        res.setHeader('Content-Type', response.headers['content-type'] || 'video/mp2t');
        res.send(response.data);
    } catch (error) {
        res.status(500).send("Error fetching segment");
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
