import express from "express";
import bcrypt from "bcrypt";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import generateRandomNumber from "../utils/randomnumber.js";

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
    //joi 라이브러리 사용하면 좋
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

    // 비밀번호 유효성 검증 ((이거는 안해도 됌.
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
        userId: User.userId, // JWT 페이로드에 사용자 키 포함
      },
      process.env.SECRET_KEY, // 비밀 키를 사용하여 서명
      { expiresIn: "1h" }, // 토큰 유효 기간을 1시간으로 설정
    );
    // 성공 시 헤더에 authorization 토큰 추가
    res.setHeader("authorization", `Bearer ${token}`);
    // 로그인 성공 메시지와 사용자 키 반환
    return res.status(200).json({
      message: "로그인 되었습니다",
      userId: User.userId, // 로그인된 사용자의 고유 키
    });
  } catch (error) {
    console.error(error); // 에러를 콘솔에 출력
    return res.status(500).json({ errorMessage: "서버 에러" }); // 서버 에러 메시지 반환
  }
});
/** 사용자 로그아웃 기능 */
router.post("/logout", (req, res) => {
  try {
    // 요청 헤더에서 Authorization 값 가져오기
    const { authorization } = req.headers;

    if (!authorization) {
      return res.status(401).json({
        message: "Authorization 헤더가 필요합니다.",
      });
    }

    // 헤더에서 Bearer와 토큰 분리
    const [tokenType, token] = authorization.split(" ");

    if (!token || tokenType !== "Bearer") {
      return res.status(401).json({
        message: "잘못된 토큰 형식입니다.",
      });
    }

    // 토큰 검증 (토큰이 유효한지 확인)
    jwt.verify(token, process.env.SECRET_KEY, (err) => {
      if (err) {
        return res.status(401).json({
          message: "유효하지 않은 토큰입니다.",
        });
      }
    });

    return res.status(200).json({
      message: "로그아웃 되었습니다.",
    });
  } catch (error) {
    console.error("로그아웃 처리 중 에러:", error.message);
    return res.status(500).json({
      message: "서버 에러가 발생했습니다.",
    });
  }
});
/*사용자 프로필 조회*/
router.get("/me", authMiddleware, async (req, res, next) => {
  const { userId } = req.user;
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
});

/*사용자 프로필 수정*/
router.patch("/me", authMiddleware, async (req, res, next) => {
  const { userId } = req.user;
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
});

/*이메일 보내기*/
router.post("/emailauth", async (req, res, next) => {
  const { email } = req.body;
  const number = generateRandomNumber(111111, 999999);
  const expiresAt = new Date(Date.now() + 3 * 60 * 1000);
  const authnumber = number;
  try {
    let transporter = nodemailer.createTransport({
      service: "Naver",
      auth: {
        user: process.env.NODEMAILER_USER, //  계정 아이디를 입력
        pass: process.env.NODEMAILER_PASS, //  계정의 비밀번호를 입력
      },
    });

    let mailOptions = {
      from: process.env.NODEMAILER_USER, // 발송 메일 주소 (위에서 작성한  계정 아이디)
      to: email, // 수신 메일 주소
      subject: "안녕하세요, 뉴스피드입니다. 이메일 인증을 해주세요.",
      text: "오른쪽 숫자 6자리를 입력해주세요 : " + authnumber,
    };
    const authemail = await prisma.emailauth.findFirst({
      where: { email },
    });
    console.log(authemail);
    if (!authemail) {
      await prisma.emailauth.create({
        data: {
          email: email,
          authCode: authnumber,
          authTime: new Date(), // 현재 시간 저장
          expiresAt: expiresAt,
        },
      });
    }
    if (authemail) {
      await prisma.emailauth.update({
        where: { email },
        data: {
          authCode: authnumber,
          authTime: new Date(),
          expiresAt: expiresAt,
        },
      });
    }

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
    req.session.checkemail = email;
    res.status(200).json({ message: "이메일 전송 완료" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "이메일 전송 실패" });
  }
});

/*이메일 인증 확인*/
router.post("/checkemail", async (req, res) => {
  const { authCode } = req.body;
  const email = req.session.checkemail;
  const authemail = await prisma.emailauth.findFirst({
    where: { email },
  });
  console.log(authemail);
  try {
    if (!authemail) {
      return res
        .status(400)
        .json({ message: "인증 코드가 존재하지 않습니다." });
    }

    const { authCode: storedCode, expiresAt } = authemail;
    // 인증 코드가 일치하는지 확인하고, 만료 여부 체크
    if (storedCode === authCode) {
      if (new Date() < expiresAt) {
        return res.status(200).json({ message: "인증 성공" });
      } else {
        return res.status(400).json({ message: "인증 코드가 만료되었습니다." });
      }
    }
    if (storedCode !== authCode) {
      return res
        .status(400)
        .json({ message: "인증 코드가 일치하지 않습니다." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "인증 코드 확인 실패" });
  }
});

export default router;
