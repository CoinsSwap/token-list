// const list = require('./build/commonjs/tokens.js');
//
// for (const token of list) {
//   if (!token.icons) process.exit(1)
//   for (const icon of Object.keys(token.icons)) {
//     if (!token.icons[icon].includes('https')) {
//       console.error(`${token.icons[icon]} isn't an url`);
//       process.exit(`${token.icons[icon]} isn't an url`)
//     }
//   }
// }

const TokenList = require('./token-list');

(async () => {
  const list = await new TokenList()
  console.log(list);

  process.exit(0)
})()
