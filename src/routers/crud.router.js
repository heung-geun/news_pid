import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

const vaild_game = ["LOL", "로스트아크", "메이플스토리", "발로란트", "기타"];

//내 게시물 조회
router.get("/posts", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user; // 인증 미들웨어
    if (!userId) {
      return res.status(404).json({
        message: "인증 되지 않은 사용자는 게시물 조회가 불가능합니다",
      });
    }
    // const { type } = req.body;
    // if (!vaild_game.includes(type)) {
    //   return res.status(404).json({
    //     message: "게임 타입이 잘못되었습니다 유효한 값을 입력해 주세요",
    //     gamelist: vaild_game,
    //   });
    // }
    const result = await prisma.post.findMany({
      where: { userId },
      select: {
        title: true,
        content: true,
        type: true,
      },
    });
    res.status(200).json({ result });
  } catch (error) {
    return res.status(500).json({ message: "게시물 조회 에러가 발생했습니다" });
  }
});

// 게시물 작성
router.post("/posts", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user; // 인증 미들웨어
    if (!userId) {
      return res.status(404).json({
        message: "인증 되지 않은 사용자는 게시물 작성이 불가능합니다",
      });
    }
    const { title, content, type } = req.body;
    if (vaild_game.includes(type) === false) {
      return res.status(404).json({
        message: "게임 타입이 잘못되었습니다 유효한 값을 입력해 주세요",
        gamelist: vaild_game,
      });
    }

    await prisma.post.create({
      data: {
        title,
        content,
        type,
        userId,
      },
    });
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
    });

    return res.status(201).json({ message: "게시물이 작성되었습니다", posts });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "게시물 작성에 에러가 발생했습니다" });
  }
});

// 게시물 수정
router.patch("/posts/:postId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user; // 인증 미들웨어
    const { title, content, type } = req.body;
    const postId = parseInt(req.params.postId);
    if (!userId) {
      return res
        .status(404)
        .json({ message: "인증 되지 않은 사용자는 게시물 수정 불가능합니다" });
    }
    if (type && !vaild_game.includes(type)) {
      return res.status(404).json({
        message: "게임 타입이 잘못되었습니다 유효한 값을 입력해 주세요",
        gamelist: vaild_game,
      });
    }

    const the_post = await prisma.post.findFirst({
      where: { postsid: postId },
    });

    if (!the_post) {
      return res
        .status(404)
        .json({ message: `${postId} 해당 게시물을 찾을 수 없습니다` });
    }

    // 게시물 수정
    await prisma.post.update({
      where: { postsid: the_post.postsid },
      data: {
        title: title !== undefined ? title : the_post.title,
        content: content !== undefined ? content : the_post.content,
        type: type !== undefined ? type : the_post.type,
      },
    });

    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ message: "게시물이 수정되었습니다" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "게시물 수정에 에러가 발생했습니다" });
  }
});

0;
// 게시물 삭제
router.delete("/posts/:postId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user; // 인증 미들웨어
    const { title, type } = req.body;
    const postId = parseInt(req.params.postId);
    if (!userId) {
      return res
        .status(404)
        .json({ message: "인증 되지 않은 사용자는 게시물 삭제 불가능합니다" });
    }

    const post = await prisma.post.findFirst({
      where: { postsid: postId },
    });
    if (!post) {
      return res
        .status(404)
        .json({ message: `${title} 해당 게시물을 찾을 수 없습니다` });
    }

    // 게시물 삭제
    await prisma.post.delete({
      where: { postsid: post.postsid },
    });

    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ message: "게시물이 삭제되었습니다", posts });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "게시물 삭제에 에러가 발생했습니다" });
  }
});

export default router;
