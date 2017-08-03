'use strict';

const path = require('path');

module.exports = async ({
  addStaticDir,
  outputDir,
  // projectRoot,
}) => {
  await addStaticDir(path.join(__dirname, 'static'), outputDir);
  await addStaticDir(path.join(__dirname, '..', 'src'), outputDir);
};
