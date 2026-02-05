import express from 'express';
import Novel from '../models/Novel.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// READ: 全小説取得
router.get('/', async (req, res) => {
  try {
    const novels = await Novel.find().sort({ postedAt: -1 }).populate('userId', 'username');
    res.json(novels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ: 特定の小説取得
router.get('/:id', async (req, res) => {
  try {
    const novel = await Novel.findById(req.params.id).populate('userId', 'username');
    if (!novel) {
      return res.status(404).json({ error: '小説が見つかりません' });
    }
    res.json(novel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE: 新規小説投稿（認証必須）
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, author, description, rating, genre } = req.body;

    // バリデーション
    if (!title || !author || !description) {
      return res.status(400).json({ error: 'タイトル、著者、説明は必須です' });
    }

    const novel = new Novel({
      title,
      author,
      description,
      rating,
      genre,
      userId: req.userId,
      username: req.username,
    });

    const savedNovel = await novel.save();
    res.status(201).json(savedNovel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE: 小説削除（認証必須・所有者のみ）
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const novel = await Novel.findById(req.params.id);
    
    if (!novel) {
      return res.status(404).json({ error: '小説が見つかりません' });
    }

    // 所有者確認
    if (novel.userId.toString() !== req.userId) {
      return res.status(403).json({ error: '削除権限がありません' });
    }

    await Novel.findByIdAndDelete(req.params.id);
    res.json({ message: '小説を削除しました', novel });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE: 小説更新（認証必須・所有者のみ）
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, author, description, rating, genre } = req.body;
    const novel = await Novel.findById(req.params.id);

    if (!novel) {
      return res.status(404).json({ error: '小説が見つかりません' });
    }

    // 所有者確認
    if (novel.userId.toString() !== req.userId) {
      return res.status(403).json({ error: '編集権限がありません' });
    }

    const updatedNovel = await Novel.findByIdAndUpdate(
      req.params.id,
      { title, author, description, rating, genre },
      { new: true }
    );
    res.json(updatedNovel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
