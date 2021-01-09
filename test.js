const list = require('./build/commonjs/tokens.js');

for (const token of list) {
  if (!token.icons) process.exit(1)
  for (const icon of Object.keys(icons)) {
    if (icons[icon].includes('https')) {
      console.error(`${icons[icon]} isn't an url`);
      process.exit(`${icons[icon]} isn't an url`)
    }
  }
}

process.exit(0)
