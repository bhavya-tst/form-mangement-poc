
import { WebsitesService } from "./service.js";
import { FormsService } from "../forms/service.js"; // For verify form exists
import Form from "../forms/model.js";
import { usersqquery } from "../../utils/sqquery.js";
import sequelize from "../../configs/db.js";
import CacheManager from "../../utils/cacheManager.js";
import { Op } from "sequelize";

export async function getWebsites(req, res) {
  try {
    const q = req.query;
    // Standard sqquery. Note: "search" defaults to empty, "searchFrom" needs columns.
    // User requested search(domain), filter(formId), sort.
    
    // Handle formId filter manually since usersqquery doesn't process custom filters
    const baseFilter = {};
    if (q.formId) {
      baseFilter.formId = parseInt(q.formId);
    }
    
    const queryOptions = usersqquery(q, baseFilter, ["domain"]);
    
    // Include Form version info
    queryOptions.include = [{ model: Form, attributes: ["id", "version", "versionNumber"] }];

    const data = await WebsitesService.findAndCountAll(queryOptions);
    
    res.status(200).json({
      status: 200,
      message: "Websites fetched successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
}

export async function createWebsite(req, res) {
  const t = await sequelize.transaction();
  try {
    const { domain, formId } = req.body;
    
    // Validate input
    if (!domain || !formId) {
      await t.rollback();
      return res.status(400).json({ 
        status: 400, 
        message: "Domain and formId are required" 
      });
    }
    
    // Normalize domain for checking
    const normalizedDomain = domain.toLowerCase().trim();
    
    // Check if domain already exists (only active records)
    const existingWebsite = await WebsitesService.findOne({ 
      where: { domain: normalizedDomain },
      transaction: t 
    });
    if (existingWebsite) {
      await t.rollback();
      return res.status(400).json({ 
        status: 400, 
        message: "Domain already exists" 
      });
    }
    
    // Check form exists
    const form = await FormsService.findOne({ where: { id: formId }, transaction: t });
    if (!form) {
        await t.rollback();
        return res.status(404).json({ status: 404, message: "Form version not found" });
    }

    const newWebsite = await WebsitesService.create({ domain, formId }, { transaction: t });
    
    await t.commit();
    
    // Add domain mapping to cache
    CacheManager.addWebsite(newWebsite.domain, form.version);
    
    res.status(201).json({
      status: 201,
      message: "Website created successfully",
      data: newWebsite,
    });
  } catch (error) {
    if (t) await t.rollback(); // Safe rollback
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        status: 400, 
        message: error.errors ? error.errors.map(e => e.message).join(', ') : error.message 
      });
    }
    
    res.status(500).json({ status: 500, message: error.message });
  }
}

export async function bulkCreateWebsites(req, res) {
  const t = await sequelize.transaction();
  try {
    const { domains, formId } = req.body; // domains is array of strings
    
    if (!Array.isArray(domains) || domains.length === 0) {
        await t.rollback();
        return res.status(400).json({ status: 400, message: "Domains array is required" });
    }

    const form = await FormsService.findOne({ where: { id: formId }, transaction: t });
    if (!form) {
        await t.rollback();
        return res.status(404).json({ status: 404, message: "Form version not found" });
    }

    // Normalize domains
    const normalizedDomains = domains.map(d => d.toLowerCase().trim());
    
    // Check for existing active domains
    const existingWebsites = await WebsitesService.findAll({
      where: { domain: { [Op.in]: normalizedDomains } },
      transaction: t
    });
    
    const existingDomainSet = new Set(existingWebsites.map(w => w.domain));
    
    // Filter out existing domains - only create new ones
    const newDomains = normalizedDomains.filter(domain => !existingDomainSet.has(domain));
    
    if (newDomains.length === 0) {
      await t.rollback();
      return res.status(400).json({ 
        status: 400, 
        message: "All domains already exist. No new websites created.",
        data: {
          total: normalizedDomains.length,
          created: 0,
          skipped: normalizedDomains.length,
          skippedDomains: Array.from(existingDomainSet)
        }
      });
    }

    // Prepare data for new domains only
    const websitesData = newDomains.map(domain => ({
        domain,
        formId
    }));

    const result = await WebsitesService.bulkCreate(websitesData, { 
        transaction: t,
        validate: true
    });

    await t.commit();
    
    // Add all domain mappings to cache
    for (const website of result) {
      CacheManager.addWebsite(website.domain, form.version);
    }

    const responseMessage = existingDomainSet.size > 0
      ? `${result.length} websites created successfully. ${existingDomainSet.size} domains were skipped (already exist).`
      : `${result.length} websites created successfully`;

    res.status(201).json({
      status: 201,
      message: responseMessage,
      data: {
        total: normalizedDomains.length,
        created: result.length,
        skipped: existingDomainSet.size,
        skippedDomains: existingDomainSet.size > 0 ? Array.from(existingDomainSet) : [],
        createdWebsites: result
      }
    });
  } catch (error) {
    if (t) await t.rollback();
    res.status(500).json({ status: 500, message: error.message });
  }
}

