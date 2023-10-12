/***
 override ControllerAccount in @lionrockjs/mod-auth
***/

import { ControllerMixinView } from '@lionrockjs/central';
import { ControllerMixinAccount, ModelUser as User } from '@lionrockjs/mod-auth';
import { ControllerMixinAccountPassword } from '@lionrockjs/adapter-auth-password';
import ControllerAdmin from '../ControllerAdmin.mjs';

export default class ControllerAccount extends ControllerAdmin {
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