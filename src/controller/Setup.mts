import { Central, ORM, ControllerMixinDatabase, ControllerMixinMime, ControllerMixinView } from '@lionrockjs/central';
import { ControllerState, Controller } from '@lionrockjs/mvc';
import { ControllerRegister, ModelUser as User } from '@lionrockjs/mod-auth';

export default class ControllerSetup extends Controller{
  static mixins = [...Controller.mixins,
    ControllerMixinMime,
    ControllerMixinView,
    ControllerMixinDatabase
  ] as any[];
  constructor(request: any){
    super(request);
    this.state.get(ControllerMixinDatabase.DATABASE_MAP)
      .set(
        Central.config.auth.databaseMapName, 
        Central.config.auth.databaseMap.get(Central.config.auth.databaseMapName)
      );
  }

  async action_setup_post(){
    const database = this.state.get(ControllerMixinDatabase.DATABASES).get(Central.config.auth.databaseMapName);
    const user_count = await (ORM as any).countAll(User, {database});

    if(user_count){
      throw new Error('Setup completed. Please create user with root / admin users.');
    }

    const oldAllow = Central.config.register.allowPostAssignRoleID;
    Central.config.register.allowPostAssignRoleID = true;

    const decorator = new ControllerRegister(this.state.get(ControllerState.REQUEST));
    const result = await decorator.execute('register_post');
    if(result.status === 500)this.state.set(ControllerState.BODY, result.body);

    Central.config.register.allowPostAssignRoleID = oldAllow;

    await (this as any).redirect(result.headers.location);
  }
}

