import { Controller } from '@lionrockjs/mvc'
import { Central, ORM, ControllerMixinDatabase, ControllerMixinMime, ControllerMixinView } from '@lionrockjs/central';
import { ControllerRegister, ModelUser as User } from '@lionrockjs/mod-auth';

export default class ControllerSetup extends Controller{
  static mixins = [...Controller.mixins,
    ControllerMixinMime,
    ControllerMixinView,
    ControllerMixinDatabase
  ];
  constructor(request){
    super(request);
    this.state.get(ControllerMixinDatabase.DATABASE_MAP)
      .set('admin', Central.config.auth.databasePath + '/admin.sqlite');
  }

  async action_setup_post(){
    const database = this.state.get(ControllerMixinDatabase.DATABASES).get('admin');
    const user_count = await ORM.countAll(User, {database});
    if(user_count){
      throw new Error('Setup completed. Please create user with root / admin users.');
    }

    const oldAllow = Central.config.register.allowPostAssignRoleID;
    Central.config.register.allowPostAssignRoleID = true;

    const decorator = new ControllerRegister(this.state.get(Controller.STATE_REQUEST));
    const result = await decorator.execute('register_post');
    if(result.status === 500)this.state.set(Controller.STATE_BODY, result.body);

    Central.config.register.allowPostAssignRoleID = oldAllow;

    await this.redirect(result.headers.location);
  }
}

