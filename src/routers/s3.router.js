import express from "express";
import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// S3 클라이언트 설정
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
    }
});

// multer-s3 설정
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME,
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            cb(null, `uploads/${Date.now()}-${file.originalname}`);
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// 파일 업로드 라우트
router.post('/upload', upload.single('file'), (req, res) => {
    try {
        res.json({
            success: true,
            location: req.file.location // S3 URL
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: '파일 업로드 중 오류가 발생했습니다.'
        });
    }
});

export default router;
