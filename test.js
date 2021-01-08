const list = require('./build/commonjs/tokens.js');

for (const token of list) {
  if (!token.icons) process.exit(1)
}

process.exit(0)
