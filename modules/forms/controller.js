
import { FormsService } from "./service.js";
import { usersqquery } from "../../utils/sqquery.js";
import sequelize from "../../configs/db.js";
import { Op } from "sequelize";
import CacheManager from "../../utils/cacheManager.js";
import axios from "axios";
import logger from "../../utils/logger.js";

export async function getForms(req, res) {
  try {
    const q = req.query;
    const queryOptions = usersqquery(q, {}, ["version"]);
    
    // Sort logic handled by usersqquery mostly, but defaulting 
    const data = await FormsService.findAndCountAll(queryOptions);
    
    res.status(200).json({
      status: 200,
      message: "Forms fetched successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
}

export async function getFormsForDropdown(req, res) {
  try {
    // Fetch only essential fields for dropdown (exclude heavy fileContent)
    const data = await FormsService.findAll({
      attributes: ['id', 'version', 'isDefault', 'versionNumber'],
      order: [['versionNumber', 'DESC']],
    });
    
    res.status(200).json({
      status: 200,
      message: "Forms fetched successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
}

export async function createForm(req, res) {
  const t = await sequelize.transaction();
  try {
    const { sourceType, cdnUrl, fileContent } = req.body;
    
    // Get the maximum version number to generate next version
    // Use paranoid: false to include soft-deleted records in the count
    const maxVersionForm = await FormsService.findOne({
      order: [['versionNumber', 'DESC']],
      paranoid: false,  // Include soft-deleted forms
      transaction: t
    });
    
    const nextVersionNumber = maxVersionForm ? maxVersionForm.versionNumber + 1 : 1;
    const version = `v${nextVersionNumber}`;
    
    // Check if this is the first active (non-deleted) form
    const activeFormsCount = await FormsService.count({ transaction: t });
    const isDefault = activeFormsCount === 0; // First active form is default
    
    // Prepare form data
    const formData = {
      version,
      versionNumber: nextVersionNumber,
      isDefault,
      sourceType
    };
    
    let jsContent = null;
    
    // Fetch and validate content based on source type
    if (sourceType === 'cdn') {
      if (!cdnUrl) {
        await t.rollback();
        return res.status(400).json({ 
          status: 400, 
          message: "CDN URL is required for CDN source type" 
        });
      }
      
      try {
        logger.info(`[Forms] Fetching form content from CDN: ${cdnUrl}`);
        const response = await axios.get(cdnUrl, {
          timeout: 10000, // 10 second timeout
          validateStatus: (status) => status === 200
        });
        
        jsContent = response.data;
        
        if (!jsContent || typeof jsContent !== 'string') {
          throw new Error('Invalid content received from CDN');
        }
        
        logger.info(`[Forms] Successfully fetched ${jsContent.length} bytes from CDN`);
        
        // Store both CDN URL and fetched content
        formData.cdnUrl = cdnUrl;
        formData.fileContent = jsContent;
      } catch (error) {
        await t.rollback();
        logger.error(`[Forms] Failed to fetch from CDN: ${error.message}`);
        return res.status(400).json({ 
          status: 400, 
          message: `Failed to fetch form from CDN: ${error.message}. Please verify the URL is accessible and returns valid JavaScript content.` 
        });
      }
    } else if (sourceType === 'file') {
      if (!fileContent) {
        await t.rollback();
        return res.status(400).json({ 
          status: 400, 
          message: "File content is required for file source type" 
        });
      }
      
      jsContent = fileContent;
      formData.fileContent = jsContent;
      formData.cdnUrl = null;
    } else {
      await t.rollback();
      return res.status(400).json({ 
        status: 400, 
        message: "Invalid source type. Must be 'cdn' or 'file'" 
      });
    }
    
    const newForm = await FormsService.create(formData, { transaction: t });
    
    await t.commit();
    
    // Add form to cache
    await CacheManager.addForm(newForm);
    
    logger.info(`[Forms] Created form ${version} with ${jsContent.length} bytes of content`);
    
    res.status(201).json({
      status: 201,
      message: "Form version created successfully",
      data: newForm,
    });
  } catch (error) {
    await t.rollback();
    logger.error(`[Forms] Error creating form: ${error.message}`);
    logger.error(`[Forms] Error name: ${error.name}`);
    logger.error(`[Forms] Error stack: ${error.stack}`);
    
    // Handle unique constraint violation (version number conflict)
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ 
        status: 409, 
        message: 'A form with this version number already exists. Please try again.' 
      });
    }
    
    // Log Sequelize validation errors in detail
    if (error.name === 'SequelizeValidationError' && error.errors) {
      logger.error(`[Forms] Validation errors:`, JSON.stringify(error.errors, null, 2));
    }
    
    res.status(500).json({ status: 500, message: error.message });
  }
}

export async function setDefaultForm(req, res) {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    
    // Check if form exists
    const form = await FormsService.findOne({ where: { id }, transaction: t });
    if (!form) {
      await t.rollback();
      return res.status(404).json({ status: 404, message: "Form not found" });
    }

    // If already default, no need to update
    if (form.isDefault) {
      await t.rollback();
      return res.status(200).json({
        status: 200,
        message: "Form is already set as default",
        data: form,
      });
    }

    // Clear isDefault from all forms
    await FormsService.update(
      { isDefault: false },
      { where: { isDefault: true }, transaction: t }
    );

    // Set the specified form as default
    await FormsService.update(
      { isDefault: true },
      { where: { id }, transaction: t }
    );

    // Fetch updated form
    const updatedForm = await FormsService.findOne({ where: { id }, transaction: t });
    
    await t.commit();
    
    // Update default form in cache
    CacheManager.updateDefaultForm(updatedForm.version);
    
    res.status(200).json({
      status: 200,
      message: "Form set as default successfully",
      data: updatedForm,
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ status: 500, message: error.message });
  }
}

export async function deleteForm(req, res) {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    
    const form = await FormsService.findOne({ where: { id }, transaction: t });
    if (!form) {
      await t.rollback();
      return res.status(404).json({ status: 404, message: "Form not found" });
    }

    if (form.isDefault) {
      await t.rollback();
      return res.status(400).json({ status: 400, message: "Cannot delete the default form version." });
    }

    // Check if in use (concepts of 'in use' might depend on Websites mapping)
    // We will need Website model here or associations later. 
    // For now, assuming standard FK constraint will prevent deletion if websites exist.
    
    await FormsService.remove({ where: { id }, transaction: t });
    
    await t.commit();
    
    // Remove form from cache
    CacheManager.removeForm(form.version);
    
    res.status(200).json({
      status: 200,
      message: "Form deleted successfully",
    });
  } catch (error) {
    await t.rollback();
    // Handle FK violation for 'in use'
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ status: 400, message: "Cannot delete form version that is in use by websites." });
    }
    res.status(500).json({ status: 500, message: error.message });
  }
}
