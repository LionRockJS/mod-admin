import { Controller } from '@lionrockjs/mvc'
import { ControllerMixinMime, ControllerMixinView  } from '@lionrockjs/central';

export default class ControllerTemplate extends Controller {
  static mixins = [...Controller.mixins, ControllerMixinMime, ControllerMixinView];

  constructor(request, controllerName = '', state = new Map()) {
    super(request, state);
    this.languageNames = new Map([['en', 'English'], ['zh-hans', '简体中文']]);

    if( !this.state.get(Controller.STATE_LANGUAGE) )this.state.set(Controller.STATE_LANGUAGE, 'en');
    this.state.set(ControllerMixinView.LAYOUT_FILE, 'layout/default');

    const domain = this.state.get(Controller.STATE_HOSTNAME).split(':')[0];
    // push language, controller, action to layout
    Object.assign(this.state.get(ControllerMixinView.LAYOUT).data, {
      domain,
      controller: controllerName,
      action: this.state.get(Controller.STATE_ACTION),
      language: this.state.get(Controller.STATE_LANGUAGE),
      language_name: this.languageNames.get(this.state.get(Controller.STATE_LANGUAGE)),
      cookie_consent: this.state.get(Controller.STATE_COOKIES)['allow-cookie'],
    });
  }
}