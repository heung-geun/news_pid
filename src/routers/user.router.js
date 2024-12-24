import express from "express";
import bcrypt from "bcrypt";
import { prisma } from "../utils/prisma/index.js";

const router = express.Router();

/** 사용자 회원가입 API **/
router.post("/users", async (req, res, next) => {
  const { email, password, nickname, name, age, interest, introduce } =
    req.body;
  const isExistUser = await prisma.User.findUnique({
    where: {
      email,
    },
  });

  if (isExistUser) {
    return res.status(409).json({ message: "이미 존재하는 이메일입니다." });
  }
  // 사용자 비밀번호를 암호화합니다.
  const hashedPassword = await bcrypt.hash(password, 10);
  // Users 테이블에 사용자를 추가합니다.

  const User = await prisma.User.create({
    data: {
      email,
      password: hashedPassword,
      nickname,
      name,
      age,
      interest,
      introduce,
    },
  });

  return res.status(201).json({ message: "회원가입이 완료되었습니다." });
});

export default router;
