require("dotenv").config();
const express = require("express");
const formidableMiddleware = require("express-formidable");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

//Initialize
const app = express();
app.use(formidableMiddleware());

mongoose.connect("mongodb://localhost:27017/tictac", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let tokenRateLimit = {};
const User = require("./model/User");

// Justify send content
app.post("/api/justify", (req, res) => {
  let { text } = req.fields;
  const userToken = req.headers["authorization"];

  try {
    // Verify if the token is send
    if (typeof userToken !== "undefined") {
      // Check if the token match Authorization
      jwt.verify(userToken, "secretkey", (err) => {
        if (err) {
          res.status(403).json({ message: "Access Denied !" });
          return;
        } else {
          textToJustify();
        }
      });
      // send an error if no token send
    } else {
      res.status(403).json({ message: "Access Denied :/" });
    }
    function textToJustify() {
      // Check content
      if (!text) {
        res.status(400).json({ message: "No content" });
        return;
      }
      // Check user data
      if (!userRates()) {
        return;
      }
      let charLine = 79;
      let newText = "";

      for (let i = 0; i < text.length; i++) {
        newText += text[i];

        if (i == charLine) {
          if (text[i] === " " || text[i] === "," || text[i] === ".") {
            newText += "\n";
            charLine = i + 1 + 80;
          } else {
            let j = 0;
            while (text[i] !== " " && text[i] !== "." && text[i] !== ",") {
              i--;
              j++;
            }
            newText = newText.substring(0, newText.length - j);
            newText = newText + "\n";
            charLine = i + 80;
          }
        }
      }
      res.status(200).contentType("text/plain").send(newText);
    }
    // Check if user is alloyed to justify content
    function userRates() {
      let userRateLimit = tokenRateLimit;
      if (!userRateLimit || !userRateLimit.date) {
        res.status(403).json({ message: "Access Denied" });
        return false;
      }

      let userDay = userRateLimit.date.getDate();
      let currentDay = new Date().getDate();

      if (currentDay !== userDay) {
        userRateLimit.date = new Date();
        userRateLimit.words = 0;
      }

      if (userRateLimit.words + text.length > 80000) {
        res.status(402).json({ message: "402 Payment Required." });
        return false;
      }

      userRateLimit.words = userRateLimit.words + text.length;
      return true;
    }
  } catch (error) {
    res.status(400).json(error.message);
  }
});

// Send acess token
app.post("/api/token", async (req, res) => {
  const { email } = req.fields;
  try {
    // seek for the user in DB
    const user = await User.findOne({ email: email });
    //verify is the email is send
    if (email) {
      //verify is the user is find
      if (user) {
        jwt.sign({ email }, "secretkey", { expiresIn: "24h" }, (err, token) => {
          tokenRateLimit = { token: token, words: 0, date: new Date() };
          res.status(200).json({ token });
        });
      } else {
        if (user === null) {
          const newUsers = new User({
            email: email,
          });
          await newUsers.save();
          jwt.sign(
            { email },
            "secretkey",
            { expiresIn: "24h" },
            (err, token) => {
              tokenRateLimit = { token: token, words: 0, date: new Date() };
              res.status(200).json({ token });
            }
          );
        }
      }
    } else {
      res.status(400).json({ message: "Email is missing" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// API home page
app.get("/api", (req, res) => {
  res.status(200).json({
    message: "Welcome to the API",
  });
});

app.all("*", (req, res) => {
  res.status(404).json({ message: "Cette route n'existe pas !" });
});

app.listen(process.env.PORT, () => {
  console.log("Started :))");
});
