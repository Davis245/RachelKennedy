/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("node:path");

const fontPath = path.join(process.cwd(), "app/fonts/DancingScript-wght.ttf");

module.exports = {
  "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap": `
    @font-face {
      font-family: 'Dancing Script';
      font-style: normal;
      font-weight: 700;
      font-display: swap;
      src: url(${fontPath}) format('truetype');
    }
  `,
};
