import {ControllerMixinDatabase, ORM, Central, ControllerMixinView} from '@lionrockjs/central';
import { ModelUser as User, ModelRole as Role } from '@lionrockjs/mod-auth';
import ControllerTemplate from '../ControllerTemplate.mjs';

export default class ControllerHome extends ControllerTemplate{
  static mixins = [
    ...ControllerTemplate.mixins,
    ControllerMixinDatabase
  ]

  constructor(request) {
    super(request, 'home');

    this.state.get(ControllerMixinDatabase.DATABASE_MAP)
      .set('admin', `${Central.config.auth.databasePath}/admin.sqlite`);
  }

  async action_index() {
    const databases = this.state.get(ControllerMixinDatabase.DATABASES);
    const database = databases.get('admin');
    const usercount = await ORM.countAll(User, { database});
    const roles = await ORM.readAll(Role, {database})
    ControllerMixinView.setTemplate(this.state, 'templates/home', { roles, message: '', allowSignup: usercount === 0 });
  }
}


