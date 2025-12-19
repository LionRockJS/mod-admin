import ControllerAdmin from '../../ControllerAdmin.mjs';
export default class ControllerAdminUserRole extends ControllerAdmin {
    constructor(request: any);
    action_index(): Promise<void>;
    action_read(): Promise<void>;
    action_edit(): Promise<void>;
    loadRoleUsers(role: any, database: any): Promise<void>;
    action_create(): Promise<void>;
    action_update(): Promise<void>;
    onExit(): Promise<void>;
}
