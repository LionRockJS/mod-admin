import ControllerAdmin from '../../ControllerAdmin.mjs';
export default class ControllerAdminUser extends ControllerAdmin {
    constructor(request: any);
    action_index(): Promise<void>;
    action_read(): Promise<void>;
    action_create(): Promise<void>;
    action_create_post(): Promise<void>;
    action_change_password_post(): Promise<void>;
    onExit(): Promise<void>;
}
