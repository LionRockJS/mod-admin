import { Controller } from '@lionrockjs/central';
import { ControllerMixinDatabase, ControllerMixinView, ORM } from '@lionrockjs/central';
import { ControllerMixinAuth, ControllerMixinRegister, ModelUser as User, ModelRole as Role } from '@lionrockjs/mod-auth';
import { IdentifierPassword } from '@lionrockjs/adapter-auth-password';
import ControllerAdmin from '../../ControllerAdmin.mjs';
import ControllerMixinAdminTemplates from "../../controller-mixin/AdminTemplates.mjs";

export default class ControllerAdminUser extends ControllerAdmin{
  constructor(request) {
    super(request, User, {roles: new Set(['admin'])});
    this.state.get(ControllerMixinAdminTemplates.TEMPLATES).set('create', 'templates/admin/user/create');
  }

  async action_index(){
    const instances = this.state.get('instances');
    await Promise.all(
      instances.map(user => user.eagerLoad({with: ['Person']}))
    )

    instances.forEach(
      user => user.name = user.person.first_name + (user.person.last_name ? ` ${user.person.last_name}` : "")
    );

  }

  async action_create() {
    const database = this.state.get(ControllerMixinDatabase.DATABASES).get('admin')
    this.state.get(ControllerMixinView.TEMPLATE).data.roles = await ORM.readAll(Role, {database});
  }

  async action_create_post(){
    this.state.set(ControllerMixinAuth.IDENTIFIER, IdentifierPassword);
    this.state.set(ControllerMixinAuth.IDENTIFIER_DATABASE_NAME, 'admin');
    this.state.set(ControllerMixinAuth.DATABASE_NAME, 'admin');
    await ControllerMixinRegister.action_register_post(this.state);

    await this.redirect('/logout');
  }

  async onExit(){
    if(this.state.get(Controller.STATE_STATUS) === 500 && this.state.get(Controller.STATE_ACTION) === 'create_post'){
      await this.redirect(`/login?msg=${this.error.message}`);
    }
  }
}