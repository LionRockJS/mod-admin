import ControllerAdmin from '../../ControllerAdmin.mjs';

export default class ControllerAdminHome extends ControllerAdmin {
  constructor(request) {
    super(request, null, {
      roles: new Set(['staff', 'moderator']),
    });
  }

  async action_index() {
  }
}