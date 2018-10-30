const RSA = require("./components/rsa-wrapper");
const AES = require("./components/aes-wrapper");
const path = require("path");
const fs = require("fs");

class Http_Cripto {
  constructor(options) {
    this.serverKey = options.serverkey;
    this.clientKey = options.clientkey;
    this.AESKey = null;
    this.map = this.map.bind(this);
    this.middlaware = [this.parser, this.map];

    /*TODO később az options-ból veszi a kulcsokat */

    this.clientKey = RSA.loadKey(__dirname, "client.public.pem");
    this.serverKey = RSA.loadKey(__dirname, "server.private.pem");
  }
  parser(req, res, next) {
    if (req.is("text/*")) {
      req.text = "";
      req.setEncoding("utf8");
      req.on("data", function(chunk) {
        req.text += chunk;
      });
      req.on("end", next);
    } else {
      next();
    }
  }
  map(req, res, next) {
    var temp = res.send;
    var that = this;
    res.send = function() {
      //
      var result = AES.createAesMessage(that.AESKey, arguments[0]);
      arguments[0] = result;
      temp.apply(res, arguments);
    };
    var request = null;
    try {
      if (req.session.aesKey) {
        console.log("létező session", req.session.aesKey);
        /*
        kérés dekódolása session.crypto kulcsal.
        */
      } else {
        console.log("új session");

        //rsa dekódolás -> cliens public key kinyerése
        //(cliens public key beállítása sessionba.)
        //aes kulcs generálása
        var sessionAES = AES.generateKey();
        //aes kulcs mentése sessionba
        req.session.aesKey = sessionAES;
        //aes kulcs kódoloása cliens public key-el
        //kódolt aes kulcs küldése válaszként.
      }
      // ha json érkezett akkor ez handshake vagy támadás
      request = JSON.parse(req.text);
      try {
        // beérkező handshake hitelességének ellenőrzése.
        var hs = RSA.decrypt(this.serverKey, request.handshake);
        if (hs === "handshake") {
          console.log("Handshake...");
          this.AESKey = AES.generateKey();
          var aes = RSA.encrypt(this.clientKey, this.AESKey.toString("base64"));
          arguments[0] = aes;
          temp.apply(res, arguments);
        } else {
          // kritikus hiba (A handshake dekódolható, de az nem handshake valaki szórakozik.)
          console.log("Kritikus hiba!\n handshake:", hs);
          //TODO ip stb
          arguments[0] = "access denied";
          temp.apply(res, arguments);
        }
      } catch (e) {
        console.log("Bejövő Handshake invalid", e);
        //TODO ip stb
        arguments[0] = "access denied";
        temp.apply(res, arguments);
      }

      console.log(request);
    } catch (e) {
      // nem json érkezett, AES dekódolás.
      // ha nem handshake akkor AES kódolt üzenet.
      console.log("AES dekódolás...");
      req.json = JSON.parse(AES.decrypt(this.AESKey, req.text));
      console.log(res.json);
      next();
    }
  }
}

module.exports = Http_Cripto;
