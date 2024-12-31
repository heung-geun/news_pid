import express from "express";
import session from "express-session";
import UsersRouter from "./routers/user.router.js";
import likeRouter from "./routers/like.router.js";
import postsRouter from "./routers/post.router.js";
import crudRouter from "./routers/crud.router.js";
import cmRouter from "./routers/cm.router.js";
import dotenv from "dotenv"
import fs from "fs"
import https from "https"

const app = express();
const PORT = 3002;

app.use(
  session({
    secret: process.env.SESSEION_KEY, // 비밀 키
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }, // HTTPS를 사용할 경우 true로 설정
  }),
);
app.use(express.json());

const keypath = process.env.KEY_PATH
const certpath = process.env.CERT_PATH

const key = fs.readFileSync(keypath)
const cert = fs.readFileSync(certpath)


const option = {key: key , cert: cert}


app.use("/api", [UsersRouter, likeRouter, postsRouter, crudRouter, cmRouter]);
app.use("/hello", (req ,res) => {
  res.send({message: "hello world"})
})

https.createServer(option, app).listen(PORT, () => {
  console.log("hello world")
})
