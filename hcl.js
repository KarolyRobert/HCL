const express = require("express");
const Http_Crypto = require("./http_crypto");

const app = express();
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
