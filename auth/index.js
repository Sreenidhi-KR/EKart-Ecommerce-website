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

const users = [];

let refreshTokens = [];

app.get("/auth/test", (req, res) => {
  res.send("Hi there");
});

app.post("/auth/register", async (req, res) => {
  try {
    const { name, password, isSeller } = req.body;
    const checkUser = users.find((user) => user.name === name);
    if (checkUser != undefined) {
      return res.status(400).send("User already exists");
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = {
      name,
      password: hashedPassword,
      isSeller: isSeller ? true : false,
    };
    users.push(user);
    res.status(201).send();
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

app.post("/auth/login", async (req, res) => {
  const { name, password } = req.body;
  const user = users.find((user) => user.name == name);
  if (user == null || user == undefined) {
    return res.status(400).send("Can not find user");
  }
  try {
    if (await bcrypt.compare(password, user.password)) {
      const jwtUser = { name };
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);
      refreshTokens.push(refreshToken);
      return res
        .status(201)
        .send({ text: "Success", accessToken, refreshToken });
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
    const accessToken = generateAccessToken({ name: user.name });
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
    name: "Test",
    title: "Post 1",
  },
  {
    name: "Jim",
    title: "Post 2",
  },
];

app.get("/user/posts", authenticateToken, (req, res) => {
  //authentication middle ware will set user based on jwt so no need to get user from request
  //getting posts from jwt token user
  res.json(posts.filter((post) => post.name === req.user.name));
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
