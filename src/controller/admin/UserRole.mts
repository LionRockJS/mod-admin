import { ControllerMixinDatabase, ControllerMixinView, ControllerMixinViewState, ORM } from '@lionrockjs/central';
import { ControllerState, Controller } from '@lionrockjs/mvc';
import { ModelUser as User, ModelRole as Role } from '@lionrockjs/mod-auth';
import { ControllerMixinORMRead } from '@lionrockjs/mixin-orm';
import { ControllerMixinMultipartForm } from '@lionrockjs/mixin-form';

import ControllerAdmin from '../../ControllerAdmin.mjs';
import ControllerMixinAdminTemplates from "../../controller-mixin/AdminTemplates.mjs";

export default class ControllerAdminUserRole extends ControllerAdmin{
  constructor(request: any) {
    super(request, Role, {roles: new Set(['admin'])});
    this.state.get(ControllerMixinAdminTemplates.TEMPLATES)
      .set('index', 'templates/admin/role/index')
      .set('create', 'templates/admin/role/create')
      .set('read', 'templates/admin/role/edit')
      .set('edit', 'templates/admin/role/edit');
  }

  async action_index(){
    // Roles don't need any special processing for index
    // The base controller handles listing
  }

  async action_read(){
    const role = this.state.get(ControllerMixinORMRead.INSTANCE);
    const database = this.state.get(ControllerMixinDatabase.DATABASES).get('admin');
    
    // Load users that have this role
    await this.loadRoleUsers(role, database);
  }

  async action_edit(){
    const role = this.state.get(ControllerMixinORMRead.INSTANCE);
    const database = this.state.get(ControllerMixinDatabase.DATABASES).get('admin');
    
    // Load users that have this role
    await this.loadRoleUsers(role, database);
  }

  async loadRoleUsers(role: any, database: any){
    // Get all available users
    const allUsers = await ORM.readAll(User, {database, asArray: true}) as any[];
    
    // Load person data for display
    await Promise.all(allUsers.map((user: any) => user.eagerLoad({with: ['Person']})));
    
    // Get role's current users
    const roleUsers = await role.siblings(User);
    
    // Create a map of role's user IDs for quick lookup
    const roleUserIds = new Set(roleUsers.map((u: any) => u.id));
    
    // Mark users as linked if they have this role and set display name
    allUsers.forEach((user: any) => {
      user.linked = roleUserIds.has(user.id);
      user.displayName = user.person ? 
        (user.person.first_name + (user.person.last_name ? ` ${user.person.last_name}` : "")) : 
        `User #${user.id}`;
    });
    
    // Add to template data
    const template = this.state.get(ControllerMixinViewState.TEMPLATE);
    if (!template.data.belongsToMany) {
      template.data.belongsToMany = [];
    }
    
    template.data.belongsToMany.push({
      model: {
        className: User.name,
        name: User.name,
        tableName: (User as any).tableName
      },
      values: roleUsers,
      items: allUsers
    });
  }

  async action_create() {
    // No special data needed for creating a role
  }

  async action_update(){
    // Override the default redirect since route path is 'user-roles' but tableName is 'roles'
    const {id} = this.state.get(ControllerState.PARAMS);
    const instance = this.state.get(ControllerMixinORMRead.INSTANCE);
    const actualId = id || instance?.id;
    
    if(actualId) {
      await (this as any).redirect(`/admin/roles/${actualId}?msg=Role updated successfully.`);
    } else {
      await (this as any).redirect('/admin/roles?msg=Role created successfully.');
    }
  }

  async onExit(){
    if(this.state.get(ControllerState.STATUS) === 500 && this.state.get(ControllerState.ACTION) === 'update'){
      await (this as any).redirect(`/admin/roles?msg=${(this as any).error.message}`);
    }
  }
}