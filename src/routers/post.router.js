import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import multer from 'multer';
import path from 'path';

const router = express.Router();

// 이미지 저장을 위한 multer 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // 'uploads' 디렉토리에 파일 저장
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)) // 파일명 중복 방지
    }
});

const upload = multer({ storage: storage });

router.get("/posts/all", async (req, res) => {
  const posts = await prisma.post.findMany({
    select: {
      postsid: true,
      userId: true,
      type: true,
      title: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return res.status(200).json({ data: posts });
});

router.get("/posts/lol", async (req, res) => {
  const postsLol = await prisma.post.findMany({
    where: { type: "LOL" },
    select: {
      postsid: true,
      userId: true,
      type: true,
      title: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return res.status(200).json({ data: postsLol });
});

router.get("/posts/lost_ark", async (req, res) => {
  const postsLostArk = await prisma.post.findMany({
    where: { type: "로스트아크" },
    select: {
      postsid: true,
      userId: true,
      type: true,
      title: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return res.status(200).json({ data: postsLostArk });
});

router.get("/posts/maplestory", async (req, res) => {
  const postsMaplestory = await prisma.post.findMany({
    where: { type: "메이플스토리" },
    select: {
      postsid: true,
      userId: true,
      type: true,
      title: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return res.status(200).json({ data: postsMaplestory });
});

router.get("/posts/valorant", async (req, res) => {
  const postsValorant = await prisma.post.findMany({
    where: { type: "발로란트" },
    select: {
      postsid: true,
      userId: true,
      type: true,
      title: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return res.status(200).json({ data: postsValorant });
});

router.get("/posts/etc", async (req, res) => {
  const postsEtc = await prisma.post.findMany({
    where: { type: "기타" },
    select: {
      postsid: true,
      userId: true,
      type: true,
      title: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return res.status(200).json({ data: postsEtc });
});

router.get("/posts/detail/:postsid", async (req, res) => {
    try {
        const { postsid } = req.params;
        const post = await prisma.post.findUnique({
            where: { postsid: parseInt(postsid) },
            select: {
                postsid: true,
                userId: true,
                type: true,
                title: true,
                content: true,
                createdAt: true,
            },
        });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "게시글을 찾을 수 없습니다."
            });
        }

        return res.status(200).json({
            success: true,
            data: post
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "서버 오류가 발생했습니다."
        });
    }
});

router.get("/posts/popular", async (req, res) => {
  try {
    // 먼저 모든 게시글과 좋아요 수를 가져옴
    const posts = await prisma.post.findMany({
      select: {
        postsid: true,
        userId: true,
        type: true,
        title: true,
        createdAt: true,
        postLike: {
          select: {
            userId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 좋아요가 10개 이상인 게시글만 필터링하고 포맷팅
    const popularPosts = posts
      .filter(post => post.postLike.length >= 9)
      .map(post => ({
        postsid: post.postsid,
        userId: post.userId,
        type: post.type,
        title: post.title,
        createdAt: post.createdAt,
        likeCount: post.postLike.length
      }))
      .sort((a, b) => b.likeCount - a.likeCount); // 좋아요 수 기준 내림차순 정렬

    return res.status(200).json({
      success: true,
      data: popularPosts
    });
  } catch (error) {
    console.error('Popular posts error:', error);
    return res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다."
    });
  }
});

router.get("/posts/my", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;

    const myPosts = await prisma.post.findMany({
      where: { 
        userId: +userId 
      },
      select: {
        postsid: true,
        userId: true,
        type: true,
        title: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({ data: myPosts });
  } catch (error) {
    console.error('Error in getMyPosts:', error);
    return res.status(500).json({ 
      message: "내 게시글 조회 중 오류가 발생했습니다."
    });
  }
});

// 프로필 수정 API에 이미지 업로드 미들웨어 추가
router.patch("/me", authMiddleware, upload.single('profileImage'), async (req, res) => {
    try {
        const { userId } = req.user;
        const { nickname, age, interest, introduce } = req.body;
        
        // 업데이트할 데이터 객체
        const updateData = {
            nickname,
            age: parseInt(age),
            interest,
            introduce
        };

        // 이미지가 업로드된 경우 이미지 경로 추가
        if (req.file) {
            updateData.profileImage = `/uploads/${req.file.filename}`;
        }

        await prisma.user.update({
            where: { userId: +userId },
            data: updateData
        });

        return res.status(200).json({ message: "프로필이 수정되었습니다." });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: "프로필 수정 중 오류가 발생했습니다." });
    }
});

export default router;
