"use strict";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import moment from "moment";
import crypto from "crypto";
import axios from "axios";

export const cl = (tag, message = "", level = "info") => {
  if (process.env.log == 1) {
    const types = {
      debug: console.debug,
      error: console.error,
    };
    const logFunction = types[level] || console.log;
    logFunction(tag, message);
  }
};

export const jwtDecoder = async (req) => {
  try {
    if (!req.headers.authorization) {
      throw new Error("Authentication failed: No token provided.");
    }
    const token = req.headers.authorization?.split(" ")[1];
    if(!token) {
      throw new Error("Authentication failed: No token provided.");
    }
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error(error.message || "Enter Valid Jwt Token");
  }
};

export const getJwtToken = (data) => {
  return jwt.sign(data, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIREIN || "30d",
  });
};

export const dateFilter = (query, dateColumn = "createdAt") => {
  const dateFilter = {};
  const { startDate, endDate } = query;
  if (startDate) {
    dateFilter[dateColumn] = {
      [Op.gte]: new Date(startDate),
      [Op.lt]: endDate
        ? new Date(moment(endDate).add(1, "days"))
        : new Date(moment().add(1, "days")),
    };
  }

  return dateFilter;
};

export const dateFilterWithDefault1Month = (query, dateColumn = "createdAt") => {
  const dateFilter = {};
  let { startDate, endDate } = query;

  startDate = startDate
    ? new Date(startDate)
    : new Date(moment().subtract(1, "months"));
  endDate = endDate
    ? new Date(moment(endDate).add(1, "days"))
    : new Date(moment().add(1, "days"));
  dateFilter[dateColumn] = {
    [Op.gte]: startDate,
    [Op.lt]: endDate,
  };

  return {
    dateFilter,
    startDate: moment(startDate).format("YYYY-MM-DD"),
    endDate: moment(endDate).format("YYYY-MM-DD"),
  };
};

export const generateOTP = async () => {
  const OTP = Math.floor(100000 + Math.random() * 900000);
  cl("OTP", OTP);
  return OTP;
};

export const debounce = (func, delay) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

/**
 * Generates a query object based on the user's role and request.
 * @param {Object} params - The parameters for generating the query.
 * @param {Object} params.requestor - The user making the request.
 * @param {string} params.requestor.id - The ID of the user making the request.
 * @param {string} params.requestor.role - The role of the user making the request.
 * @param {Object} params.body - The request body.
 * @param {string} params.body.userId - The user ID from the request body.
 * @param {string} params.role - The role to match against for authorization.
 * @param {string} params.query - The query string.
 * @returns {Object} - The generated query object.
 */
export const userQuery = ({ requestor, body, role = "User", query }) => {
  let givenQuery = {};

  if (requestor?.role === role || body?.userId || query?.userId) {
    givenQuery = {
      userId:
        requestor?.role === role
          ? requestor?.id
          : body?.userId || query?.userId,
    };
  }

  return givenQuery;
};


const { ENCRYPTION_KEY } = process.env;
const IV_LENGTH = 12;

// Encryption function
export const encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  // Get the authentication tag
  const authTag = cipher.getAuthTag();

  // Return IV, encrypted text, and auth tag as a single string
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
};

export const decrypt = (text) => {
  if (!text) {
    throw new Error("No text provided for decryption.");
  }

  const parts = text.split(":");

  if (parts.length !== 3) {
    throw new Error("Invalid encrypted text format. Expected format: iv:authTag:encryptedText.");
  }

  const [ivHex, authTagHex, encryptedText] = parts;

  // Check if any part is undefined or null
  if (!ivHex || !authTagHex || !encryptedText) {
    throw new Error("One or more components of the encrypted text are missing.");
  }

  // Convert parts to Buffers
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  // Create decipher and set the authentication tag
  const decipher = crypto.createDecipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};

export const sendMessageInSlack = async (url, title, text, color) => {
  await responseInClientSlack(url, {
    attachments: [
      {
        title,
        text,
        color,
      },
    ],
  });
};

const responseInClientSlack = async (url, body) => {
  try {
    return await axios.post(url, body, {});
  } catch (err) {
    console.error(err?.message || "Error while sending message to slack");
    return ` `;
  }
};


export const generateFTPCredentials = (input) => {
  // Create SHA-256 hash
  const hashHex = crypto.createHash("sha256").update(input).digest("hex");

  // Username = first 10 chars
  const username = "user_" + hashHex.slice(0, 10);

  // Password = next 16 chars + "!A1"
  const password = hashHex.slice(10, 26) + "!A1";

  return { username, password };
}