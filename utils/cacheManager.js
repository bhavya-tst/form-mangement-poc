import { FormsService } from '../modules/forms/service.js';
import { WebsitesService } from '../modules/websites/service.js';
import Form from '../modules/forms/model.js';
import logger from './logger.js';

class CacheManager {
  constructor() {
    if (!CacheManager.instance) {
      // Form content map: { "v1": "js content", "v2": "js content", ... }
      this.formContentMap = new Map();
      
      // Domain mapping: { "localhost:3000": "v2", "abc.com": "v1", ... }
      this.domainMap = new Map();
      
      // Default form version for fallback
      this.defaultFormVersion = null;
      
      // Initialization flag
      this.initialized = false;
      
      CacheManager.instance = this;
    }
    return CacheManager.instance;
  }

  /**
   * Initialize cache from database on server startup
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      logger.info('[CacheManager] Initializing form cache...');
      
      // Load all forms from database (paranoid mode excludes soft-deleted records)
      const forms = await FormsService.findAll({
        attributes: ['id', 'version', 'versionNumber', 'isDefault', 'sourceType', 'cdnUrl', 'fileContent']
      });
      
      if (!forms || forms.length === 0) {
        logger.warn('[CacheManager] No forms found in database');
        this.initialized = true;
        return;
      }
      
      // Populate form content map
      for (const form of forms) {
        await this._loadFormContent(form);
        
        // Track default form
        if (form.isDefault) {
          this.defaultFormVersion = form.version;
          logger.info(`[CacheManager] Default form set to: ${form.version}`);
        }
      }
      
      // Load all website mappings (paranoid mode excludes soft-deleted records)
      const websites = await WebsitesService.findAll({
        include: [{ model: Form, attributes: ['version'] }]
      });
      
      // Populate domain map
      for (const website of websites) {
        if (website.Form && website.Form.version) {
          this.domainMap.set(website.domain, website.Form.version);
        }
      }
      
      logger.info(`[CacheManager] Cache initialized successfully`);
      logger.info(`[CacheManager] Loaded ${this.formContentMap.size} forms and ${this.domainMap.size} domain mappings`);
      this.initialized = true;
    } catch (error) {
      logger.error(`[CacheManager] Failed to initialize cache: ${error.message}`, { stack: error.stack });
      throw error;
    }
  }

  /**
   * Load form content into cache
   * All forms now store content in fileContent (even CDN sources are pre-fetched)
   * @private
   */
  async _loadFormContent(form) {
    try {
      if (!form.fileContent) {
        logger.warn(`[CacheManager] Form ${form.version} has no content stored`);
        return;
      }
      
      // All content is stored in fileContent, regardless of source type
      // CDN sources are pre-fetched during creation
      const content = form.fileContent;
      
      this.formContentMap.set(form.version, content);
      logger.info(`[CacheManager] Loaded form ${form.version} (${form.sourceType}, ${content.length} bytes)`);
    } catch (error) {
      logger.error(`[CacheManager] Failed to load form ${form.version}: ${error.message}`);
    }
  }

  /**
   * Get form content for a given domain (fast lookup with fallback to default)
   * @param {string} domain - The domain to lookup
   * @returns {string|null} Form JavaScript content or null if no default exists
   */
  getFormContent(domain) {
    if (!this.initialized) {
      logger.error('[CacheManager] Cache not initialized');
      return null;
    }
    
    // Normalize domain (safe with optional chaining for null domains)
    const normalizedDomain = domain?.toLowerCase()?.trim();
    
    // Try to find domain mapping
    let version = this.domainMap.get(normalizedDomain);
    
    if (!version) {
      // Fallback to default form
      logger.info(`[CacheManager] Domain ${normalizedDomain || 'not provided'} not found, using default form`);
      version = this.defaultFormVersion;
    }
    
    if (!version) {
      logger.error('[CacheManager] No default form available');
      return null;
    }
    
    // Get form content from map (now returns string directly)
    const content = this.formContentMap.get(version);
    
    if (!content) {
      logger.error(`[CacheManager] Form ${version} not found in cache`);
      return null;
    }
    
    return content;
  }

  /**
   * Add a new form to cache
   * @param {Object} form - Form object from database
   */
  async addForm(form) {
    await this._loadFormContent(form);
    
    if (form.isDefault) {
      this.defaultFormVersion = form.version;
      logger.info(`[CacheManager] Default form updated to: ${form.version}`);
    }
    
    logger.info(`[CacheManager] Added form ${form.version} to cache`);
  }

  /**
   * Remove a form from cache
   * @param {string} version - Form version to remove
   */
  removeForm(version) {
    this.formContentMap.delete(version);
    logger.info(`[CacheManager] Removed form ${version} from cache`);
  }

  /**
   * Update the default form version
   * @param {string} version - New default form version
   */
  updateDefaultForm(version) {
    this.defaultFormVersion = version;
    logger.info(`[CacheManager] Default form updated to: ${version}`);
  }

  /**
   * Add a website domain mapping
   * @param {string} domain - Domain name
   * @param {string} version - Form version
   */
  addWebsite(domain, version) {
    const normalizedDomain = domain.toLowerCase().trim();
    this.domainMap.set(normalizedDomain, version);
    logger.info(`[CacheManager] Added domain mapping: ${normalizedDomain} -> ${version}`);
  }

  /**
   * Remove a website domain mapping
   * @param {string} domain - Domain name
   */
  removeWebsite(domain) {
    const normalizedDomain = domain.toLowerCase().trim();
    this.domainMap.delete(normalizedDomain);
    logger.info(`[CacheManager] Removed domain mapping: ${normalizedDomain}`);
  }

  /**
   * Update a website domain mapping
   * @param {string} domain - Domain name
   * @param {string} version - New form version
   */
  updateWebsite(domain, version) {
    const normalizedDomain = domain.toLowerCase().trim();
    this.domainMap.set(normalizedDomain, version);
    logger.info(`[CacheManager] Updated domain mapping: ${normalizedDomain} -> ${version}`);
  }

  /**
   * Rebuild entire cache from database (fallback method)
   * @returns {Promise<boolean>}
   */
  async rebuild() {
    logger.info('[CacheManager] Rebuilding entire cache...');
    
    // Clear existing cache
    this.formContentMap.clear();
    this.domainMap.clear();
    this.defaultFormVersion = null;
    this.initialized = false;
    
    // Reinitialize
    await this.initialize();
    
    logger.info('[CacheManager] Cache rebuild complete');
    return true;
  }
}

const instance = new CacheManager();

export default instance;
