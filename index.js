export default {
  filename: import.meta.url,
  configs: ['admin', 'edm', 'register']
}

import ControllerAdmin from './classes/ControllerAdmin.mjs';
import HelperCRUD from './classes/helper/CRUD.mjs';
import ControllerMixinExport from './classes/controller-mixin/Export.mjs';
import ControllerMixinUpload from './classes/controller-mixin/Upload.mjs';
import ControllerMixinImport from './classes/controller-mixin/Import.mjs';
import ControllerMixinAdminTemplates from './classes/controller-mixin/AdminTemplates.mjs';
import ControllerMixinCRUDRedirect from './classes/controller-mixin/CRUDRedirect.mjs';
import ControllerAdminHome from './classes/controller/admin/Home.mjs';
import ControllerAdminUser from './classes/controller/admin/User.mjs';
import ControllerAdminUserRole from './classes/controller/admin/UserRole.mjs';
import ControllerSetup from './classes/controller/Setup.mjs';

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
  ControllerMixinAdminTemplates,
  ControllerMixinCRUDRedirect,
  ControllerAdminHome,
  ControllerAdminUser,
  ControllerAdminUserRole,
  ControllerSetup
};
