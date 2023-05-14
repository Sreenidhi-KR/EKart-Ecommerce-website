/** @format */
const developmentLogger = require("./developmentLogger");
const productionLogger = require("./productionLogger");

let logger = null;
if (process.env.NODE_ENV === "productionenv") {
  logger = productionLogger();
}

if (process.env.NODE_ENV === "simhaenv") {
  logger = developmentLogger();
}
module.exports = logger;
