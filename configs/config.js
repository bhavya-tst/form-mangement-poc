
import dotenv from "dotenv";
dotenv.config();
const config = {
    development: {
        username: process.env.DEV_USERNAME,
        password: process.env.DEV_PASSWORD,
        database: process.env.DEV_DATABASE,
        host: process.env.DEV_HOST,
        port: 5432,
        dialect: "postgres",
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
        pool: {
            max: 50,
            min: 0,
            acquire: 60000,
            idle: 10000,
            evict: 10000,
        },
        define: {
            schema: process.env.SCHEMA,
            timestamps: true,
        },
        language: "en",
    },
    staging: {
        username: process.env.STAG_USERNAME,
        password: process.env.STAG_PASSWORD,
        database: process.env.STAG_DATABASE,
        host: process.env.STAG_HOST,
        port: 5432,
        dialect: "postgres",
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
        pool: {
            max: 50,
            min: 0,
            acquire: 60000,
            idle: 10000,
            evict: 10000,
        },
        define: {
            schema: process.env.SCHEMA,
            timestamps: true,
        },
        language: "en",
    },
    production: {
        username: process.env.PROD_USERNAME,
        password: process.env.PROD_PASSWORD,
        database: process.env.PROD_DATABASE,
        host: process.env.PROD_HOST,
        port: 5432,
        dialect: "postgres",
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
        pool: {
            max: 250,
            min: 0,
            acquire: 100000,
            idle: 10000,
            evict: 10000,
        },
        define: {
            schema: process.env.SCHEMA,
            timestamps: true,
        },
        language: "en",
    },
};

export default config;
    
    