const PocketBase = require("pocketbase/cjs");

const pb = new PocketBase("http://4.190.160.14:8090");

module.exports = pb;