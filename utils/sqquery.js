/* eslint-disable radix */
import { Op } from "sequelize";
import { dateFilter } from "./service.js";

export const getOpAttributeValue = (attribute, value) => {
  const operators = {
    gt: Op.gt,
    gte: Op.gte,
    lt: Op.lt,
    lte: Op.lte,
    eq: Op.eq,
    ne: Op.ne,
    notBetween: Op.notBetween,
    between: Op.between,
    in: Op.in,
    notIn: Op.notIn,
  };

  return operators[attribute] ? {[operators[attribute]]: value} : null;
};

export const sqquery = (
  q,
  filter,
  searchFrom = [],
  excludeColumnsFromOrder = [],
  excludeFields = []
) => {
  const limit = parseInt(q.limit) || 100;
  const page = parseInt(q.page) || 1;
  const skip = (page - 1) * limit;
  const sort = q.sort || "createdAt";
  const sortBy = q.sortBy || "DESC";
  const search = q?.search || "";

  excludeFields.push(
    "page",
    "sort",
    "limit",
    "fields",
    "sortBy",
    "search",
    "startDate",
    "endDate"
  );
  let where = {...filter, ...dateFilter(q)};
  excludeFields.forEach((el) => delete q[el]);

  Object.keys(q).forEach((v) => {
    if (typeof q[v] === "object") {
      Object.keys(q[v]).forEach((e) => {
        const obj = exports.getOpAttributeValue(e, q[v][e]);
        if (obj) where[v] = obj;
      });
    } else {
      where[v] = q[v];
    }
  });

  if (search && searchFrom.length) {
    const searchData = searchFrom.map((columnName) => ({
      [columnName]: {
        [Op.like]: `%${search}%`,
      },
    }));

    if (Object.keys(where).length) {
      where = {...where, [Op.or]: searchData};
    } else {
      where = {[Op.or]: searchData};
    }
  }

  if (excludeColumnsFromOrder.includes(sort)) {
    return {where, limit, offset: skip};
  }

  return {where, order: [[sort, sortBy]], limit, offset: skip};
};

export const usersqquery = (q,where,searchFrom) => {
  const limit = parseInt(q?.limit) || 10;
  const page = parseInt(q?.page) || 1;
  const skip = (page - 1) * limit;
  const sort = q?.sort || "createdAt";
  const sortBy = q?.sortBy || "DESC";
  const search = q?.search || "";

  if (search && searchFrom.length) {
    const searchData = searchFrom.map((columnName) => ({
      [columnName]: {
        [Op.iLike]: `%${search}%`,
      },
    }));

    if (Object.keys(where).length) {
      where = {...where, [Op.or]: searchData};
    } else {
      where = {[Op.or]: searchData};
    }
  }

  if (q?.limit) {
    return {where,order: [[sort, sortBy]], limit, offset: skip};
  }

  return {where,order: [[sort, sortBy]]};
};
