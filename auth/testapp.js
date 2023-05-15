const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
app.use(bodyParser.json());
app.use(cors());
const authRouter = require("./route.js");

const ACCESS_TOKEN_SECRET =
  "cfb62c7e5f017b1531ecf97e60c1e90b2927a5923a163a43e287e50ac21cab5192a03c6e1698bd7012153f985274cf8d6b9eb84b3efa10d895278b68442f89bf";

const REFRESH_TOKEN_SECRET =
  "2a2edf1b9edae5ef7c99656d615743eddd2d5e7d28b67ac1f762ce26ebd05f1fe66fc26f1af462e97dc063e98dad9b395949eea722530ea0c081b4d1c30dc572";

authRouter.passTokens(REFRESH_TOKEN_SECRET, ACCESS_TOKEN_SECRET);

let dbURL =
  "mongodb+srv://Simha:Simha@cluster0.w56omxb.mongodb.net/AuthenticationTest?retryWrites=true&w=majority";

app.use("/auth", authRouter.router);

mongoose
  .connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch((e) => {
    console.log("Failed to connect to MONGOO", e.message);
  });

module.exports = app;
