
import { FormsService } from "./service.js";
import { usersqquery } from "../../utils/sqquery.js";
import sequelize from "../../configs/db.js";
import { Op } from "sequelize";

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

export async function createForm(req, res) {
  const t = await sequelize.transaction();
  try {
    const { version, isDefault } = req.body;
    
    // If setting as default, ensure no other default exists (DB constraint handles this mostly, but good to check)
    // Actually, DB partial index handles the constraint.
    
    const newForm = await FormsService.create({ version, isDefault }, { transaction: t });
    
    await t.commit();
    res.status(201).json({
      status: 201,
      message: "Form version created successfully",
      data: newForm,
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
