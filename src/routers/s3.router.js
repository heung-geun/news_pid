import aws from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

const s3 = new aws.S3({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET_KEY,
  },
});

const uploadImage = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, callback) => {
      // 콜백 함수 두 번째 인자에 파일명(경로 포함)을 입력
      callback(null, `folder/${file.originalname}`); // 파일 이름을 원래 이름으로 설정
    },
    acl: "public-read-write",
  }),
});

router.post(
  "/image",
  authMiddleware,
  uploadImage.single("image"),
  async (req, res) => {
    const { userId } = req.user;
    if (!req.file) {
      return res.status(400).json({ message: "파일 업로드 실패" });
    }
    const filePath = req.file.location; //업로드 이미지 경로
    console.log(filePath);

    await prisma.user.update({
      where: { userId: +userId },
      data: { profileimage: filePath },
    });
    res.status(200).json({ message: "프로필 사진 업로드 완료", filePath });
  },
);

export default router;
