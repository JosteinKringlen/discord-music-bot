import { createLogger, format, transports } from 'winston';

const colorizer = format.colorize();

const consoleFormat = format.combine(
    format.timestamp(),
    format.printf((msg) =>
        colorizer.colorize(
            msg.level,
            `[${msg.timestamp}] [${msg.level.toUpperCase()}] - ${msg.message}`,
        ),
    ),
);

const fileFormat = format.combine(
    format((item) => {
        const itemCopy = { ...item };
        itemCopy.level = itemCopy.level.toUpperCase();
        return itemCopy;
    })(),
    format.timestamp(),
    format.printf(
        ({ timestamp, level, message }) =>
            `[${timestamp}] [${level}] - ${message}`,
    ),
);

const logger = createLogger({
    level: 'debug',
    transports: [
        new transports.Console({ format: consoleFormat }),
        new transports.File({ filename: './combined.log', format: fileFormat }),
    ],
});

export default logger;
