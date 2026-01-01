/* eslint-disable no-magic-numbers */
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { createLogger, format, transports, addColors } = winston;
const { combine, timestamp, printf, colorize } = format;

// eslint-disable-next-line no-shadow
const logFormat = printf(({ level = "info", message, timestamp, ...rest }) => {
    // Format object messages to JSON with indentation for readability
    let formattedMessage;
    if (typeof message === "object") {
        formattedMessage = JSON.stringify(message, null, 2);
    } else {
        formattedMessage = message; // If it's a string or other type, keep as is
    }
    return `${timestamp} [${level.toUpperCase()}] : ${formattedMessage}${
        Object.keys(rest).length ? `\n${JSON.stringify(rest, null, 2)}` : ""
    }`;
});

// Create the logger instance
const logger = createLogger({
    level: "silly", // Default logging level
    format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),
    transports: [
        new transports.Console({
            format: combine(
                colorize({ all: true }) // Colorize all levels
            ),
        }),
        // File log without colors, for persistent logging
        new DailyRotateFile({
            filename: "logs/app-%DATE%.log", // Use %DATE% to include the date in the filename
            datePattern: "YYYY-MM-DD", // Log files will be created with date format: app-YYYY-MM-DD.log
            zippedArchive: true, // Optionally, compress older log files
            maxSize: "20m", // Rotate the log when it reaches 20MB
            maxFiles: "14d", // Retain logs for 14 days and delete older logs
            format: combine(timestamp(), logFormat),
        }),
    ],
});

const logLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        verbose: 4,
        debug: 5,
        silly: 6,
    },
    colors: {
        error: "red",
        warn: "yellow",
        info: "green",
        http: "magenta",
        verbose: "blue",
        debug: "cyan",
        silly: "grey",
    },
};

addColors(logLevels.colors);

export default logger;
