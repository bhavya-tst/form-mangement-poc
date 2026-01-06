
import Website from "./model.js";

export const WebsitesService = {
    create: async (data, options={}) => Website.create(data, options),
    get: async (conditions) => Website.findAll(conditions),
    findAll: async (condition) => Website.findAll(condition),
    update: async (data, condition) => Website.update(data, condition),
    remove: async (condition) => Website.destroy(condition),
    findAndCountAll: async (condition) => Website.findAndCountAll(condition),
    count: async (condition) => Website.count(condition),
    bulkCreate: async (data, options) => Website.bulkCreate(data, options),
    findOne: async (conditions) => Website.findOne(conditions),
};
