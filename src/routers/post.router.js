import express from "express";
import { prisma } from "../utils/prisma/index.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/posts/all", async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        postLike: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedPosts = posts.map(post => ({
      postsid: post.postsid,
      userId: post.userId,
      type: post.type,
      title: post.title,
      createdAt: post.createdAt,
      likeCount: post.postLike.length
    }));

    return res.status(200).json({
      success: true,
      data: formattedPosts
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다."
    });
  }
});

router.get("/posts/lol", async (req, res) => {
  const postsLol = await prisma.post.findMany({
    where: { type: "LOL" },
    select: {
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

router.get("/posts/balorant", async (req, res) => {
  const postsBalorant = await prisma.post.findMany({
    where: { type: "발로란트" },
    select: {
      userId: true,
      type: true,
      title: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return res.status(200).json({ data: postsBalorant });
});

router.get("/posts/etc", async (req, res) => {
  const postsEtc = await prisma.post.findMany({
    where: { type: "기타" },
    select: {
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

router.get("/posts/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const token = req.headers.authorization?.split(' ')[1];
    let userId;

    if (token) {
      try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        userId = decodedToken.userId;
      } catch (e) {
        console.error('Token verification failed:', e);
      }
    }

    const post = await prisma.post.findUnique({
      where: {
        postsid: parseInt(postId),
      },
      include: {
        postLike: true,
      },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "게시글을 찾을 수 없습니다."
      });
    }

    // 게시글 정보 포맷팅
    const formattedPost = {
      postsid: post.postsid,
      userId: post.userId,
      title: post.title,
      content: post.content,
      type: post.type,
      createdAt: post.createdAt,
      likeCount: post.postLike.length,
      isLiked: userId ? post.postLike.some(like => like.userId === userId) : false
    };

    return res.status(200).json({
      success: true,
      data: formattedPost
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다."
    });
  }
});

export default router;
