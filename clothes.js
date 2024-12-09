const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// MongoDB接続設定
const mongoURI = 'mongodb://localhost:27017/your_database';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// 画像データ用のMongooseスキーマ
const imageSchema = new mongoose.Schema({
    base64: { type: String, required: true },
    userId: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    temperature: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// 画像アップロード用のエンドポイント
app.post('/api/upload', async (req, res) => {
    const { image, userId, name, category, temperature } = req.body;

    if (!image || !userId || !name || !category || temperature === undefined) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const newImage = new Image({
            base64: image,
            userId,
            name,
            category,
            temperature
        });
        await newImage.save();

        res.status(200).json({ message: 'Image uploaded successfully.', id: newImage._id });
    } catch (error) {
        console.error('Error saving the image:', error);
        res.status(500).json({ message: 'Failed to save the image.' });
    }
});

const Image = mongoose.model('Image', imageSchema);

// すべての画像を取得するエンドポイント（ユーザーIDでフィルタリング）
app.get('/api/images', async (req, res) => {
    const userId = req.query.userId;

    try {
        const images = await Image.find({ userId });
        res.json(images.map(img => ({
            id: img._id,
            base64: img.base64,
            name: img.name,
            category: img.category,
            temperature: img.temperature,
            createdAt: img.createdAt
        })));
    } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).json({ message: 'Error fetching images' });
    }
});

app.put('/api/update', async (req, res) => {
    const { id, userId, name, category, temperature } = req.body;

    try {
        const updatedClothing = await Image.findOneAndUpdate(
        { _id: id, userId: userId },
        { name, category, temperature },
        { new: true }
        );

        if (!updatedClothing) {
        return res.status(404).json({ message: '衣類が見つかりません' });
        }

        res.json(updatedClothing);
    } catch (error) {
        console.error('Error updating clothing:', error);
        res.status(500).json({ message: '衣類の更新中にエラーが発生しました' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});