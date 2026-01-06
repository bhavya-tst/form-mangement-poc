
import Sequelize from "sequelize";
import dotenv from "dotenv";
dotenv.config();
const env = process.env?.NODE_ENV;
import config from "./config.js";
const db_config = config[env];
const sequelize = new Sequelize(
    db_config.database,
    db_config.username,
    db_config.password,
    db_config
);

export default sequelize;
    