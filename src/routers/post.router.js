import express from "express";
import { prisma } from "../utils/prisma/index.js";

const router = express.Router();

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
      .filter(post => post.postLike.length >= 1)
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

export default router;
