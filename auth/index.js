const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const ACCESS_TOKEN_SECRET =
  "cfb62c7e5f017b1531ecf97e60c1e90b2927a5923a163a43e287e50ac21cab5192a03c6e1698bd7012153f985274cf8d6b9eb84b3efa10d895278b68442f89bf";

const REFRESH_TOKEN_SECRET =
  "2a2edf1b9edae5ef7c99656d615743eddd2d5e7d28b67ac1f762ce26ebd05f1fe66fc26f1af462e97dc063e98dad9b395949eea722530ea0c081b4d1c30dc572";

/*
{
  userName : "abc",
  password: "abc",
  isSeller : false
}
*/

const users = [];

let refreshTokens = [];

app.post("/auth/register", async (req, res) => {
  try {
    const { userName, password, isSeller } = req.body;
    if (userName == null || password == null || isSeller == null) {
      return res.status(400).send("Bad Request");
    }
    const checkUser = users.find((user) => user.userName === userName);
    if (checkUser != undefined) {
      return res.status(400).send("User already exists");
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = {
      userName,
      password: hashedPassword,
      isSeller: isSeller,
    };
    users.push(user);
    res.status(201).send();
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

app.post("/auth/login", async (req, res) => {
  const { userName, password } = req.body;
  if (userName == null || password == null) {
    return res.status(400).send("Bad Request");
  }
  const user = users.find((user) => user.userName == userName);
  if (user == null || user == undefined) {
    return res.status(400).send("Can not find user");
  }
  try {
    if (await bcrypt.compare(password, user.password)) {
      const jwtUser = { userName };
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);
      refreshTokens.push(refreshToken);
      return res.status(201).send({
        userName: user.userName,
        isSeller: user.isSeller,
        accessToken,
        refreshToken,
      });
    } else {
      return res.status(400).send("Wrong password");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

app.post("/auth/new-token", (req, res) => {
  //generate new access token from refresh token
  const refreshToken = req.body.refreshToken;
  if (refreshToken == null) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(401);
  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ userName: user.userName });
    return res.json({ accessToken });
  });
});

app.delete("/auth/logout", (req, res) => {
  refreshTokens = refreshTokens.filter(
    (refreshToken) => refreshToken != req.body.refreshToken
  );
  res.sendStatus(204);
});

function generateRefreshToken(user) {
  return jwt.sign(user, REFRESH_TOKEN_SECRET);
}

function generateAccessToken(user) {
  return jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: "25s" });
}

// ---------------------------Another server

const posts = [
  {
    userName: "Test",
    title: "Post 1",
  },
  {
    userName: "Jim",
    title: "Post 2",
  },
];

app.get("/user/posts", authenticateToken, (req, res) => {
  //authentication middle ware will set user based on jwt so no need to get user from request
  //getting posts from jwt token user
  res.json(posts.filter((post) => post.userName === req.user.userName));
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  try {
    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
      console.log(err);
      if (err) {
        return res.sendStatus(403);
      }
      //set user from jwt token
      req.user = user;
      next();
    });
  } catch (err) {
    console.log(err);
  }
}

app.listen(3001, () => {
  console.log("Listening on port 3001 !!");
});
