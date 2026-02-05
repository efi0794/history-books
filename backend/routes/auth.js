import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// 登録エンドポイント
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // バリデーション
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'すべてのフィールドが必須です' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'パスワードが一致しません' });
    }

    // 既存ユーザー確認
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({ error: 'ユーザー名またはメールアドレスは既に使用されています' });
    }

    // 新規ユーザー作成
    const user = new User({ username, email, password });
    await user.save();

    // JWT トークン生成
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: '登録成功',
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ログインエンドポイント
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // バリデーション
    if (!email || !password) {
      return res.status(400).json({ error: 'メールアドレスとパスワードが必須です' });
    }

    // ユーザー検索
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'メールアドレスまたはパスワードが正しくありません' });
    }

    // パスワード検証
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'メールアドレスまたはパスワードが正しくありません' });
    }

    // JWT トークン生成
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'ログイン成功',
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ユーザー情報取得エンドポイント（認証必須）
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: '認証トークンが見つかりません' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    res.json(user);
  } catch (error) {
    res.status(401).json({ error: '無効なトークンです' });
  }
});

export default router;
