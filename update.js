const axios = require('axios');

const RENDER_API = process.env.RENDER_API_URL;
const STREAM_URL = process.env.STREAM_URL;
const CHANNEL = process.env.CHANNEL || 'ch1';

async function sendUpdate() {
    try {
        if (!RENDER_API || !STREAM_URL) {
            console.error('กรุณาตั้งค่า Environment Variables ใน GitHub Secrets');
            process.exit(1);
        }

        console.log(`กำลังส่งลิงก์อัปเดตช่อง ${CHANNEL} ไปที่ Render...`);
        await axios.post(RENDER_API, {
            channel: CHANNEL,
            streamUrl: STREAM_URL
        });
        console.log('อัปเดตลิงก์สำเร็จเรียบร้อย!');
    } catch (error) {
        console.error('อัปเดตไม่สำเร็จ:', error.message);
        process.exit(1);
    }
}

sendUpdate();
