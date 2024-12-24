import express from "express";
import { prisma } from "../utils/prisma/index.js";

const router = express.Router();

/** 사용자 회원가입 API **/
router.post("/users", async (req, res, next) => {
  const { email, password, nickname, name, age, interest, introduce } =
    req.body;
  const isExistUser = await prisma.User.findFirst({
    where: {
      email,
    },
  });

  if (isExistUser) {
    return res.status(409).json({ message: "이미 존재하는 이메일입니다." });
  }

  // Users 테이블에 사용자를 추가합니다.
  const user = await prisma.User.create({
    data: { email, password, nickname, name, age, interest, introduce },
  });

  return res.status(201).json({ message: "회원가입이 완료되었습니다." });
});

export default router;
