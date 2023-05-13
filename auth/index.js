const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const app = express();
const USERS = require("./Users");

app.use(bodyParser.json());
app.use(cors());

const ACCESS_TOKEN_SECRET =
  "cfb62c7e5f017b1531ecf97e60c1e90b2927a5923a163a43e287e50ac21cab5192a03c6e1698bd7012153f985274cf8d6b9eb84b3efa10d895278b68442f89bf";

const REFRESH_TOKEN_SECRET =
  "2a2edf1b9edae5ef7c99656d615743eddd2d5e7d28b67ac1f762ce26ebd05f1fe66fc26f1af462e97dc063e98dad9b395949eea722530ea0c081b4d1c30dc572";

let dbURL =
  "mongodb+srv://Simha:Simha@cluster0.w56omxb.mongodb.net/Authentication?retryWrites=true&w=majority";
let refreshTokens = [];

mongoose
  .connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch((e) => {
    console.log("Failed to connect to MONGOO", e.message);
  });

app.post("/auth/register", async (req, res) => {
  try {
    const { userName, password, isSeller } = req.body;
    if (userName == null || password == null || isSeller == null) {
      return res.status(400).send("Bad Request");
    }
    const checkUser = await USERS.findOne({ userName });

    if (checkUser != undefined) {
      return res.status(400).send("User already exists");
    }

    try {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
      const user = {
        userName,
        password: hashedPassword,
        isSeller: isSeller,
      };
      const newUser = new USERS(user);
      await newUser.save();
    } catch (err) {
      console.error("Error saving user:", err);
    }
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

  USERS.findOne({ userName })
    .then((user) => {
      if (!user) {
        return res.status(400).send("Invalid User");
      }

      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          console.error("Error comparing passwords:", err);
          return res.status(400).send("Invalid Password");
        }

        if (result) {
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
          return res.status(400).send("Invalid Password");
        }
      });
    })
    .catch((error) => {
      console.error("Error finding user:", error);
    });
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
  return jwt.sign({ userName: user.userName }, REFRESH_TOKEN_SECRET);
}

function generateAccessToken(user) {
  return jwt.sign({ userName: user.userName }, ACCESS_TOKEN_SECRET, {
    expiresIn: "1225s",
  });
}

app.listen(3001, () => {
  console.log("Listening on port 3001 !!");
});
