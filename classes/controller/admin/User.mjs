import { Controller, ControllerMixinDatabase, ControllerMixinView, ORM } from '@lionrockjs/central';
import { ControllerMixinAuth, ControllerMixinRegister, ModelUser as User, ModelRole as Role } from '@lionrockjs/mod-auth';
import { IdentifierPassword } from '@lionrockjs/adapter-auth-password';
import { ControllerMixinORMRead } from '@lionrockjs/mixin-orm';

import ControllerAdmin from '../../ControllerAdmin.mjs';
import ControllerMixinAdminTemplates from "../../controller-mixin/AdminTemplates.mjs";
import { ControllerMixinMultipartForm } from '@lionrockjs/mixin-form';

export default class ControllerAdminUser extends ControllerAdmin{
  constructor(request) {
    super(request, User, {roles: new Set(['admin'])});
    this.state.get(ControllerMixinAdminTemplates.TEMPLATES)
      .set('index', 'templates/admin/user/index')
      .set('create', 'templates/admin/user/create')
      .set('read', 'templates/admin/user/edit')
      .set('edit', 'templates/admin/user/edit');
  }

  async action_index(){
    const instances = this.state.get(ControllerMixinORMRead.INSTANCES);
    await Promise.all(
      instances.map(user => user.eagerLoad({with: ['Person']}))
    )

    instances.forEach(
      user => user.name = user.person.first_name + (user.person.last_name ? ` ${user.person.last_name}` : "")
    );
  }

  async action_read(){
    const user = this.state.get(ControllerMixinORMRead.INSTANCE);
    await user.eagerLoad({with: ['Person']});
  }

  async action_create() {
    const database = this.state.get(ControllerMixinDatabase.DATABASES).get('admin')
    this.state.get(ControllerMixinView.TEMPLATE).data.roles = await ORM.readAll(Role, {database});
  }

  async action_create_post(){
    this.state.set(ControllerMixinRegister.STATE_ALLOW_POST_ASSIGN_ROLE, true);
    this.state.set(ControllerMixinAuth.IDENTIFIER, IdentifierPassword);
    this.state.set(ControllerMixinAuth.IDENTIFIER_DATABASE_NAME, 'admin');
    this.state.set(ControllerMixinAuth.DATABASE_NAME, 'admin');
    await ControllerMixinRegister.action_register_post(this.state);


    await this.redirect('/admin/users');
  }

  async action_change_password_post(){
    const {id} = this.state.get(Controller.STATE_PARAMS);
    const $_POST = this.state.get(ControllerMixinMultipartForm.POST_DATA);
    const database = this.state.get(ControllerMixinDatabase.DATABASES).get('admin')

    const newPassword = $_POST['new-password'];

    const identifierInstances = await ORM.readBy(IdentifierPassword.Model, 'user_id', [id], { database , asArray:true});

    //check identifier exist
    if (identifierInstances.length === 0){
      throw new Error('No Password Identifier associate to this user.');
    }

    //update identifier record
    await Promise.all(identifierInstances.map(async it => {
      it.hash = await IdentifierPassword.hash(id, it.name, newPassword);
      await it.write();
    }));

  }

  async onExit(){
    if(this.state.get(Controller.STATE_STATUS) === 500 && this.state.get(Controller.STATE_ACTION) === 'create_post'){
      await this.redirect(`/login?msg=${this.error.message}`);
    }
  }
}