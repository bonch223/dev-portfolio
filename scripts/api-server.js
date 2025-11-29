import express from 'express';
import cors from 'cors';
import chatHandler from '../api/chat.js';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
    try {
        await chatHandler(req, res);
    } catch (error) {
        console.error('API Server Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal Server Error', details: error.message });
        }
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Local API Server running at http://localhost:${PORT}`);
});
