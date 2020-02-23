const fs = require("fs");
const filePath = "./package.json";
const versionPath = "./src/version.json";
const uuidv4 = require('uuid/v4');

const packageJson = JSON.parse(fs.readFileSync(filePath).toString());

const version = {
  version: packageJson.version,
  uuid: uuidv4(),
  timestamp: new Date().toISOString()
};

fs.writeFileSync(versionPath, JSON.stringify(version, null, 2));
