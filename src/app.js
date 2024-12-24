import express from "express";
import UsersRouter from "./routers/user.router.js";

const app = express();
const PORT = 3030;

app.use(express.json());
app.use("/api", [UsersRouter]);

app.listen(PORT, () => {
  console.log(PORT, "3030포트로 서버가 열렸어요!");
});