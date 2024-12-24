import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import bcrypt from "bcrypt";

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

router.get(
  "/me/:userId",
  /*authMiddleware,*/ async (req, res, next) => {
    const { userId } = req.params;
    const userInfo = await prisma.user.findFirst({
      where: { userId: +userId },
      select: {
        name: true,
        email: true,
        nickname: true,
        interest: true,
        introduce: true,
        age: true,
      },
    });
    return res.status(200).json({ data: userInfo });
  },
);

router.patch(
  "/me/:userId",
  /*authMiddleware,*/ async (req, res, next) => {
    const { userId } = req.params;
    const {
      password,
      passwordCheck,
      email,
      nickname,
      interest,
      introduce,
      age,
    } = req.body;
    const userInfo = await prisma.user.findFirst({
      where: { userId: +userId },
    });
    if (password && !passwordCheck) {
      return res.status(404).json({ message: "비밀번호 확인을 입력해주세요" });
    }
    if (passwordCheck !== password) {
      return res
        .status(401)
        .json({ message: "변경할 비밀번호가 동일하지 않습니다" });
    }

    const updateData = {
      email: email !== undefined ? email : userInfo.email,
      nickname: nickname !== undefined ? nickname : userInfo.nickname,
      interest: interest !== undefined ? interest : userInfo.interest,
      introduce: introduce !== undefined ? introduce : userInfo.introduce,
      age: age !== undefined ? age : userInfo.age,
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await prisma.user.update({
      where: { userId: +userId },
      data: updateData,
    });
    return res.status(200).json({ message: "프로필 수정 완료" });
  },
);
export default router;
