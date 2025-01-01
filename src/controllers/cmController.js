import { prisma } from "../utils/prisma/index.js";

// 댓글 작성
export async function createComment(req, res) {
  try {
    const { content } = req.body;
    const postId = parseInt(req.params.postId);
    const userId = req.user.userId;

    // 입력값 검증
    if (!content) {
      return res.status(400).json({ message: "댓글 내용을 입력해주세요." });
    }

    // 댓글 생성
    const comment = await prisma.comment.create({
      data: {
        content,
        userId,
        postsid: postId,
      },
      include: {
        user: {
          select: {
            nickname: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "댓글이 작성되었습니다.",
      data: {
        commentId: comment.commentid,
        content: comment.content,
        nickname: comment.user.nickname,
        createdAt: comment.createdAt,
        likeCount: 0,
      },
    });
  } catch (error) {
    console.error('Error in createComment:', error);
    res.status(500).json({ message: "댓글 작성 중 오류가 발생했습니다." });
  }
}

// 댓글 조회
export async function getComments(req, res) {
  try {
    const postId = parseInt(req.params.postId);

    const comments = await prisma.comment.findMany({
      where: { 
        postsid: postId 
      },
      include: {
        user: {
          select: {
            nickname: true,
          },
        },
        commentLike: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // 응답 데이터 형식화
    const formattedComments = comments.map(comment => ({
      commentId: comment.commentid,
      content: comment.content,
      nickname: comment.user.nickname,
      userId: comment.userId,
      createdAt: comment.createdAt,
      likeCount: comment.commentLike.length,
    }));

    return res.status(200).json({ data: formattedComments });
  } catch (error) {
    console.error('Error in getComments:', error);
    return res.status(500).json({ 
      message: "댓글 조회 중 오류가 발생했습니다."
    });
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
