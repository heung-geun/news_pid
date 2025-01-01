import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';

dotenv.config();

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
    }
});

export const uploadToS3 = async (file) => {
    try {
        const key = `uploads/${Date.now()}-${file.originalname}`;
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read'
        });

        await s3.send(command);
        return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    } catch (error) {
        console.error('S3 upload error:', error);
        throw new Error('파일 업로드에 실패했습니다.');
    }
};

export const deleteFromS3 = async (fileUrl) => {
    try {
        const key = fileUrl.split('.com/')[1];
        const command = new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key
        });
        await s3.send(command);
    } catch (error) {
        console.error('S3 delete error:', error);
        throw new Error('파일 삭제에 실패했습니다.');
    }
};

export default s3; 