import { prisma } from "../utils/prisma/index.js";

// 댓글 작성
export async function createComment(req, res) {
  try {
    const postId = parseInt(req.params.postId);
    const { content } = req.body;
    const userId = req.user.userId; // checkAuth 미들웨어에서 설정된 사용자 ID

    // 게시물 존재 여부 확인
    const post = await prisma.post.findUnique({
      where: { postsid: postId },
    });
    if (!post) {
      return res.status(404).json({ message: "게시물을 찾을 수 없습니다." });
    }

    // 댓글 생성
    const comment = await prisma.comment.create({
      data: {
        postsid: postId,
        userId,
        content,
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    res
      .status(500)
      .json({ message: "댓글 작성 중 오류가 발생했습니다.", error });
  }
}

// 댓글 조회
export async function getComments(req, res) {
  try {
    const postId = parseInt(req.params.postId);

    // 해당 게시물의 댓글 조회
    const comments = await prisma.comment.findMany({
      where: { postsid: postId },
      orderBy: { createdAt: "asc" }, // 작성시간 기준 정렬
    });
    res.status(200).json(comments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "댓글 조회 중 오류가 발생했습니다.", error });
  }
}

// 댓글 수정
export async function updateComment(req, res) {
  try {
    const commentId = parseInt(req.params.commentId);
    const { content } = req.body;
    const userId = req.user.userId;

    // 댓글 존재 및 작성자 확인
    const comment = await prisma.comment.findUnique({
      where: { commentid: commentId },
    });
    if (!comment) {
      return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
    }
    if (comment.userId !== userId) {
      return res.status(403).json({ message: "수정 권한이 없습니다." });
    }

    // 댓글 업데이트
    const updatedComment = await prisma.comment.update({
      where: { commentid: commentId },
      data: { content },
    });

    res.status(200).json(updatedComment);
  } catch (error) {
    res
      .status(500)
      .json({ message: "댓글 수정 중 오류가 발생했습니다.", error });
  }
}

// 댓글 삭제
export async function deleteComment(req, res) {
  try {
    const commentId = parseInt(req.params.commentId);
    const userId = req.user.userId;

    // 댓글 존재 및 작성자 확인
    const comment = await prisma.comment.findUnique({
      where: { commentid: commentId },
    });
    if (!comment) {
      return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
    }
    if (comment.userId !== userId) {
      return res.status(403).json({ message: "삭제 권한이 없습니다." });
    }

    // 댓글 삭제
    await prisma.comment.delete({
      where: { commentid: commentId },
    });

    res.status(200).json({ message: "댓글이 삭제되었습니다." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "댓글 삭제 중 오류가 발생했습니다.", error });
  }
}
