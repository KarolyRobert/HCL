const rsaWrapper = require("./components/rsa-wrapper");
const path = require("path");
const fs = require("fs");
// generate opened and closed keys for browser and server
if (process.argv[2] && process.argv[3]) {
  var dir = path.resolve(process.env.PWD, process.argv[2]);
  var length = parseInt(process.argv[3]);
  console.log("Generate server and client keys to " + dir + " directory");
  //console.log("process:", process);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  rsaWrapper.generate("server", dir, length);
  rsaWrapper.generate("client", dir, length);
  console.log("Keys generated …");
} else {
  console.log(
    "usage:\n\tnode init dir length\n\tdir: directory for keys\n\tlength: 1024|2048|4096"
  );
}
