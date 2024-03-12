const { createHash } = require('crypto');
const { resolve, join } = require('path');
const { readdirSync, readFileSync, writeFileSync } = require('fs');

const defaultSettings = {
  srcPath: '../test/src',
  distPath: '../test/dist',
  fileFormat: '.html',
  linkRegex: /<link.*?href="(.*?)".*?>/g,
  scriptRegex: /<script.*?src="(.*?)".*?>/g,
  hrefRegex: /href="(.*?)"/,
  srcRegex: /src="(.*?)"/,
  crossorigin: 'anonymous',
};

const getSrcPath = () => resolve(__dirname, settings.srcPath);
const getDistPath = () => resolve(__dirname, settings.distPath);

const getFileData = async (file, isAsset = false) => {
  if (isAsset) return await fetch(file).then((res) => res.text());

  return readFileSync(join(getSrcPath(), file), 'utf8');
};

const createIntegrity = async (file) => {
  const data = await getFileData(file, true);
  const hash = createHash('sha384');
  hash.update(data);

  return `sha384-${hash.digest('base64')}`;
};

const getAssets = async (fileData) => {
  const linkAssets = fileData.match(settings.linkRegex) || [];
  const scriptAssets = fileData.match(settings.scriptRegex) || [];

  const linkHref = linkAssets.map(
    (asset) => asset.match(settings.hrefRegex)[1]
  );
  const scriptSrc = scriptAssets.map(
    (asset) => asset.match(settings.srcRegex)[1]
  );

  return [...linkHref, ...scriptSrc];
};

const updateAsset = async (assetSource) => {
  const integrity = await createIntegrity(assetSource);

  return {
    original: assetSource,
    updated: `${assetSource}" integrity="${integrity}" crossorigin="${settings.crossorigin}`,
  };
};

const updateAssets = async (assets) => {
  return await Promise.all(assets.map(updateAsset));
};

const updateFileData = (data, assets) => {
  let updatedData = data;

  assets.forEach((asset) => {
    updatedData = updatedData.replace(asset.original, asset.updated);
  });

  return updatedData;
};

const updateFile = async (file) => {
  const data = await getFileData(file);
  const assets = await getAssets(data);
  const updatedAssets = await updateAssets(assets);
  const updatedData = updateFileData(data, updatedAssets);

  writeFileSync(join(getDistPath(), file), updatedData);
};

let settings = { ...defaultSettings };

const RSI = (customSettings = {}) => {
  settings = { ...settings, ...customSettings };

  const files = readdirSync(getSrcPath(), { recursive: true });
  const htmlFiles = files.filter((file) => file.endsWith(settings.fileFormat));

  htmlFiles.forEach(updateFile);
};

module.exports = RSI;
