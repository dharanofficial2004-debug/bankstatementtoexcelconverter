const fs = require("fs");

function w(file, content) {
  const dir = require("path").dirname(file);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, content, "utf8");
  console.log("wrote " + file);
}

module.exports = { w };
