import ControllerAdmin from '../../ControllerAdmin.mjs';

export default class ControllerAdminHome extends ControllerAdmin {
  constructor(request: any) {
    super(request, null, {
      roles: new Set(['staff', 'moderator']),
      log_actions: new Set(['index']),
    });
  }

  async action_index() {
  }
}