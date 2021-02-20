jest.setTimeout(30000); // 10s timeout as default

require('../models/User')
const mongoose = require('mongoose')
const keys = require('../config/keys')

mongoose.Promise = global.Promise; // tell mongoose to use nodejs global promise
mongoose.connect(keys.mongoURI, { useMongoClient: true });

// need to add a jest script in package.json to run this setup file on every test file
// "jest": {
//   "setupTestFrameworkScriptFile": "./tests/setup.js"
// },
// see package.json for details