import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// Post 좋아요
router.post("/posts/:postId/likes", authMiddleware, async (req, res) => {
  const userId = req.user.userId; // 미들웨어에서 가져온 사용자 정보
  const postId = parseInt(req.params.postId); // URL 경로에서 postId 가져옴

  // postId 검증
  if (isNaN(postId)) {
    return res.status(400).json({ message: "유효한 postId를 입력해 주세요." });
  }

  try {
    // 게시글 정보 가져오기
    const post = await prisma.post.findUnique({
      where: { postsid: postId },
    });

    // 게시글 존재 여부 확인
    if (!post) {
      return res.status(400).json({ message: "게시글을 찾을 수 없습니다." });
    }

    // 본인 게시글 좋아요 금지
    if (post.userId === userId) {
      return res
        .status(400)
        .json({ message: "본인 게시글은 *좋아요* 할 수 없습니다." });
    }

    // 좋아요 중복 확인
    const existingLike = await prisma.postLike.findUnique({
      where: {
        userId_postsid: { userId, postsid: postId },
      },
    });

    if (existingLike) {
      return res.status(400).json({ message: "이미 좋아요를 누르셨습니다." });
    }

    // 좋아요 추가
    await prisma.postLike.create({
      data: {
        userId,
        postsid: postId,
      },
    });

    res.status(200).json({ message: "좋아요가 성공하였습니다." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// Post 좋아요 취소
router.delete("/posts/:postId/likes", authMiddleware, async (req, res) => {
  const userId = req.user.userId; // authMiddleware에서 가져온 사용자 정보
  const postId = parseInt(req.params.postId); // URL 경로에서 postId 가져옴

  // postId 검증
  if (isNaN(postId)) {
    return res.status(400).json({ message: "유효한 postId를 입력해 주세요." });
  }

  try {
    // 게시글 정보 가져오기
    const post = await prisma.post.findUnique({
      where: { postsid: postId },
    });

    // 게시글 존재 여부 확인
    if (!post) {
      return res.status(400).json({ message: "게시글을 찾을 수 없습니다." });
    }
    // 좋아요가 존재하는지 확인
    const existingLike = await prisma.postLike.findUnique({
      where: {
        userId_postsid: {
          userId: userId,
          postsid: postId,
        },
      },
    });

    if (!existingLike) {
      return res.status(400).json({ message: "좋아요가 존재하지 않습니다." });
    }

    // 좋아요 삭제
    await prisma.postLike.delete({
      where: {
        userId_postsid: {
          userId: userId,
          postsid: postId,
        },
      },
    });

    res.status(200).json({ message: "좋아요가 취소 되었습니다." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

//Comment 좋아요
router.post("/comments/:commentId/likes", authMiddleware, async (req, res) => {
  const userId = req.user.userId; // authMiddleware에서 가져온 사용자 정보
  const commentId = parseInt(req.params.commentId); // URL에서 commentId 가져오기

  // commentId 검증
  if (isNaN(commentId)) {
    return res
      .status(400)
      .json({ message: "유효한 commentId를 입력해 주세요." });
  }

  try {
    // 댓글 정보 가져오기
    const comment = await prisma.comment.findUnique({
      where: { commentid: commentId },
    });

    // 댓글 존재 여부 확인
    if (!comment) {
      return res.status(400).json({ message: "댓글을 찾을 수 없습니다." });
    }

    // 본인 댓글 좋아요 금지
    if (comment.userId === userId) {
      return res
        .status(400)
        .json({ message: "본인 댓글은 *좋아요* 할 수 없습니다." });
    }

    // 중복 좋아요 확인
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentid: {
          userId: userId,
          commentid: commentId,
        },
      },
    });

    if (existingLike) {
      return res.status(400).json({ message: "이미 좋아요를 누르셨습니다." });
    }

    // 좋아요 추가
    await prisma.commentLike.create({
      data: {
        userId,
        commentid: commentId,
      },
    });

    return res.status(200).json({ message: "댓글 좋아요를 완료했습니다." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

//Comment 좋아요 취소
router.delete(
  "/comments/:commentId/likes",
  authMiddleware,
  async (req, res) => {
    const userId = req.user.userId; // authMiddleware에서 가져온 사용자 정보
    const commentId = parseInt(req.params.commentId); // URL에서 commentId 가져오기

    // commentId 검증
    if (isNaN(commentId)) {
      return res
        .status(400)
        .json({ message: "유효한 commentId를 입력해 주세요." });
    }

    try {
      // 댓글 정보 가져오기
      const comment = await prisma.comment.findUnique({
        where: { commentid: commentId },
      });

      // 댓글 존재 여부 확인
      if (!comment) {
        return res.status(400).json({ message: "댓글을 찾을 수 없습니다." });
      }

      // 좋아요 존재 여부 확인
      const existingLike = await prisma.commentLike.findUnique({
        where: {
          userId_commentid: {
            // Prisma 복합 키를 사용하여 조회
            userId: userId,
            commentid: commentId,
          },
        },
      });

      if (!existingLike) {
        return res.status(400).json({ message: "좋아요가 존재하지 않습니다." });
      }

      // 좋아요 삭제
      await prisma.commentLike.delete({
        where: {
          userId_commentid: {
            userId: userId,
            commentid: commentId,
          },
        },
      });

      return res
        .status(200)
        .json({ message: "댓글 좋아요 취소 완료하였습니다." });
    } catch (error) {
      console.console(error);
      return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
  },
);

export default router;
