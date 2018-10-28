const path = require("path");
const rsaWrapper = {};
const fs = require("fs");
const NodeRSA = require("node-rsa");
const crypto = require("crypto");
// open and closed keys generation method
rsaWrapper.generate = (direction, base_path, length) => {
  let key = new NodeRSA();
  // 2048 — key length, 65537 open exponent
  key.generateKeyPair(length, 65537);
  //save keys as pem line in pkcs8
  //const ppem = key.exportKey("pkcs8-private-pem");
  //console.log(ppem);
  try {
    fs.writeFileSync(
      path.resolve(base_path, direction + ".private.pem"),
      key.exportKey("pkcs8-private-pem")
    );
    fs.writeFileSync(
      path.resolve(base_path, direction + ".public.pem"),
      key.exportKey("pkcs8-public-pem")
    );
  } catch (error) {
    console.log(error);
  }
  return true;
};
// encrypting RSA, using padding OAEP, with nodejs crypto:
rsaWrapper.encrypt = (publicKey, message) => {
  let enc = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.RSA_PKCS1_OAEP_PADDING
    },
    Buffer.from(message)
  );
  return enc.toString("base64");
};
// descrypting RSA, using padding OAEP, with nodejs crypto:
rsaWrapper.decrypt = (privateKey, message) => {
  let enc = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.RSA_PKCS1_OAEP_PADDING
    },
    Buffer.from(message, "base64")
  );
  return enc.toString();
};
rsaWrapper.loadKey = (base_path, name) => {
  return fs.readFileSync(path.resolve(base_path, "keys", name));
};
module.exports = rsaWrapper;
