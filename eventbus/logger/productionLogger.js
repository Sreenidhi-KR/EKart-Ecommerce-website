/** @format */
const { createLogger, format, transports } = require("winston");
const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp};${message}`;
});

const productionLogger = () => {
  return createLogger({
    level: "info",

    //   format: winston.format.json(),
    format: combine(label({ label: "right meow!" }), timestamp({}), myFormat),
    //  defaultMeta: { service: "user-service" },
    transports: [
      //   new winston.transports.File({ filename: "error.log", level: "error" }),
      new transports.File({ filename: "system.log" }),
      new transports.Console(),
    ],
  });
};

module.exports = productionLogger;
