import express from "express";
import session from "express-session";
import UsersRouter from "./routers/user.router.js";

const app = express();
const PORT = 3030;

app.use(
  session({
    secret: process.env.SESSEION_KEY, // 비밀 키
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // HTTPS를 사용할 경우 true로 설정
  }),
);
app.use(express.json());
app.use("/api", [UsersRouter]);

app.listen(PORT, () => {
  console.log(PORT, "3030포트로 서버가 열렸어요!");
});
