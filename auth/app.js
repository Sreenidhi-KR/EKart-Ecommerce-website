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

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

let dbURL = process.env.DB_URL;

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

app.delete("/auth/delete", (req, res) => {
  console.log(req.body.userName);
  USERS.deleteOne({ userName: req.body.userName })
    .then((err) => {
      console.log("deleted Successfully");
      res.sendStatus(201);
    })
    .catch((err) => {
      console.log("delete error", err);
      res.sendStatus(400);
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

module.exports = app;
