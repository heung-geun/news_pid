const Comment = require("../models/cmModel");
const Post = require("../models/postModel");

// 댓글 작성
exports.createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id; // checkAuth 미들웨어에서 설정된 사용자 ID

    // 게시물 존재 여부 확인
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "게시물을 찾을 수 없습니다." });
    }

    // 댓글 생성
    const comment = await Comment.create({
      postId,
      userId,
      content,
    });

    res.status(201).json(comment);
  } catch (error) {
    res
      .status(500)
      .json({ message: "댓글 작성 중 오류가 발생했습니다.", error });
  }
};

// 댓글 조회
exports.getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    // 해당 게시물의 댓글 조회
    const comments = await Comment.find({ postId });
    res.status(200).json(comments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "댓글 조회 중 오류가 발생했습니다.", error });
  }
};

// 댓글 수정
exports.updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // 댓글 존재 및 작성자 확인
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
    }
    if (comment.userId.toString() !== userId) {
      return res.status(403).json({ message: "수정 권한이 없습니다." });
    }

    // 댓글 업데이트
    comment.content = content;
    await comment.save();

    res.status(200).json(comment);
  } catch (error) {
    res
      .status(500)
      .json({ message: "댓글 수정 중 오류가 발생했습니다.", error });
  }
};

// 댓글 삭제
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    // 댓글 존재 및 작성자 확인
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
    }
    if (comment.userId.toString() !== userId) {
      return res.status(403).json({ message: "삭제 권한이 없습니다." });
    }

    // 댓글 삭제
    await comment.remove();

    res.status(200).json({ message: "댓글이 삭제되었습니다." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "댓글 삭제 중 오류가 발생했습니다.", error });
  }
};
