const { ControllerMixinDatabase, ORM, KohanaJS } = require('kohanajs');

const ControllerTemplate = require('../ControllerTemplate');

const User = ORM.require('User');
const Role = ORM.require('Role');

class ControllerHome extends ControllerTemplate{
  static mixins = [...ControllerTemplate.mixins, ControllerMixinDatabase]

  constructor(request) {
    super(request, 'home');

    this.state.get(ControllerMixinDatabase.DATABASE_MAP)
      .set('admin', `${KohanaJS.config.auth.databasePath}/admin.sqlite`);
  }

  async action_index() {
    const databases = this.state.get(ControllerMixinDatabase.DATABASES);
    const database = databases.get('admin');
    const usercount = await ORM.count(User, { database});
    const roles = await ORM.readAll(Role, {database})
    this.setTemplate('templates/home', { roles, message: '', allowSignup: usercount === 0 });
  }
}

module.exports = ControllerHome;
