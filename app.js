const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

// MongoDBに接続
mongoose.connect('mongodb://localhost/your_database', { useNewUrlParser: true, useUnifiedTopology: true });

// ユーザーモデルの定義
const User = mongoose.model('User', {
    userId: String,
    email: String,
    password: String,
    displayName: String
});

// 新規登録API
app.post('/api/register', async (req, res) => {
    try {
        const { email, password, displayName } = req.body;

        // メールアドレスの重複チェック
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'このメールアドレスは既に登録されています' });
        }

        // ユニークなユーザIDの生成
        let userId;
        let isUnique = false;
        while (!isUnique) {
            userId = uuidv4();
            const existingUserId = await User.findOne({ userId });
            if (!existingUserId) {
                isUnique = true;
            }
        }

        // パスワードのハッシュ化
        const hashedPassword = await bcrypt.hash(password, 10);

        // 新規ユーザーの作成
        const newUser = new User({
            userId,
            email,
            password: hashedPassword,
            displayName
        });

        await newUser.save();

        res.status(201).json({ message: '登録が完了しました', displayName });
    } catch (error) {
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
});

// JWT秘密鍵の設定（実際の運用では環境変数などで安全に管理してください）
const JWT_SECRET = 'your_jwt_secret';

// ログインエンドポイント
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // メールアドレスでユーザーをデータベースから検索
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(401).json({ message: 'メールアドレスまたはパスワードが間違っています' });
        }

        // パスワードの照合
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'メールアドレスまたはパスワードが間違っています' });
        }

        // JWTトークンの生成
        const token = jwt.sign(
            { userId: user.userId },
            JWT_SECRET,
            { expiresIn: '1h' } // トークンの有効期限を1時間に設定
        );

        // ユーザー情報からパスワードを除外
        const { password: _, ...userInfo } = user.toObject();

        res.json({
            message: 'ログインに成功しました',
            token: token,
            user: userInfo
        });
    } catch (error) {
        console.error('ログイン処理中にエラーが発生しました:', error);
        res.status(500).json({ message: 'ログインに失敗しました' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));