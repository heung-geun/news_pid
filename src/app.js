import express from "express";
import session from "express-session";
import path from "path";
import cors from "cors";
import UsersRouter from "./routers/user.router.js";
import likeRouter from "./routers/like.router.js";
import postsRouter from "./routers/post.router.js";
import crudRouter from "./routers/crud.router.js";
import cmRouter from "./routers/cm.router.js";
import s3Router from "./routers/s3.router.js";

const app = express();
const PORT = 3030;

// 정적 파일 제공
app.use(express.static(path.join(process.cwd(), "public")));

// 정적 파일 제공 설정
app.use('/uploads', express.static('uploads'));

app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

app.use(
  cors({
    origin: ["http://127.0.0.1:5500", "http://localhost:3030"],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);


app.use(
  session({
    secret: process.env.SESSEION_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(express.json());

app.use("/api", [
  UsersRouter,
  likeRouter,
  postsRouter,
  crudRouter,
  cmRouter,
  s3Router,
]);

app.use('/api/s3', s3Router);

app.listen(PORT, () => {
  console.log(PORT, "3030포트로 서버가 열렸어요!");
});
