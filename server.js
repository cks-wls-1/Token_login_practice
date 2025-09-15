const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const users = [
  {
    user_id: "test",
    user_password: "1234",
    user_name: "테스트 유저",
    user_info: "테스트 유저입니다",
  },
];

const app = express();

app.use(
  cors({
    origin: ["http://127.0.0.1:5501", "http://localhost:5501"],
    methods: ["OPTIONS", "POST", "GET", "DELETE"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

const secretKey = "ozcodingschool";

// 🟢 로그인 요청 처리 (POST /)
app.post("/", (req, res) => {
  const { userId, userPassword } = req.body;

  const userInfo = users.find(
    (el) => el.user_id === userId && el.user_password === userPassword
  );

  if (!userInfo) {
    return res.status(401).send("로그인 실패");
  }

  // 1. accessToken 발급
  const accessToken = jwt.sign(
    {
      user_id: userInfo.user_id,
      user_name: userInfo.user_name,
      user_info: userInfo.user_info,
    },
    secretKey,
    { expiresIn: "1h" } // 토큰 유효시간
  );

  // 2. 토큰 응답 전송
  res.send(accessToken);
});

// 🟢 사용자 정보 요청 처리 (GET /)
app.get("/", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("토큰이 없습니다");
  }

  const token = authHeader.split(" ")[1]; // "Bearer <token>" 에서 토큰만 추출

  // 3. 토큰 검증
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).send("토큰이 유효하지 않습니다");
    }

    // 4. 유저정보 응답 전송
    res.send({
      user_name: decoded.user_name,
      user_info: decoded.user_info,
    });
  });
});

app.listen(3000, () => console.log("서버 실행!"));
