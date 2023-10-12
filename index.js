require("@kohanajs/mod-auth");
require("@kohanajs/mixin-orm");
require('kohanajs').addNodeModule(__dirname);
const ControllerAdmin = require('./classes/ControllerAdmin');
const HelperCRUD = require('./classes/helper/CRUD');
const ControllerMixinExport = require('./classes/controller-mixin/Export');
const ControllerMixinUpload = require('./classes/controller-mixin/Upload');
const ControllerMixinImport = require('./classes/controller-mixin/Import');
const ControllerMixinActionLogger = require('./classes/controller-mixin/ActionLogger');
const ControllerMixinAdminTemplates = require('./classes/controller-mixin/AdminTemplates');
const ControllerMixinCRUDRedirect = require('./classes/controller-mixin/CRUDRedirect');

/**
 *
 * @type {{ControllerAdmin: ControllerAdmin, HelperCRUD: HelperCRUD}}
 */
module.exports = {
  ControllerAdmin,
  HelperCRUD,
  ControllerMixinExport,
  ControllerMixinUpload,
  ControllerMixinImport,
  ControllerMixinActionLogger,
  ControllerMixinAdminTemplates,
  ControllerMixinCRUDRedirect
};
