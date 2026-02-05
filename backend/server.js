import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import novelRoutes from './routes/novels.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ミドルウェア
app.use(cors());
app.use(express.json());

// MongoDB接続
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB接続成功'))
  .catch((err) => console.error('❌ MongoDB接続エラー:', err));

// APIルート
app.use('/api/auth', authRoutes);
app.use('/api/novels', novelRoutes);

// サーバー起動
app.listen(PORT, () => {
  console.log(`🚀 サーバー起動: http://localhost:${PORT}`);
});
