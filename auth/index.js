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
let users = [];
let refreshTokens = [];

mongoose
  .connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("\n\t Connected TO Mongooo");
    users = await USERS.find({});
    console.log(users);
    console.log("++++++++++++++++++++++++++++++++++++++");
  })
  .catch((e) => {
    console.log("Failed to connect to MONGOO", e.message);
  });
/*
{
  userName : "abc",
  password: "abc",
  isSeller : false
}
*/

const addNewUserToDB = (user) => {
  const { userName, password, isSeller } = user;
  const newUser = new USERS({
    userName,
    password,
    isSeller,
  });

  // Save the user to the database
  newUser
    .save()
    .then((savedUser) => {
      console.log("User saved:", savedUser);
    })
    .catch((error) => {
      console.error("Error saving user:", error);
    });
};

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

    addNewUserToDB(user);
    users.push(user);
    res.status(201).send();
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

app.post("/auth/login", async (req, res) => {
  const { userName, password } = req.body;
  users = await USERS.find({});
  if (userName == null || password == null) {
    return res.status(400).send("Bad Request");
  }
  const user = users.find((user) => user.userName == userName);
  if (user == null || user == undefined) {
    return res.status(400).send("Can not find user");
  }
  // try {
  //   console.log("PASSAEWORD TI COMPATEEEE L ", user.password);
  //   if (await bcrypt.compare(password, user.password)) {
  //     const jwtUser = { userName };
  //     const accessToken = generateAccessToken(user);
  //     const refreshToken = generateRefreshToken(user);
  //     refreshTokens.push(refreshToken);
  //     return res.status(201).send({
  //       userName: user.userName,
  //       isSeller: user.isSeller,
  //       accessToken,
  //       refreshToken,
  //     });
  //   } else {
  //     return res.status(400).send("Wrong password");
  //   }
  // } catch (err) {
  //   console.log(err.message);
  //   res.status(500).send();
  // }

  // Perform password comparison during login
  USERS.findOne({ userName })
    .then((user) => {
      if (!user) {
        // User not found
        console.log("Invalid username or password");
        return;
      }

      // Compare the provided password with the hashed password stored in the database
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          console.error("Error comparing passwords:", err);
          return;
        }

        if (result) {
          console.log("Login successful");
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
          console.log("Invalid username or password");
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
