import ControllerAdmin from '../../ControllerAdmin.mjs';
export default class ControllerAdminHome extends ControllerAdmin {
    constructor(request) {
        super(request, null, {
            roles: new Set(['staff', 'moderator']),
            log_actions: new Set(['index']),
        });
    }
    async action_index() {
    }
}
