const router = require("express").Router();
const axios = require("axios");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const USERS = require("./Users");
let refreshTokens = [];
let ACCESS_TOKEN_SECRET;
let REFRESH_TOKEN_SECRET;
function passTokens(refreshToken, accessToken) {
  REFRESH_TOKEN_SECRET = refreshToken;
  ACCESS_TOKEN_SECRET = accessToken;
}

router.post("/register", async (req, res) => {
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

router.post("/login", async (req, res) => {
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

router.post("/new-token", (req, res) => {
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

router.delete("/delete", (req, res) => {
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

router.delete("/logout", (req, res) => {
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

module.exports = { router, passTokens };