export async function updateWebsite(req, res) {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { formId } = req.body;
    
    const website = await WebsitesService.findOne({ where: { id }, transaction: t });
    if (!website) {
        await t.rollback();
        return res.status(404).json({ status: 404, message: "Website not found" });
    }

    if (formId) {
        const form = await FormsService.findOne({ where: { id: formId }, transaction: t });
        if (!form) {
            await t.rollback();
            return res.status(404).json({ status: 404, message: "Target Form not found" });
        }
    }

    await WebsitesService.update(req.body, { where: { id }, transaction: t });
    
    // Fetch updated website with form info
    const updatedWebsite = await WebsitesService.findOne({
      where: { id },
      include: [{ model: Form, attributes: ['version'] }],
      transaction: t
    });
    
    await t.commit();
    
    // Update domain mapping in cache
    if (updatedWebsite && updatedWebsite.Form) {
      CacheManager.updateWebsite(updatedWebsite.domain, updatedWebsite.Form.version);
    }

    res.status(200).json({ status: 200, message: "Website updated successfully" });
  } catch (error) {
    if (t) await t.rollback();
    res.status(500).json({ status: 500, message: error.message });
  }
}

export async function deleteWebsite(req, res) {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    
    // Fetch website first to get domain for cache removal
    const website = await WebsitesService.findOne({ where: { id }, transaction: t });
    if (!website) {
        await t.rollback();
        return res.status(404).json({ status: 404, message: "Website not found" });
    }
    
    const result = await WebsitesService.remove({ where: { id }, transaction: t });
    if (!result) {
        await t.rollback();
        return res.status(404).json({ status: 404, message: "Website not found" });
    }
    
    await t.commit();
    
    // Remove domain mapping from cache
    CacheManager.removeWebsite(website.domain);
    
    res.status(200).json({ status: 200, message: "Website deleted successfully" });
  } catch (error) {
    if (t) await t.rollback();
    res.status(500).json({ status: 500, message: error.message });
  }
}

export async function migrateWebsites(req, res) {
    const t = await sequelize.transaction();
    try {
        const { targetFormId, websiteIds } = req.body;
        
        if (!targetFormId || !websiteIds || !Array.isArray(websiteIds) || websiteIds.length === 0) {
            await t.rollback();
            return res.status(400).json({ status: 400, message: "Invalid migration parameters" });
        }

        const targetForm = await FormsService.findOne({ where: { id: targetFormId }, transaction: t });
        if (!targetForm) {
            await t.rollback();
            return res.status(404).json({ status: 404, message: "Target form not found" });
        }

        // Update all websites
        const [updatedCount] = await WebsitesService.update(
            { formId: targetFormId },
            { 
                where: { 
                    id: { [Op.in]: websiteIds } 
                }, 
                transaction: t 
            }
        );
        
        // Fetch updated websites to get their domains
        const updatedWebsites = await WebsitesService.findAll({
          where: { id: { [Op.in]: websiteIds } },
          transaction: t
        });

        await t.commit();
        
        // Update cache for all affected domains
        for (const website of updatedWebsites) {
          CacheManager.updateWebsite(website.domain, targetForm.version);
        }

        res.status(200).json({
            status: 200,
            message: "Migration successful",
            data: { updatedCount }
        });
    } catch (error) {
        if (t) await t.rollback();
        res.status(500).json({ status: 500, message: error.message });
    }
}
