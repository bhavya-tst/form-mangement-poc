
import Form from "./model.js";

export const FormsService = {
    create: async (data, options={}) => Form.create(data, options),
    get: async (conditions) => Form.findAll(conditions),
    findAll: async (condition) => Form.findAll(condition),
    update: async (data, condition) => Form.update(data, condition),
    remove: async (condition) => Form.destroy(condition),
    findAndCountAll: async (condition) => Form.findAndCountAll(condition),
    count: async (condition) => Form.count(condition),
    bulkCreate: async (data, options) => Form.bulkCreate(data, options),
    findOne: async (conditions) => Form.findOne(conditions),
};
