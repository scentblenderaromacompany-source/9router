const fs = require('fs');
const path = './open-sse/providers/registry';
const file = 'ollama.js';
const content = fs.readFileSync(`${path}/${file}`, 'utf8');
console.log('File content (first 500 chars):');
console.log(content.substring(0, 500));
