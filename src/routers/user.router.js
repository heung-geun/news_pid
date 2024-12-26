import express from "express";
import bcrypt from "bcrypt";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import jwt from "jsonwebtoken";

const router = express.Router();

/** 사용자 회원가입 API **/
router.post("/users", async (req, res) => {
  try {
    const {
      email,
      password,
      passwordCheck,
      nickname,
      name,
      age,
      interest,
      introduce,
    } = req.body;

    // 이메일 형식을 검증하는 정규식
    const idRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // ^와 $: 문자열의 시작과 끝을 명시.
    // [^\s@]+: 공백(\s)과 @를 제외한 하나 이상의 문자.
    // @와 \.: 이메일 형식에서 반드시 필요한 기호.
    // username@domain.com 형식의 기본 이메일 구조를 검증.
    //공백, @ 중복 등을 방지.
    const pwRegex =
      /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{6,}$/;
    // 비밀번호가 영어 소문자, 숫자, 특수기호를 포함하고 6자 이상인지 확인하는 정규식

    // 아이디(이메일) 형식 유효성 검증
    if (!email || !idRegex.test(email))
      return res
        .status(400)
        .json({ errorMessage: "아이디는 이메일 형태로 입력해주세요" });

    // 비밀번호 유효성 검증
    if (!password || !pwRegex.test(password))
      return res.status(400).json({
        errorMessage:
          "비밀번호는 영어 소문자, 숫자, 특수기호 하나 이상 혼합하여 6자 이상으로 작성해주세요",
      });

    // 비밀번호 확인 입력 여부 검증
    if (!passwordCheck)
      return res.status(400).json({
        errorMessage: "비밀번호 확인용<passwordCheck>를 입력해주세요",
      });

    // 비밀번호와 비밀번호 확인 값 일치 여부 검증
    if (password !== passwordCheck)
      return res
        .status(401)
        .json({ errorMessage: "비밀번호가 일치하지 않습니다" });

    // 닉네임 중복 확인
    const isExistUser = await prisma.User.findFirst({
      where: {
        email,
        nickname,
      },
    });

    if (isExistUser)
      return res
        .status(409)
        .json({ message: `이미 존재하는 이메일,닉네임 입니다.` });

    // 사용자 비밀번호를 암호화합니다.
    const hashedPassword = await bcrypt.hash(password, 10);
    // Users 테이블에 사용자를 추가합니다.

    const User = await prisma.User.create({
      data: {
        email, // 이메일
        password: hashedPassword, // 암호화된 비밀번호
        nickname, // 닉네임
        name, // 이름
        age, // 나이
        interest, // 흥미가 있는 게임이름
        introduce, // 자신이 하고 싶은 한마디
      },
    });

    // 성공 시 사용자 정보를 포함하여 응답 반환
    return res.status(201).json({
      message: "회원가입이 완료되었습니다",
      email: User.email, // 생성된 사용자의 이메일 email
      nickname: User.nickname, // 생성된 사용자의 닉네임
      ID: User.userId, // 생성된 사용자의 고유 키(userKey)
    });
  } catch (error) {
    console.error(error); // 에러를 콘솔에 출력
    return res.status(500).json({ errormessage: "서버 에러" }); // 서버 에러 메시지 반환
  }
});

/** 사용자 로그인 기능 **/
router.post("/auth", async (req, res) => {
  try {
    const { email, password } = req.body; // 요청 본문에서 아이디와 비밀번호를 추출

    // 데이터베이스에서 아이디를 기준으로 사용자 조회
    const User = await prisma.User.findFirst({ where: { email } });
    // 사용자가 존재하지 않을 경우 404 상태 코드와 에러 메시지 반환
    if (!User)
      return res
        .status(404)
        .json({ errorMessage: "존재하지 않는 아이디입니다" });

    // 입력된 비밀번호와 데이터베이스의 암호화된 비밀번호를 비교
    const isPasswordValid = await bcrypt.compare(password, User.password);
    // 비밀번호가 일치하지 않으면 401 상태 코드와 에러 메시지 반환
    if (!isPasswordValid)
      return res
        .status(401)
        .json({ errorMessage: "비밀번호가 일치하지 않습니다" });

    // 비밀번호가 일치하면 JWT 생성
    const token = jwt.sign(
      {
        ID: User.userId, // JWT 페이로드에 사용자 키 포함
      },
      process.env.SECRET_KEY, // 비밀 키를 사용하여 서명
      { expiresIn: "1h" }, // 토큰 유효 기간을 1시간으로 설정
    );
    // 성공 시 헤더에 authorization 토큰 추가
    res.setHeader("authorization", `Bearer ${token}`);
    // 로그인 성공 메시지와 사용자 키 반환
    return res.status(200).json({
      message: "로그인 되었습니다",
      ID: User.userId, // 로그인된 사용자의 고유 키
    });
  } catch (error) {
    console.error(error); // 에러를 콘솔에 출력
    return res.status(500).json({ errorMessage: "서버 에러" }); // 서버 에러 메시지 반환
  }
});
/** 사용자 로그아웃 기능 */

/*사용자 프로필 조회*/
router.get(
  "/me/:userId",
  /*authMiddleware,*/ async (req, res, next) => {
    const { userId } = req.params;
    const userInfo = await prisma.user.findFirst({
      where: { userId: +userId },
      select: {
        name: true,
        nickname: true,
        interest: true,
        introduce: true,
        age: true,
      },
    });
    return res.status(200).json({ data: userInfo });
  },
);

/*사용자 프로필 수정*/
router.patch(
  "/me/:userId",
  /*authMiddleware,*/ async (req, res, next) => {
    const { userId } = req.params;
    const { password, passwordCheck, nickname, interest, introduce, age } =
      req.body;
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
