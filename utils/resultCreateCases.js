const { saveResult } = require('./result');

function checkCases(message) {
    content = message.content;
    if (content.startsWith("$add")) return saveResult(content);
}

module.exports = checkCases;