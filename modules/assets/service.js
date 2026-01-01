import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { ASSET_URLS, CACHE_DIR } from './constant.js';
import logger from '../../utils/logger.js';

const getCacheDir = () => path.join(process.cwd(), CACHE_DIR);

const ensureCacheDir = () => {
  const dir = getCacheDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const assetCache = {
  JS: null,
  CSS: null,
};

/**
 * Returns the content of the asset, caching it in memory.
 * @param {string} type - 'JS' or 'CSS'
 * @returns {Promise<Buffer>} - Asset content
 */
export const getAssetContent = async (type) => {
  if (assetCache[type]) {
    return assetCache[type];
  }

  const filePath = await getAssetPath(type);
  const content = await fs.promises.readFile(filePath);
  assetCache[type] = content;
  return content;
};

/**
 * Downloads the asset if not present and returns the local file path.
 * @param {string} type - 'JS' or 'CSS'
 * @returns {Promise<string>} - Absolute path to the file
 */
export const getAssetPath = async (type) => {
  ensureCacheDir();
  const url = ASSET_URLS[type];
  if (!url) throw new Error('Invalid asset type');

  const filename = path.basename(url);
  const filePath = path.join(getCacheDir(), filename);

  if (fs.existsSync(filePath)) {
    return filePath;
  }

  try {
    logger.info(`Downloading ${type} from ${url}`);
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'stream',
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(filePath));
      writer.on('error', (err) => {
        logger.error(`Error writing file: ${err.message}`);
        reject(err);
      });
    });
  } catch (error) {
    logger.error(`Error downloading asset: ${error.message}`);
    throw error;
  }
};
