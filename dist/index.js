import { Central } from '@lionrockjs/central';
import ConfigAdmin from './config/admin.mjs';
import ConfigEdm from './config/edm.mjs';
import ConfigRegister from './config/register.mjs';
export default {
    configs: {
        admin: ConfigAdmin,
        edm: ConfigEdm,
        register: ConfigRegister,
    }
};
import ControllerAdmin from './ControllerAdmin.mjs';
import HelperCRUD from './helper/CRUD.mjs';
import ControllerMixinExport from './controller-mixin/Export.mjs';
import ControllerMixinUpload from './controller-mixin/Upload.mjs';
import ControllerMixinImport from './controller-mixin/Import.mjs';
import ControllerMixinAdminTemplates from './controller-mixin/AdminTemplates.mjs';
import ControllerMixinCRUDRedirect from './controller-mixin/CRUDRedirect.mjs';
import ControllerHome from './controller/Home.mjs';
import ControllerAccount from './controller/Account.mjs';
import ControllerAdminHome from './controller/admin/Home.mjs';
import ControllerAdminUser from './controller/admin/User.mjs';
import ControllerAdminUserRole from './controller/admin/UserRole.mjs';
import ControllerSetup from './controller/Setup.mjs';
Central.controllerFiles.set('controller/Home', ControllerHome);
Central.controllerFiles.set('controller/Account', ControllerAccount);
Central.controllerFiles.set('controller/Setup', ControllerSetup);
/**
 *
 * @type {{ControllerAdmin: ControllerAdmin, HelperCRUD: HelperCRUD}}
 */
export { ControllerAdmin, HelperCRUD, ControllerMixinExport, ControllerMixinUpload, ControllerMixinImport, ControllerMixinAdminTemplates, ControllerMixinCRUDRedirect, ControllerAdminHome, ControllerAdminUser, ControllerAdminUserRole, ControllerSetup };
