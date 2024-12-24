import express from "express";
import { prisma } from "../utils/prisma/index.js";

const router = express.Router();


router.get('/posts/all', (req, res) => {
  const posts = prisma.posts.findMany({
    select: {
      userId: true,
      title: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc', // 게시글을 최신순으로 정렬
    },
  });

  return res.status(200).json({ data: posts });
});


router.get('/posts/lol', (req, res) => {
  const postsLol = prisma.posts.filter(type => {
    type.type === lol
  });

  return res.status(200).json({ data: postsLol });
});