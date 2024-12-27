import { Router } from "express";
import { checkAuth } from "../middleware/authMiddleware";
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} from "../controllers/cmController.js";

const router = Router();

// 댓글 작성
router.post("/posts/:postId/comments", checkAuth, createComment);

// 댓글 조회
router.get("/posts/:postId/comments", getComments);

// 댓글 수정
router.put("/comments/:commentId", checkAuth, updateComment);

// 댓글 삭제
router.delete("/comments/:commentId", checkAuth, deleteComment);

export default router;
