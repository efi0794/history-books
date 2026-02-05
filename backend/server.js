import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import novelRoutes from './routes/novels.js';
import authRoutes from './routes/auth.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ミドルウェア
app.use(cors());
app.use(express.json());
// フロントエンドの静的ファイル提供
app.use(express.static(path.join(__dirname, '../frontend')));

// MongoDB接続
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB接続成功'))
  .catch((err) => console.error('❌ MongoDB接続エラー:', err));

// APIルート
app.use('/api/auth', authRoutes);
app.use('/api/novels', novelRoutes);

// SPA: 全てのルートでindex.htmlを返す
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`🚀 サーバー起動: http://localhost:${PORT}`);
});
