import { getAssetContent } from './service.js';
import logger from '../../utils/logger.js';
import { ASSET_URLS } from './constant.js';

/**
 * Serves the JS asset.
 */
export const getLinks = async (req, res, next) => {
  try {
    const content = {
      css: ASSET_URLS.CSS,
      js: ASSET_URLS.JS
    };
    res.set('Content-Type', 'application/json');
    res.status(200).send(content);
  } catch (error) {
    next(error);
  }
};
/**
 * Serves the JS asset.
 */
export const getJs = async (req, res, next) => {
  try {
    const content = await getAssetContent('JS');
    res.set('Content-Type', 'application/javascript');
    res.send(content);
  } catch (error) {
    next(error);
  }
};

/**
 * Serves the CSS asset.
 */
export const getCss = async (req, res, next) => {
  try {
    // const data = {
    // protocol: req.protocol,
    // domain: req.get('host'),
    // hostname: req.hostname,
    // page: req.originalUrl,
    // path: req.path,
    // method: req.method
    // };

    // console.log(data);
    const content = await getAssetContent('CSS');
    res.set('Content-Type', 'text/css');
    res.send(content);
  } catch (error) {
    next(error);
  }
};
