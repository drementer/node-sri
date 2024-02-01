const { createHash } = require('crypto');
const { resolve, join } = require('path');
const { readdirSync, readFileSync, writeFileSync } = require('fs');

const srcPath = resolve(__dirname, 'test/src');
const distPath = resolve(__dirname, 'test/dist');

const files = readdirSync(srcPath, { recursive: true });
const htmlFiles = files.filter((file) => file.endsWith('.html'));

const getFileData = async (file, isAsset) => {
  if (isAsset) {
    return await fetch(file).then((res) => res.text());
  }

  return readFileSync(join(srcPath, file), 'utf8');
};

const createIntegrity = async (file) => {
  const data = await getFileData(file, true);
  const hash = createHash('sha384');
  hash.update(data);

  return `sha384-${hash.digest('base64')}`;
};

const getAssets = async (fileData) => {
  const linkAssets = fileData.match(/<link.*?href="(.*?)".*?>/g) || [];
  const scriptAssets = fileData.match(/<script.*?src="(.*?)".*?>/g) || [];

  const linkHref = linkAssets.map((asset) => asset.match(/href="(.*?)"/)[1]);
  const scriptSrc = scriptAssets.map((asset) => asset.match(/src="(.*?)"/)[1]);

  return [...linkHref, ...scriptSrc];
};

const updateAsset = async (assetSource) => {
  const integrity = await createIntegrity(assetSource);

  return {
    original: assetSource,
    updated: `${assetSource}" integrity="${integrity}" crossorigin="anonymous`,
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

  writeFileSync(join(distPath, file), updatedData);
};

htmlFiles.forEach(updateFile);
