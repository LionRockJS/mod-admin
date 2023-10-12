const ControllerAdmin = require('../../ControllerAdmin');

class ControllerAdminHome extends ControllerAdmin {
  constructor(request) {
    super(request, null, {
      roles: new Set(['staff', 'moderator']),
    });
  }

  async action_index() {
  }
}

module.exports = ControllerAdminHome;
