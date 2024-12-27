import express from "express";
import checkAuth from "../middlewares/auth.middleware.js";
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} from "../controllers/cmController.js";

const router = express.Router();

// 댓글 작성
router.post("/posts/:postId/comments", checkAuth, createComment);

// 댓글 조회
router.get("/posts/:postId/comments", getComments);

// 댓글 수정
router.patch("/comments/:commentId", checkAuth, updateComment);

// 댓글 삭제
router.delete("/comments/:commentId", checkAuth, deleteComment);

export default router;
