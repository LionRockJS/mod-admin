const {Controller} = require("@kohanajs/core-mvc");
const {ControllerMixinMime, ControllerMixinView, ControllerMixinDatabase, KohanaJS, ORM} = require("kohanajs");
const User = ORM.require('User');
const {ControllerRegister} = require("@kohanajs/mod-auth");

class ControllerSetup extends Controller{
  static mixins = [...Controller.mixins,
    ControllerMixinMime,
    ControllerMixinView,
    ControllerMixinDatabase
  ];
  constructor(request){
    super(request);
    this.state.get(ControllerMixinDatabase.DATABASE_MAP)
      .set('admin', KohanaJS.config.auth.databasePath + '/admin.sqlite');
  }

  async action_setup_post(){
    const database = this.state.get(ControllerMixinDatabase.DATABASES).get('admin');
    const user_count = await ORM.count(User, {database});
    if(user_count){
      throw new Error('Setup completed. Please create user with root / admin users.');
    }

    const oldAllow = KohanaJS.config.register.allowPostAssignRoleID;
    KohanaJS.config.register.allowPostAssignRoleID = true;

    const decorator = new ControllerRegister(this.request);
    const result = await decorator.execute('register_post');
    if(result.status === 500)this.body = result.body;

    KohanaJS.config.register.allowPostAssignRoleID = oldAllow;

    await this.redirect(result.headers.location);
  }
}

module.exports = ControllerSetup;