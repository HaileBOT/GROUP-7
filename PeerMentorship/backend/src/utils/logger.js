const fs = require('fs');
const path = require('path');

function logDebug(message) {
  const logPath = path.join(__dirname, '../../debug.log');
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logPath, `${timestamp}: ${message}\n`);
}

module.exports = logDebug;
