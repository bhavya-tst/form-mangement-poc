
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
    const queryOptions = usersqquery(q, {}, ["domain"]);
    
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
    
    // Check form exists
    const form = await FormsService.findOne({ where: { id: formId }, transaction: t });
    if (!form) {
        await t.rollback();
        return res.status(404).json({ status: 404, message: "Form version not found" });
    }

    const newWebsite = await WebsitesService.create({ domain, formId }, { transaction: t });
    
    await t.commit();
    
    // Rebuild Cache (Asynchronously)
    CacheManager.rebuild();
    
    res.status(201).json({
      status: 201,
      message: "Website created successfully",
      data: newWebsite,
    });
  } catch (error) {
    if (t) await t.rollback(); // Safe rollback
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

    // Normalize and prepare data
    const websitesData = domains.map(d => ({
        domain: d.toLowerCase().trim(),
        formId
    }));

    const result = await WebsitesService.bulkCreate(websitesData, { 
        transaction: t,
        ignoreDuplicates: false, // User constraint: "domain (string, unique)". We should probably fail or handle duplicates.
        // If ignoreDuplicates is true, it skips. If false, it throws.
        // Let's assume we want to fail if any exist, or use updateOnDuplicate if needed.
        // Requirement implies "Logic: Validate... BulkCreate".
        validate: true
    });

    await t.commit();
    CacheManager.rebuild();

    res.status(201).json({
      status: 201,
      message: `${result.length} websites created successfully`,
      data: result
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
    await t.commit();
    CacheManager.rebuild();

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
    const result = await WebsitesService.remove({ where: { id }, transaction: t });
    if (!result) {
        await t.rollback();
        return res.status(404).json({ status: 404, message: "Website not found" });
    }
    await t.commit();
    CacheManager.rebuild();
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

        await t.commit();
        CacheManager.rebuild();

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
