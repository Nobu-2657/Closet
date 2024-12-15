const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// MongoDBに接続
mongoose.connect('mongodb://localhost/your_database', { useNewUrlParser: true, useUnifiedTopology: true });

// 画像保存用のディレクトリを作成
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// multerの設定
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '.jpg')
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MBに制限を増やす
    }
});

// 画像データ用のMongooseスキーマ
const imageSchema = new mongoose.Schema({
    imageUrl: { type: String, required: true },
    userId: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    temperature: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

// DailyInfoモデルの定義
const dailyInfoSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    date: { type: Date, required: true },
    //departureTime: { type: String, required: true },
    //returnTime: { type: String, required: true },
    clothesIds: { type: [String], required: true }
}, { timestamps: true });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

// 静的ファイルの提供
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 画像アップロード用のエンドポイント
app.post('/api/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { userId, name, category, temperature } = req.body;
        
        if (!userId || !name || !category || !temperature) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const imageUrl = `/uploads/${req.file.filename}`;
        const newImage = new Image({
            imageUrl,
            userId,
            name,
            category,
            temperature: Number(temperature)
        });

        await newImage.save();
        res.status(200).json({ 
            message: 'Upload successful',
            imageUrl: imageUrl,
            id: newImage._id
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: error.message });
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
            imageUrl: img.imageUrl,
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

const DailyInfo = mongoose.model('DailyInfo', dailyInfoSchema);

// 今日の服を登録
app.post('/api/register-outfit', async (req, res) => {
    try {
        const { userId, date, departureTime, returnTime, clothesIds } = req.body;
    
        // 新しいDailyInfoドキュメントを作成
        const newDailyInfo = new DailyInfo({
            userId,
            date,
            //departureTime,
            //returnTime,
            clothesIds
        });
    
        // データベースに保存
        await newDailyInfo.save();
    
        res.status(201).json({ message: 'Outfit registered successfully', dailyInfo: newDailyInfo });
    } catch (error) {
        console.error('Error registering outfit:', error);
        res.status(500).json({ message: 'Failed to register outfit', error: error.message });
    }
});

app.delete('/api/delete', async (req, res) => {
    const { id, userId } = req.body;

    try {
        // 画像データを検索
        const image = await Image.findOne({ _id: id, userId: userId });
        
        if (!image) {
            return res.status(404).json({ message: '衣類が見つかりません' });
        }

        // 画像ファイルのパスを取得
        const imagePath = path.join(__dirname, image.imageUrl);

        // データベースから画像データを削除
        await Image.findOneAndDelete({ _id: id, userId: userId });

        // 実際の画像ファイルを削除
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        res.json({ message: '衣類が正常に削除されました' });
    } catch (error) {
        console.error('Error deleting clothing:', error);
        res.status(500).json({ message: '衣類の削除中にエラーが発生しました' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});