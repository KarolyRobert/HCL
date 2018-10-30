const express = require("express");
const Http_Crypto = require("./http_crypto");
const session = require("express-session");

const app = express();
app.set("trust proxy", 1);

app.use(
  session({
    secret: "sessionsecret",
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: 3600000 }
  })
);

var http_crypto = new Http_Crypto({
  serverkey: "",
  clientkey: ""
});

const port = 3000;

app.use(http_crypto.middlaware);

app.post("/", (req, res) => {
  console.log("A bajött kérés:", req.json);
  console.log(
    req.headers["cf-connecting-ip"] ||
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress
  );
  res.send("helo world phillipp");
});
app.post("/devices", (req, res) => res.send("devices"));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
