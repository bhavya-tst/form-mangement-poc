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
 * Extracts domain and path from the Referer header.
 * @param {string} referer - The referer URL from request header
 * @returns {Object} Object containing domain and path
 * @example
 * parseReferer('https://example.com/products/item1')
 * // Returns: { domain: 'example.com', path: '/products/item1' }
 */
const parseReferer = (referer) => {
  if (!referer) {
    return { domain: null, path: null };
  }

  try {
    const url = new URL(referer);
    return {
      domain: url.hostname.toLowerCase().trim(),
      path: url.pathname
    };
  } catch (error) {
    logger.warn(`[Assets] Invalid referer URL: ${referer}`);
    return { domain: null, path: null };
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
    // Extract domain and path from the Referer header
    // This identifies which website is embedding our form
    const referer = req.get('referer');
    const { domain, path } = parseReferer(referer);

    const debugData = {
      referer,
      extractedDomain: domain,
      extractedPath: path,
      requestHost: req.get('host'),
      requestHostname: req.hostname,
      requestPath: req.path,
      method: req.method
    };

    logger.info('[Assets] Quote form request details', debugData);

    // If no referer or invalid referer, we cannot determine which form to serve
    if (!domain) {
      logger.warn('[Assets] No valid referer header - serving default form');
    }

    // Get form content from cache using the extracted domain
    // If domain is null or not found, this will automatically fall back to default
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
    
    logger.info(`[Assets] Successfully served ${content.length} bytes for domain: ${domain || 'default'}`);
  } catch (error) {
    logger.error(`[Assets] Error serving quote-form.iife.js: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

