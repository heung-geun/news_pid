import express from "express";
import { prisma } from "../utils/prisma/index.js";

const router = express.Router();

router.get("/posts/all", (req, res) => {
  const posts = prisma.posts.findMany({
    select: {
      userId: true,
      title: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc", // 게시글을 최신순으로 정렬
    },
  });

  return res.status(200).json({ data: posts });
});

router.get("/posts/lol", (req, res) => {
  const postsLol = prisma.posts.filter((type) => {
    return type.type === lol;
  });
  return res.status(200).json({ data: postsLol });
});

router.get("/posts/lost_ark", (req, res) => {
  const postsLostArk = prisma.posts.filter((type) => {
    return type.type === lost_ark;
  });
  return res.status(200).json({ data: postsLostArk });
});

router.get("/posts/maplestory", (req, res) => {
  const postsMaplestory = prisma.posts.filter((type) => {
    return type.type === maplestory;
  });
  return res.status(200).json({ data: postsMaplestory });
});

export default router;
