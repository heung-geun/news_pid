import express from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = express.Router();
const prisma = new PrismaClient();

// 이메일 인증 코드 저장을 위한 임시 저장소
const verificationCodes = new Map();

// 이메일 인증번호 전송
router.post("/emailauth", async (req, res) => {
  try {
    const { email } = req.body;

    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "올바른 이메일 형식이 아닙니다."
      });
    }

    // 6자리 인증번호 생성
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 인증번호 저장 (5분 후 만료)
    verificationCodes.set(email, {
      code: verificationCode,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    console.log(`Email: ${email}, Code: ${verificationCode}`); // 테스트용 로그

    return res.status(200).json({
      success: true,
      message: "인증번호가 전송되었습니다."
    });

  } catch (error) {
    console.error('Email auth error:', error);
    return res.status(500).json({
      success: false,
      message: "인증번호 전송 중 오류가 발생했습니다."
    });
  }
});

// 이메일 인증번호 확인
router.post("/checkemail", async (req, res) => {
  try {
    const { email, authCode } = req.body;
    
    // 요청 데이터 확인을 위한 로그
    console.log('Received request body:', req.body);

    if (!email || !authCode) {
      return res.status(400).json({
        success: false,
        message: "이메일과 인증번호를 모두 입력해주세요."
      });
    }

    const verification = verificationCodes.get(email);
    console.log('Stored verification for email:', email, verification);

    if (!verification) {
      return res.status(400).json({
        success: false,
        message: "인증번호를 먼저 요청해주세요."
      });
    }

    if (Date.now() > verification.expiresAt) {
      verificationCodes.delete(email);
      return res.status(400).json({
        success: false,
        message: "인증번호가 만료되었습니다. 다시 요청해주세요."
      });
    }

    if (verification.code !== authCode) {
      return res.status(400).json({
        success: false,
        message: "인증번호가 일치하지 않습니다."
      });
    }

    // 인증 성공 후 인증번호 삭제
    verificationCodes.delete(email);

    return res.status(200).json({
      success: true,
      message: "이메일 인증이 완료되었습니다."
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({
      success: false,
      message: "인증번호 확인 중 오류가 발생했습니다."
    });
  }
});

export default router; 