import mongoose from 'mongoose';

const novelSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: 5,
    min: 1,
    max: 5,
  },
  genre: {
    type: String,
    default: '未分類',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  postedAt: {
    type: Date,
    default: Date.now,
  },
});

const Novel = mongoose.model('Novel', novelSchema);

export default Novel;
