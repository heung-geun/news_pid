import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma/index.js";
import dotenv from "dotenv";

// 환경 변수 설정
dotenv.config();

// 인증 미들웨어
const authMiddleware = async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    // Authorization 헤더 확인
    if (!authorization) {
      return res.status(401).json({ errorMessage: "로그인부터 해주세요" });
    }

    const [tokenType, token] = authorization.split(" ");

    // 토큰 형식 검증
    if (!token || tokenType !== "Bearer") {
      return res
        .status(401)
        .json({ errorMessage: "올바르지 않은 인증 형식입니다." });
    }

    // JWT 검증
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // userId 검증
    if (!decoded.userId || typeof decoded.userId !== "number") {
      return res
        .status(401)
        .json({ errorMessage: "잘못된 사용자 정보입니다." });
    }

    // 사용자 조회
    const loginUser = await prisma.user.findUnique({
      where: { userId: decoded.userId },
    });

    // 사용자 정보 확인
    if (!loginUser) {
      return res
        .status(401)
        .json({ errorMessage: "해당하는 계정이 존재하지 않습니다." });
    }

    // 사용자 정보를 req 객체에 추가
    req.user = loginUser;

    // 다음 미들웨어로 이동
    next();
  } catch (error) {
    console.error("JWT 검증 실패:", error.message);

    // 에러 처리
    const isTokenExpired = error.name === "TokenExpiredError";
    const errorMessage = isTokenExpired
      ? "토큰이 만료되었습니다. 다시 로그인해주세요."
      : "토큰 검증 실패";

    return res
      .status(401)
      .json({ message: errorMessage, error: error.message });
  }
};

export default authMiddleware;
