export default {
  filename: import.meta.url,
  configs: ['admin', 'edm', 'register']
}

import ControllerAdmin from './classes/ControllerAdmin.mjs';
import HelperCRUD from './classes/helper/CRUD.mjs';
import ControllerMixinExport from './classes/controller-mixin/Export.mjs';
import ControllerMixinUpload from './classes/controller-mixin/Upload.mjs';
import ControllerMixinImport from './classes/controller-mixin/Import.mjs';
import ControllerMixinActionLogger from './classes/controller-mixin/ActionLogger.mjs';
import ControllerMixinAdminTemplates from './classes/controller-mixin/AdminTemplates.mjs';
import ControllerMixinCRUDRedirect from './classes/controller-mixin/CRUDRedirect.mjs';

/**
 *
 * @type {{ControllerAdmin: ControllerAdmin, HelperCRUD: HelperCRUD}}
 */
export {
  ControllerAdmin,
  HelperCRUD,
  ControllerMixinExport,
  ControllerMixinUpload,
  ControllerMixinImport,
  ControllerMixinActionLogger,
  ControllerMixinAdminTemplates,
  ControllerMixinCRUDRedirect
};
