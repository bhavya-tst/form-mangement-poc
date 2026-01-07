import { getAssetContent } from './service.js';
import logger from '../../utils/logger.js';
import { ASSET_URLS } from './constant.js';
import { WebsitesService } from '../websites/service.js';
import { FormsService } from '../forms/service.js';
import Form from '../forms/model.js';
import axios from 'axios';
import CacheManager from '../../utils/cacheManager.js';

/**
 * Redirects CSS asset to CDN
 */
export const redirectCSS = (req, res, next) => {
  try {
    return res.redirect(302, ASSET_URLS.CSS);
  } catch (error) {
    next(error);
  }
};

/**
 * Redirects JS asset to CDN
 */
export const redirectJS = (req, res, next) => {
  try {
    return res.redirect(302, ASSET_URLS.JS);
  } catch (error) {
    next(error);
  }
};

/**
 * Serves the links json.
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

/**
 * Serves quote-form.iife.js based on domain mapping.
 * Uses in-memory cache for zero database overhead.
 * All content is pre-fetched and stored, so no external calls needed.
 * Automatically falls back to default form if domain not mapped.
 */
export const getQuoteForm = async (req, res, next) => {
  try {
    // Extract domain from request (can be from header, query param, or hostname)
    const domain = (req.query.domain || req.get('host') || req.hostname).toLowerCase().trim();
    
    logger.info(`[Assets] Serving quote-form.iife.js for domain: ${domain}`);

    // Get form content from cache (includes automatic fallback to default)
    // Content is already pre-fetched and stored as a string
    const content = CacheManager.getFormContent(domain);

    if (!content) {
      logger.error('[Assets] No form available (cache not initialized or no default form)');
      return res.status(503).json({
        status: 503,
        message: 'Service temporarily unavailable - form cache not ready'
      });
    }

    // Serve the JavaScript file directly from cache
    res.set('Content-Type', 'application/javascript');
    res.send(content);
    
    logger.info(`[Assets] Successfully served ${content.length} bytes`);
  } catch (error) {
    logger.error(`[Assets] Error serving quote-form.iife.js: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

