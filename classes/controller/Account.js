/***
 override ControllerAccount in @kohanajs/mod-auth
***/

const { ControllerMixinView, ORM } = require('kohanajs');
const { ControllerMixinAccount } = require('@kohanajs/mod-auth');
const { ControllerMixinAccountPassword } = require("@kohanajs/mod-auth-adapter-password");

const ControllerAdmin = require('../ControllerAdmin');

const User = ORM.require('User');

class ControllerAccount extends ControllerAdmin {
  static mixins = [...ControllerAdmin.mixins,
    ControllerMixinAccount,
    ControllerMixinAccountPassword
  ];

  constructor(request) {
    super(request, User, {
      templates: new Map([
        ['index', 'templates/account/index'],
      ]),
      roles: new Set(['*']),
    });
  }

  async action_index() {
    Object.assign(
      this.state.get(ControllerMixinView.TEMPLATE).data,
      {
        user_full_name: this.request.session.user_meta.full_name,
        user_id: this.request.session.user_id,
        user_role: this.request.session.roles.join(","),
      },
    );
  }

  async action_change_person(){
    this.setTemplate('templates/account/change-name/form', {item: this.state.get(ControllerMixinAccount.PERSON)});
  }

  async action_change_person_post(){}
}

module.exports = ControllerAccount;
