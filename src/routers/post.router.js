import express from "express";
import { prisma } from "../utils/prisma/index.js";

const router = express.Router();

router.get("/posts/all", (req, res) => {
  const posts = prisma.posts.findMany({
    select: {
      userId: true,
      type: true,
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
  const postsLol = prisma.type.findMany({
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

router.get("/posts/lost_ark", (req, res) => {
  const postsLostArk = prisma.posts.findMany({
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

router.get("/posts/maplestory", (req, res) => {
  const postsMaplestory = prisma.posts.findMany({
    where: { type: "매이플스토리" },
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

router.get("/posts/maplestory", (req, res) => {
  const postsBalorant = prisma.posts.findMany({
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

router.get("/posts/maplestory", (req, res) => {
  const postsBalorant = prisma.posts.findMany({
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

export default router;
