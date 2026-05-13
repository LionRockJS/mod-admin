declare const _default: {
    configs: {
        admin: {
            logPath: string;
        };
        edm: {
            mail: {
                activateCode: {
                    subject: Map<string, string>;
                    text: Map<string, string>;
                    html: Map<string, string>;
                    landing: Map<string, string>;
                };
                resetPassword: {
                    subject: Map<string, string>;
                    text: Map<string, string>;
                    html: Map<string, string>;
                    landing: Map<string, string>;
                };
                username: {
                    subject: Map<string, string>;
                    text: Map<string, string>;
                    html: Map<string, string>;
                };
            };
        };
        register: {
            defaultRole: string;
        };
    };
};
export default _default;
import ControllerAdmin from './ControllerAdmin.mjs';
import HelperCRUD from './helper/CRUD.mjs';
import ControllerMixinExport from './controller-mixin/Export.mjs';
import ControllerMixinUpload from './controller-mixin/Upload.mjs';
import ControllerMixinImport from './controller-mixin/Import.mjs';
import ControllerMixinAdminTemplates from './controller-mixin/AdminTemplates.mjs';
import ControllerMixinCRUDRedirect from './controller-mixin/CRUDRedirect.mjs';
import ControllerAdminHome from './controller/admin/Home.mjs';
import ControllerAdminUser from './controller/admin/User.mjs';
import ControllerAdminUserRole from './controller/admin/UserRole.mjs';
import ControllerSetup from './controller/Setup.mjs';
/**
 *
 * @type {{ControllerAdmin: ControllerAdmin, HelperCRUD: HelperCRUD}}
 */
export { ControllerAdmin, HelperCRUD, ControllerMixinExport, ControllerMixinUpload, ControllerMixinImport, ControllerMixinAdminTemplates, ControllerMixinCRUDRedirect, ControllerAdminHome, ControllerAdminUser, ControllerAdminUserRole, ControllerSetup };
