const { KohanaJS } = require('kohanajs');
const path = require('path');

module.exports = {
  logPath: path.normalize(`${KohanaJS.APP_PATH}/../logs`),
};
