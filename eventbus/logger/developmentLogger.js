/** @format */
const { createLogger, format, transports } = require("winston");
const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${level}] ${message}`;
});

const developmentLogger = () => {
  return createLogger({
    level: "debug",

    //   format: winston.format.json(),
    format: combine(
      format.colorize(),
      label({ label: "right meow!" }),
      timestamp({
        format: "HH:mm:ss",
      }),
      myFormat
    ),
    //  defaultMeta: { service: "user-service" },
    transports: [
      //   new winston.transports.File({ filename: "error.log", level: "error" }),
      //   new winston.transports.File({ filename: "combined.log" }),
      new transports.Console(),
    ],
  });
};

module.exports = developmentLogger;
