import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import multer from 'multer';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// S3 클라이언트 설정
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
    }
});

// 기본 multer 설정 (메모리 스토리지 사용)
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

router.get("/posts/all", async (req, res) => {
  const posts = await prisma.post.findMany({
    select: {
      postsid: true,
      userId: true,
      type: true,
      title: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return res.status(200).json({ data: posts });
});

router.get("/posts/lol", async (req, res) => {
  const postsLol = await prisma.post.findMany({
    where: { type: "LOL" },
    select: {
      postsid: true,
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

router.get("/posts/lost_ark", async (req, res) => {
  const postsLostArk = await prisma.post.findMany({
    where: { type: "로스트아크" },
    select: {
      postsid: true,
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

router.get("/posts/maplestory", async (req, res) => {
  const postsMaplestory = await prisma.post.findMany({
    where: { type: "메이플스토리" },
    select: {
      postsid: true,
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

router.get("/posts/valorant", async (req, res) => {
  const postsValorant = await prisma.post.findMany({
    where: { type: "발로란트" },
    select: {
      postsid: true,
      userId: true,
      type: true,
      title: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return res.status(200).json({ data: postsValorant });
});

router.get("/posts/etc", async (req, res) => {
  const postsEtc = await prisma.post.findMany({
    where: { type: "기타" },
    select: {
      postsid: true,
      userId: true,
      type: true,
      title: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return res.status(200).json({ data: postsEtc });
});

router.get("/posts/detail/:postsid", async (req, res) => {
    try {
        const { postsid } = req.params;
        const post = await prisma.post.findFirst({
            where: { postsid: +postsid },
            include: {
                user: {
                    select: {
                        nickname: true
                    }
                }
            }
        });

        if (!post) {
            return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
        }

        // fileUrls가 문자열로 저장되어 있으므로 JSON으로 파싱
        const mediaUrls = post.fileUrls ? JSON.parse(post.fileUrls) : [];

        return res.status(200).json({ 
            data: {
                ...post,
                mediaUrls // 파싱된 미디어 URL 배열 추가
            }
        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: "게시글 조회 중 오류가 발생했습니다." });
    }
});

router.get("/posts/popular", async (req, res) => {
  try {
    // 먼저 모든 게시글과 좋아요 수를 가져옴
    const posts = await prisma.post.findMany({
      select: {
        postsid: true,
        userId: true,
        type: true,
        title: true,
        createdAt: true,
        postLike: {
          select: {
            userId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 좋아요가 10개 이상인 게시글만 필터링하고 포맷팅
    const popularPosts = posts
      .filter(post => post.postLike.length >= 9)
      .map(post => ({
        postsid: post.postsid,
        userId: post.userId,
        type: post.type,
        title: post.title,
        createdAt: post.createdAt,
        likeCount: post.postLike.length
      }))
      .sort((a, b) => b.likeCount - a.likeCount); // 좋아요 수 기준 내림차순 정렬

    return res.status(200).json({
      success: true,
      data: popularPosts
    });
  } catch (error) {
    console.error('Popular posts error:', error);
    return res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다."
    });
  }
});

router.get("/posts/my", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;

    const myPosts = await prisma.post.findMany({
      where: { 
        userId: +userId 
      },
      select: {
        postsid: true,
        userId: true,
        type: true,
        title: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({ data: myPosts });
  } catch (error) {
    console.error('Error in getMyPosts:', error);
    return res.status(500).json({ 
      message: "내 게시글 조회 중 오류가 발생했습니다."
    });
  }
});

// 프로필 수정 API에 이미지 업로드 미들웨어 추가
router.patch("/me", authMiddleware, upload.single('profileImage'), async (req, res) => {
    try {
        const { userId } = req.user;
        const { nickname, age, interest, introduce } = req.body;
        
        // 업데이트할 데이터 객체
        const updateData = {
            nickname,
            age: parseInt(age),
            interest,
            introduce
        };

        // 이미지가 업로드된 경우 이미지 경로 추가
        if (req.file) {
            updateData.profileImage = `/uploads/${req.file.filename}`;
        }

        await prisma.user.update({
            where: { userId: +userId },
            data: updateData
        });

        return res.status(200).json({ message: "프로필이 수정되었습니다." });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: "프로필 수정 중 오류가 발생했습니다." });
    }
});

// 게시글 작성 라우트
router.post("/posts", authMiddleware, upload.array('media', 5), async (req, res) => {
    try {
        const { userId } = req.user;
        const { type, title, content } = req.body;

        let fileUrls = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                // 파일 이름에서 특수문자 제거
                const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '');
                const key = `uploads/${Date.now()}-${sanitizedFileName}`;
                
                const command = new PutObjectCommand({
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: key,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                    ACL: 'public-read'
                });
                
                await s3.send(command);
                
                // URL 직접 구성
                const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
                console.log('Generated URL:', fileUrl); // URL 확인용 로그
                fileUrls.push(fileUrl);
            }
        }

        const post = await prisma.post.create({
            data: {
                userId: +userId,
                type,
                title,
                content,
                fileUrls: fileUrls.length > 0 ? JSON.stringify(fileUrls) : null
            }
        });

        return res.status(201).json({
            message: "게시글을 생성하였습니다.",
            data: post,
        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            message: "게시글 작성 중 오류가 발생했습니다.",
            error: error.message
        });
    }
});

// 게시글 삭제
router.delete("/posts/:id", authMiddleware, async (req, res) => {
    try {
        const post = await prisma.post.findUnique({
            where: { postsid: parseInt(req.params.id) }
        });
        // 파일도 함께 삭제
        if (post.fileUrls) {
            const urls = JSON.parse(post.fileUrls);
            await Promise.all(urls.map(url => deleteFromS3(url)));
        }
        await prisma.post.delete({
            where: { postsid: parseInt(req.params.id) }
        });
        return res.status(200).json({ message: "게시글이 삭제되었습니다." });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            message: "게시글 삭제 중 오류가 발생했습니다."
        });
    }
});

// 게시글의 댓글 조회
router.get("/posts/:postsid/comments", async (req, res) => {
    try {
        const { postsid } = req.params;
        const comments = await prisma.comment.findMany({
            where: {
                postsid: +postsid
            },
            include: {
                user: {
                    select: {
                        nickname: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return res.status(200).json({ data: comments });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            message: "댓글을 불러오는 중 오류가 발생했습니다."
        });
    }
});

// 게시글 좋아요 상태 확인
router.get("/posts/:postsid/like", authMiddleware, async (req, res) => {
    try {
        const { postsid } = req.params;
        const { userId } = req.user;

        // 좋아요 여부 확인
        const like = await prisma.postLike.findUnique({
            where: {
                userId_postsid: {
                    userId: +userId,
                    postsid: +postsid
                }
            }
        });

        // 전체 좋아요 수 조회
        const likeCount = await prisma.postLike.count({
            where: {
                postsid: +postsid
            }
        });

        return res.status(200).json({
            isLiked: !!like,
            likeCount
        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            message: "좋아요 상태 확인 중 오류가 발생했습니다."
        });
    }
});

// 게시글 좋아요/취소
router.post("/posts/:postsid/like", authMiddleware, async (req, res) => {
    try {
        const { postsid } = req.params;
        const { userId } = req.user;

        // 기존 좋아요 확인
        const existingLike = await prisma.postLike.findUnique({
            where: {
                userId_postsid: {
                    userId: +userId,
                    postsid: +postsid
                }
            }
        });

        if (existingLike) {
            // 좋아요 취소
            await prisma.postLike.delete({
                where: {
                    userId_postsid: {
                        userId: +userId,
                        postsid: +postsid
                    }
                }
            });
        } else {
            // 좋아요 생성
            await prisma.postLike.create({
                data: {
                    userId: +userId,
                    postsid: +postsid
                }
            });
        }

        // 현재 좋아요 수 조회
        const likeCount = await prisma.postLike.count({
            where: {
                postsid: +postsid
            }
        });

        return res.status(200).json({
            isLiked: !existingLike,
            likeCount,
            message: existingLike ? "좋아요가 취소되었습니다." : "좋아요가 추가되었습니다."
        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            message: "좋아요 처리 중 오류가 발생했습니다."
        });
    }
});

export default router;
