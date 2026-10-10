const fs = require('fs');
const filePath = './package.json';
const versionPath = './src/version.json';
const { randomUUID } = require('crypto');

const packageJson = JSON.parse(fs.readFileSync(filePath).toString());

const version = {
  version: packageJson.version,
  uuid: randomUUID(),
  timestamp: new Date().toISOString(),
};

fs.writeFileSync(versionPath, JSON.stringify(version, null, 2));
