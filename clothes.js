const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// MongoDB接続設定
const mongoURI = 'mongodb://localhost:27017/your_database'; // MongoDBのURIを指定
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// 画像データ用のMongooseスキーマ
const imageSchema = new mongoose.Schema({
    base64: { type: String, required: true }, // 'image'を'base64'に変更
    createdAt: { type: Date, default: Date.now }
});

const app = express();
const PORT = process.env.PORT || 3001;

// CORS設定
app.use(cors());

// 画像サイズ指定
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// JSONリクエストボディを解析
app.use(bodyParser.json({ limit: '10mb' })); // 最大10MBまでのリクエストボディを許可

// 画像アップロード用のエンドポイント
app.post('/api/upload', async (req, res) => {
    const { image } = req.body;

    if (!image) {
        return res.status(400).json({ message: 'Image data is required.' });
    }

    try {
        // 画像データをMongoDBに保存
        const newImage = new Image({ base64: image }); // 'image'を'base64'に変更
        await newImage.save();

        res.status(200).json({ message: 'Image uploaded successfully.', id: newImage._id });
    } catch (error) {
        console.error('Error saving the image:', error);
        res.status(500).json({ message: 'Failed to save the image.' });
    }
});

const Image = mongoose.model('Image', imageSchema);

// すべての画像を取得するエンドポイント
app.get('/api/images', async (req, res) => {
    try {
        const images = await Image.find({});
        res.json(images.map(img => ({
            id: img._id,
            base64: img.base64,
            createdAt: img.createdAt
        })));
    } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).json({ message: 'Error fetching images' });
    }
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});